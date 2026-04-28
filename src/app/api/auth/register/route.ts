import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
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

    if (username.length < 3) {
      return NextResponse.json(
        { error: '用户名至少需要3个字符' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      );
    }

    // 哈希加密密码
    const hashedPassword = await hash(password, 12);
    const now = Math.floor(Date.now() / 1000);

    // 创建用户
    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        createdAt: now,
      })
      .returning({ id: users.id, username: users.username });

    const user = newUser[0];

    // 设置会话
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set('user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Register API] Error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后再试' },
      { status: 500 }
    );
  }
}
