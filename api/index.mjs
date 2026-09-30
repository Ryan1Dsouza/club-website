import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';

process.env.DATABASE_PATH = '/tmp/nucleus.sqlite';
const db = openDatabase();
export default createApp(db, { production: true, limits: false });
