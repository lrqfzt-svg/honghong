import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'honghong.db');

console.log('🔍 查询数据库...');
console.log(`📍 数据库文件: ${dbPath}`);
console.log('');

const db = new Database(dbPath);

// 查询所有用户
const users = db.prepare('SELECT id, username, created_at FROM users').all();

console.log(`👤 共找到 ${users.length} 个用户:`);
console.log('');

if (users.length === 0) {
  console.log('  暂无用户数据');
} else {
  users.forEach((user: any) => {
    // 格式化时间戳
    const date = new Date(user.created_at * 1000);
    const dateStr = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    console.log(`  🆔 ID: ${user.id}`);
    console.log(`  👤 用户名: ${user.username}`);
    console.log(`  📅 注册时间: ${dateStr}`);
    console.log('  ──────────────────────');
  });
}

db.close();
