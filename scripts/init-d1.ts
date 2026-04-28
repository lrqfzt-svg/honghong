#!/usr/bin/env tsx
// D1 数据库初始化脚本

import { drizzle } from 'drizzle-orm/d1';
import { createSQLiteDB } from '@miniflare/shared';
import * as schema from '../src/lib/db/schema-d1';

async function initDB() {
  console.log('初始化 D1 数据库 (本地模拟)...');

  // 创建本地 SQLite 数据库用于测试
  const db = await createSQLiteDB('./data/honghong.db');
  const orm = drizzle(db as any, { schema });

  // 创建表
  console.log('创建 users 表...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  console.log('创建 orders 表...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT,
      user_id INTEGER NOT NULL,
      amount INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      remark TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  console.log('✅ 数据库初始化完成!');

  // 可选：插入测试数据
  const now = Math.floor(Date.now() / 1000);
  const hasUsers = await db.prepare('SELECT 1 FROM users LIMIT 1').all();

  if (hasUsers.results.length === 0) {
    console.log('插入测试数据...');
    await db.exec(`
      INSERT INTO users (username, email, password, is_admin, created_at)
      VALUES ('admin', 'admin@example.com', 'hashed-password-here', 1, ${now})
    `);
    console.log('✅ 测试数据已插入');
  }

  db.close();
}

initDB().catch(console.error);
