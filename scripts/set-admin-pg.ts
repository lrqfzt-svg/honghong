import { Pool } from 'pg';
import { hash } from 'bcrypt';
import 'dotenv/config';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';

    console.log(`创建管理员用户...`);
    console.log(`  用户名: ${username}`);
    console.log(`  密码: ${password}`);

    // 哈希密码
    const hashedPassword = await hash(password, 12);
    const now = Math.floor(Date.now() / 1000);

    // 检查用户是否已存在
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    let userId;

    if (existingResult.rows.length > 0) {
      userId = existingResult.rows[0].id;
      console.log(`用户已存在，更新为管理员...`);
      await pool.query(
        'UPDATE users SET is_admin = true WHERE id = $1',
        [userId]
      );
    } else {
      // 创建新用户
      const result = await pool.query(
        'INSERT INTO users (username, password, is_admin, created_at) VALUES ($1, $2, true, $3) RETURNING id',
        [username, hashedPassword, now]
      );
      userId = result.rows[0].id;
      console.log(`用户创建成功！`);
    }

    console.log('');
    console.log('✅ 管理员设置完成！');
    console.log(`   用户ID: ${userId}`);
    console.log(`   现在可以使用 "${username}" / "${password}" 登录`);
    console.log(`   登录后访问 /admin 即可进入管理后台`);

  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
