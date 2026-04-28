import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// PostgreSQL 配置 (本地开发)
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/pg',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/honghong',
  },
});

// SQLite/D1 配置 (Cloudflare)
export const d1Config = defineConfig({
  schema: './src/lib/db/schema-d1.ts',
  out: './drizzle/d1',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/honghong.db',
  },
});

