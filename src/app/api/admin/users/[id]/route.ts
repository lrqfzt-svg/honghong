import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, type UserStatus } from '@/lib/db/schema';

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
    const userId = parseInt(id);

    if (!status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    await db
      .update(users)
      .set({ status: status as UserStatus })
      .where(eq(users.id, userId));

    const updatedUser = await db
      .select({ id: users.id, username: users.username, status: users.status })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('[Admin User Update API] Error:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}
