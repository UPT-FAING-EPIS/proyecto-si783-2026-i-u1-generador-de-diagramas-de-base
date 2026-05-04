import { config } from 'dotenv';
import path from 'path';

// Buscar .env en la carpeta del frontend
config({ path: path.resolve(__dirname, '../../apps/frontend/.env.local') });

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
