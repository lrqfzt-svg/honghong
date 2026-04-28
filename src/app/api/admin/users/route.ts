import { NextRequest, NextResponse } from 'next/server';
import { eq, like, and, desc, count } from 'drizzle-orm';
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
      conditions.push(like(users.username, `%${search}%`));
    }
    if (statusFilter) {
      conditions.push(eq(users.status, statusFilter as UserStatus));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 查询总数
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    const total = totalResult[0].count;

    // 查询分页数据
    const data = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        status: users.status,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
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
    console.error('[Admin Users List API] Error:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}
