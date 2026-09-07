import { unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function globalTeardown() {
  const dbPath = path.resolve(__dirname, '..', '..', 'data', 'test-calendar.db');
  try {
    unlinkSync(dbPath);
  } catch {
    // file may not exist — OK
  }
}
