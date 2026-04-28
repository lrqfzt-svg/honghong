import { NextRequest, NextResponse } from 'next/server';
import { eq, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, orders } from '@/lib/db/schema';

async function checkAdminAuth(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;
  if (!userId) return { error: '未登录', status: 401 };

  const user = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, parseInt(userId)))
    .limit(1);

  if (user.length === 0) return { error: '用户不存在', status: 401 };
  if (!user[0].isAdmin) return { error: '需要管理员权限', status: 403 };

  return { userId: parseInt(userId) };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 24 * 60 * 60;

    // 用户统计
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const allUsers = await db.select({ createdAt: users.createdAt }).from(users);
    const recentUsersCount = allUsers.filter(
      (u) => typeof u.createdAt === 'number' && u.createdAt >= oneDayAgo
    ).length;

    // 订单统计
    const totalOrdersResult = await db.select({ count: count() }).from(orders);
    const allOrders = await db.select({ createdAt: orders.createdAt }).from(orders);
    const recentOrdersCount = allOrders.filter(
      (o) => typeof o.createdAt === 'number' && o.createdAt >= oneDayAgo
    ).length;

    // 总金额
    let totalAmount = 0;
    try {
      const allOrders = await db.select({ amount: orders.amount }).from(orders);
      totalAmount = allOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    } catch (e) {
      // 忽略
    }

    return NextResponse.json({
      totalUsers: totalUsersResult[0].count,
      recentUsers: recentUsersCount,
      totalOrders: totalOrdersResult[0].count,
      recentOrders: recentOrdersCount,
      totalAmount,
    });
  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
