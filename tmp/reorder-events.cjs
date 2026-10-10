const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

const desiredOrder = [
  'inauguration',
  'linkedin',
  'dev',
  'khoj',
  'n8n',
  'noesis',
  'unlocked',
  'coding'
];

async function main() {
  const { data: events, error } = await supabase.from('events').select('*').order('starts_at', { ascending: true });
  if (error) {
    console.error('Error fetching events', error);
    return;
  }
  
  console.log("Current events:");
  events.forEach(e => console.log(e.id, e.title, e.starts_at));

  const baseDate = new Date('2023-01-01T10:00:00Z');
  
  for (let i = 0; i < desiredOrder.length; i++) {
    const key = desiredOrder[i];
    const event = events.find(e => e.title.toLowerCase().includes(key.toLowerCase()) || e.title.toLowerCase() === key.toLowerCase() || (key === 'linkedin' && e.title.toLowerCase().includes('linkedin')) || (key === 'dev' && e.title.toLowerCase().includes('dev')) || (key === 'inauguration' && e.title.toLowerCase().includes('inaugur')));
    
    if (event) {
      const newDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString();
      console.log(`Updating ${event.title} to ${newDate}`);
      await supabase.from('events').update({ starts_at: newDate }).eq('id', event.id);
    } else {
      console.log(`Could not find event for ${key}`);
    }
  }
  console.log("Done");
}

main();
