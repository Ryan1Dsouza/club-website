import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://diqzjvlcowxhbzrvplqb.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NVP5s5fJMyLrAJVZvK0F5w_CbOcbEru';

// Provide email and password as arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node migrate-events.mjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log(`Logging into Supabase as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }
  console.log('Logged in successfully!');

  // Open SQLite database
  const dbPath = resolve('./data/nucleus.sqlite');
  console.log(`Reading local database from ${dbPath}...`);
  const db = new DatabaseSync(dbPath);

  // Get events
  const events = db.prepare("SELECT id, body FROM content WHERE kind = 'events'").all();
  const photos = db.prepare("SELECT id, event_id, name, mime, data, position FROM event_photos ORDER BY position").all();

  console.log(`Found ${events.length} events and ${photos.length} photos.`);

  for (const row of events) {
    const event = JSON.parse(row.body);
    
    // 1. Insert into Supabase table
    console.log(`Inserting event: ${event.title} into Supabase...`);
    const { error: insertError } = await supabase
      .from('events')
      .insert({
        id: event.id,
        title: event.title,
        description: event.description,
        starts_at: event.startsAt,
        ends_at: event.endsAt || event.startsAt,
        location: event.location,
        category: event.category,
        registration_url: event.registrationUrl || null,
        album_url: event.albumUrl || null,
        published: event.published !== false
      });

    if (insertError) {
      console.error(`Failed to insert event ${event.title}:`, insertError.message);
      continue;
    }

    const eventPhotos = photos.filter(p => p.event_id === event.id);
    console.log(`Found ${eventPhotos.length} photos for event ${event.title}`);

    for (const photo of eventPhotos) {
      const extension = photo.mime.split('/')[1] || 'png';
      const path = `${authData.user.id}/${photo.id}.${extension}`;
      console.log(`Uploading photo ${photo.name} for ${event.title}...`);
      
      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(path, photo.data, {
          contentType: photo.mime,
          upsert: true
        });

      if (uploadError) {
        console.error(`Failed to upload photo ${photo.name}:`, uploadError.message);
      } else {
        const photo_url = `${SUPABASE_URL}/storage/v1/object/public/event-photos/${path}`;
        
        const { error: photoInsertError } = await supabase
          .from('event_photos')
          .insert({
            id: photo.id,
            event_id: event.id,
            name: photo.name,
            photo_url: photo_url,
            photo_path: path,
            position: photo.position
          });

        if (photoInsertError) {
          console.error(`Failed to insert photo record ${photo.name}:`, photoInsertError.message);
        }
      }
    }
  }

  console.log('Event migration complete!');
}

run().catch(console.error);
