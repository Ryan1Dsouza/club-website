import { createClient } from '@supabase/supabase-js';
import { resolve } from 'node:path';
import { readdirSync, readFileSync, statSync } from 'node:fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://diqzjvlcowxhbzrvplqb.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NVP5s5fJMyLrAJVZvK0F5w_CbOcbEru';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node migrate-workshops.mjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WORKSHOP_STATIONS = [
  { id: 'inauguration', title: 'Inauguration', folders: ['inauguration'] },
  { id: 'dev', title: 'Dev', folders: ['dev'] },
  { id: 'khoj', title: 'Khoj', folders: ['khoj'] },
  { id: 'linkedin', title: 'LinkedIn', folders: ['linkedin'] },
  { id: 'n8n', title: 'n8n', folders: ['n8n'] },
  { id: 'noesis', title: 'Noesis', folders: ['noesis'] },
  { id: 'unlocked', title: 'Unlocked', folders: ['unlocked'] },
  { id: 'coding', title: 'Coding', folders: ['coding'] },
];

async function run() {
  console.log(`Logging into Supabase as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }
  console.log('Logged in successfully!');

  // Optional: Clean up existing events to avoid duplicates
  console.log('Cleaning up existing dummy events...');
  await supabase.from('events').delete().neq('id', 'dummy'); // delete all

  const baseDate = new Date();
  
  for (let i = 0; i < WORKSHOP_STATIONS.length; i++) {
    const station = WORKSHOP_STATIONS[i];
    const eventId = station.id;
    
    console.log(`Inserting event: ${station.title}...`);
    
    // Stagger dates slightly for ordering
    const startsAt = new Date(baseDate.getTime() - i * 86400000);
    const endsAt = new Date(startsAt.getTime() + 3600000);

    const { error: insertError } = await supabase
      .from('events')
      .insert({
        id: eventId,
        title: station.title,
        description: `A moment from ${station.title}. The Nucleus community came together to explore new ideas, learn with one another, and share what they discovered.`,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        location: 'St. Joseph Engineering College',
        category: 'Workshop',
        published: true
      });

    if (insertError) {
      console.error(`Failed to insert event ${station.title}:`, insertError.message);
      continue;
    }

    let position = 0;
    for (const folder of station.folders) {
      const folderPath = resolve(`./workshops/${folder}`);
      let files = [];
      try {
        files = readdirSync(folderPath);
      } catch(e) {
        console.warn(`Folder not found: ${folderPath}`);
        continue;
      }
      
      const photos = files.filter(f => f.endsWith('.avif') || f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
      console.log(`Found ${photos.length} photos in ${folder}`);

      for (const photo of photos) {
        const photoId = crypto.randomUUID();
        const extension = photo.split('.').pop();
        let mime = 'image/jpeg';
        if (extension === 'avif') mime = 'image/avif';
        if (extension === 'png') mime = 'image/png';
        if (extension === 'webp') mime = 'image/webp';
        
        const path = `${authData.user.id}/${photoId}.${extension}`;
        console.log(`Uploading photo ${photo} to ${path}...`);
        
        const photoData = readFileSync(resolve(folderPath, photo));
        
        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(path, photoData, {
            contentType: mime,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload photo ${photo}:`, uploadError.message);
          continue;
        }

        const photo_url = `${SUPABASE_URL}/storage/v1/object/public/event-photos/${path}`;
        
        const { error: photoInsertError } = await supabase
          .from('event_photos')
          .insert({
            id: photoId,
            event_id: eventId,
            name: photo,
            photo_url: photo_url,
            photo_path: path,
            position: position++
          });

        if (photoInsertError) {
          console.error(`Failed to insert photo record ${photo}:`, photoInsertError.message);
        }
      }
    }
  }

  console.log('Workshops migration complete!');
}

run().catch(console.error);
