import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAdminAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    const orderId = parseInt(id);
    const order = await db
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
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    return NextResponse.json({ order: order[0] });
  } catch (error) {
    console.error('[Admin Order Detail API] Error:', error);
    return NextResponse.json({ error: '获取订单详情失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAdminAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    const { status } = await request.json();
    const orderId = parseInt(id);

    if (!status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (!['pending', 'paid', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    await db
      .update(orders)
      .set({ status: status as OrderStatus })
      .where(eq(orders.id, orderId));

    const updatedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    return NextResponse.json({ order: updatedOrder[0] });
  } catch (error) {
    console.error('[Admin Order Update API] Error:', error);
    return NextResponse.json({ error: '更新订单失败' }, { status: 500 });
  }
}
