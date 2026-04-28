import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'honghong.db');
const db = new Database(dbPath);

console.log('修复时间戳（毫秒→秒）...');

// 修复 users
const users = db.prepare('SELECT id, created_at FROM users').all() as any[];
for (const u of users) {
  if (u.created_at && u.created_at > 9999999999) {
    const newTs = Math.floor(u.created_at / 1000);
    db.prepare('UPDATE users SET created_at = ? WHERE id = ?').run(newTs, u.id);
    console.log(`  用户 ${u.id}: ${u.created_at} → ${newTs}`);
  }
}

console.log('');
console.log('验证修复后：');
const users2 = db.prepare('SELECT id, username, created_at FROM users').all() as any[];
users2.forEach((u) => {
  console.log(`  [${u.id}] ${u.username} @ ${u.created_at} (${new Date(u.created_at * 1000).toLocaleString()})`);
});

db.close();
console.log('');
console.log('✅ 时间戳修复完成！');
