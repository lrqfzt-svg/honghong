import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema-d1';

// Cloudflare D1 数据库连接
// 在 Pages 中通过 env.DB 访问
export function getDB(env: { DB: any }) {
  return drizzle(env.DB, { schema });
}

export { schema };
