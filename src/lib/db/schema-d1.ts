import { sqliteTable, integer, text, blob } from 'drizzle-orm/sqlite-core';

// 用户状态枚举
export type UserStatus = 'active' | 'inactive';

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email'),
  password: text('password').notNull(),
  status: text('status').notNull().default('active'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'number' }).notNull(), // UNIX 时间戳
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// 订单状态枚举
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled';

export const orders = sqliteTable('orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderNo: text('order_no'),
  userId: integer('user_id', { mode: 'number' }).notNull(),
  amount: integer('amount', { mode: 'number' }),
  status: text('status').notNull().default('pending'),
  remark: text('remark'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
