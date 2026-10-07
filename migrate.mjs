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
  console.error('Usage: node migrate.mjs <email> <password>');
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

  // Get team members
  const teamMembers = db.prepare('SELECT id, body, position FROM content WHERE kind = ?').all('team');
  const photos = db.prepare('SELECT member_id, mime, data FROM member_photos').all();

  console.log(`Found ${teamMembers.length} team members and ${photos.length} photos.`);

  for (const row of teamMembers) {
    const member = JSON.parse(row.body);
    const photo = photos.find(p => p.member_id === member.id);
    
    let photo_path = null;
    let photo_url = null;

    // 1. Upload photo if exists
    if (photo) {
      const extension = photo.mime.split('/')[1] || 'png';
      const path = `${authData.user.id}/${member.id}.${extension}`;
      console.log(`Uploading photo for ${member.name}...`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(path, photo.data, {
          contentType: photo.mime,
          upsert: true
        });

      if (uploadError) {
        console.error(`Failed to upload photo for ${member.name}:`, uploadError.message);
      } else {
        photo_path = path;
        photo_url = `${SUPABASE_URL}/storage/v1/object/public/team-photos/${path}`;
      }
    }

    // 2. Insert into Supabase table
    console.log(`Inserting ${member.name} into Supabase...`);
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        role: member.role,
        photo_url: photo_url,
        photo_path: photo_path
      });

    if (insertError) {
      console.error(`Failed to insert ${member.name}:`, insertError.message);
    }
  }

  console.log('Migration complete!');
}

run().catch(console.error);
