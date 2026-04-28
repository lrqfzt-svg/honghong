import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const user = existingUser[0];

    // 验证密码
    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    // 设置会话
    const response = NextResponse.json({ user: userWithoutPassword });
    response.cookies.set('user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后再试' },
      { status: 500 }
    );
  }
}
