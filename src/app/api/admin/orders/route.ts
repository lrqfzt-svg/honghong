import { NextRequest, NextResponse } from 'next/server';
import { eq, like, and, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, users, type OrderStatus } from '@/lib/db/schema';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || '';

    // 构建查询条件
    const conditions = [];
    if (search) {
      conditions.push(like(orders.orderNo, `%${search}%`));
    }
    if (statusFilter) {
      conditions.push(eq(orders.status, statusFilter as OrderStatus));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 查询总数
    const totalResult = await db
      .select({ count: count() })
      .from(orders)
      .where(whereClause);
    const total = totalResult[0].count;

    // 查询分页数据，关联用户
    const data = await db
      .select({
        id: orders.id,
        orderNo: orders.orderNo,
        userId: orders.userId,
        amount: orders.amount,
        status: orders.status,
        remark: orders.remark,
        createdAt: orders.createdAt,
        username: users.username,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[Admin Orders List API] Error:', error);
    return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId, amount, remark } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const now = Math.floor(Date.now() / 1000);

    const newOrder = await db
      .insert(orders)
      .values({
        orderNo,
        userId,
        amount: amount || 0,
        remark,
        createdAt: now,
      })
      .returning();

    return NextResponse.json({ order: newOrder[0] }, { status: 201 });
  } catch (error) {
    console.error('[Admin Order Create API] Error:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
