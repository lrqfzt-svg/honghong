-- D1 数据库初始化迁移

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT,
  user_id INTEGER NOT NULL,
  amount INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  remark TEXT,
  created_at INTEGER NOT NULL
);

-- 可选：创建索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
