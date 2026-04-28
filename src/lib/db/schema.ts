import { pgTable, integer, text, boolean, serial } from 'drizzle-orm/pg-core';

// 用户状态枚举
export type UserStatus = 'active' | 'inactive';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'), // 新增：邮箱
  password: text('password').notNull(),
  status: text('status').notNull().default('active'), // 新增：用户状态
  isAdmin: boolean('is_admin').notNull().default(false), // 新增：管理员标记
  createdAt: integer('created_at').notNull(), // 存储 UNIX 时间戳（秒）
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// 订单状态枚举
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNo: text('order_no'), // 订单号
  userId: integer('user_id').notNull(), // 关联用户
  amount: integer('amount'), // 金额（以分为单位存储整数，避免浮点数问题）
  status: text('status').notNull().default('pending'), // 订单状态
  remark: text('remark'), // 备注
  createdAt: integer('created_at').notNull(), // 存储 UNIX 时间戳（秒）
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
