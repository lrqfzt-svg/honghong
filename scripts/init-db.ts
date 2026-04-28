import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'honghong.db');
const dataDir = path.dirname(dbPath);

// 确保 data 目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('正在初始化数据库...');

const db = new Database(dbPath);

// 创建或更新 users 表（添加新字段）
// 先检查是否有现有表
const existingTable = db.prepare("PRAGMA table_info(users)").all() as any[];
const hasStatus = existingTable.some(col => col.name === 'status');
const hasIsAdmin = existingTable.some(col => col.name === 'is_admin');
const hasEmail = existingTable.some(col => col.name === 'email');

if (existingTable.length === 0) {
  // 新表：完整创建
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
} else {
  // 现有表：按需添加新列
  if (!hasStatus) {
    db.exec(`ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`);
  }
  if (!hasIsAdmin) {
    db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0`);
  }
  if (!hasEmail) {
    db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
  }
  // 确保已有记录有 created_at
  const now = Math.floor(Date.now() / 1000);
  db.exec(`UPDATE users SET created_at = ${now} WHERE created_at IS NULL`);
}

// 创建索引
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
`);

// 创建 orders 表
const existingOrdersTable = db.prepare("PRAGMA table_info(orders)").all() as any[];
if (existingOrdersTable.length === 0) {
  db.exec(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT,
      user_id INTEGER NOT NULL,
      amount INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      remark TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
}

console.log('✅ 数据库初始化完成！');
console.log(`📍 数据库文件位置: ${dbPath}`);

// 检查创建结果
const usersTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
const ordersTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get();

if (usersTable) console.log('✅ users 表已就绪！');
if (ordersTable) console.log('✅ orders 表已就绪！');

db.close();
