import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const user = await db
      .select({ id: users.id, username: users.username, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    }

    if (!user[0].isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    return NextResponse.json({ user: user[0] });
  } catch (error) {
    console.error('[Admin Me API] Error:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
