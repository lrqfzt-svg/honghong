#!/usr/bin/env tsx
// D1 数据库初始化脚本 - 本地 SQLite 版本

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

async function initDB() {
  console.log('初始化 D1 数据库 (本地 SQLite)...');

  // 确保 data 目录存在
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 创建本地 SQLite 数据库
  const db = new Database(path.join(dataDir, 'honghong.db'));

  // 创建表
  console.log('创建 users 表...');
  db.exec(`
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
  db.exec(`
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
  const hasUsers = db.prepare('SELECT 1 FROM users LIMIT 1').get();

  if (!hasUsers) {
    console.log('插入测试数据...');
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, is_admin, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run('admin', 'admin@example.com', 'hashed-password-here', 1, now);
    console.log('✅ 测试数据已插入');
  }

  db.close();
}

initDB().catch(console.error);
