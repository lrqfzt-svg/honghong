import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'honghong.db');

console.log('=== 设置管理员 ===');
console.log('数据库位置：', dbPath);

const db = new Database(dbPath);

try {
  // 显示所有用户
  const users = db.prepare('SELECT id, username, is_admin FROM users').all() as any[];

  if (users.length === 0) {
    console.log('');
    console.log('❌ 暂无用户，请先在网站注册一个用户');
    process.exit(1);
  }

  console.log('');
  console.log('当前用户列表：');
  users.forEach((u) => {
    console.log(`  [${u.id}] ${u.username}${u.is_admin ? ' (管理员)' : ''}`);
  });
  console.log('');

  // 询问要设置哪个用户
  const args = process.argv.slice(2);
  let userId: number;

  if (args.length > 0 && !isNaN(parseInt(args[0]))) {
    userId = parseInt(args[0]);
  } else {
    // 简单实现，默认设置第一个用户为管理员
    userId = users[0].id;
    console.log(`⚠️ 未指定用户，默认设置用户 ${users[0].username} (ID=${userId}) 为管理员`);
  }

  const targetUser = users.find((u) => u.id === userId);
  if (!targetUser) {
    console.log('❌ 找不到该用户');
    process.exit(1);
  }

  // 更新用户
  const result = db
    .prepare('UPDATE users SET is_admin = 1 WHERE id = ?')
    .run(userId);

  if (result.changes > 0) {
    console.log(`✅ 成功设置 ${targetUser.username} 为管理员！`);
    console.log('');
    console.log('现在可以：');
    console.log('1. 重启开发服务器（如果正在运行）');
    console.log('2. 用该用户登录');
    console.log('3. 访问 http://localhost:5000/admin');
  } else {
    console.log('❌ 更新失败');
  }
} catch (e) {
  console.error('操作出错：', e);
} finally {
  db.close();
}
