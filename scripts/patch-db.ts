import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'honghong.db');
const db = new Database(dbPath);

const now = Math.floor(Date.now() / 1000);

console.log('更新用户表的 created_at...');
const userResult = db.prepare('UPDATE users SET created_at = ? WHERE created_at IS NULL').run(now);
console.log(`更新了 ${userResult.changes} 条用户记录`);

console.log('');
console.log('验证用户数据：');
const users = db.prepare('SELECT id, username, created_at FROM users').all() as any[];
users.forEach((u) => {
  console.log(`  [${u.id}] ${u.username} @ ${u.created_at}`);
});

db.close();
console.log('');
console.log('✅ 数据库修复完成！');
