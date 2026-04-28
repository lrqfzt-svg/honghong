# 认证功能设置指南

## 功能概览

已添加用户注册和登录功能：
- 用户注册（用户名 + 密码，密码使用 bcrypt 加密）
- 用户登录
- 用户登出
- 会话管理（使用 HTTP-only Cookie）

## 数据库设置

本项目使用 SQLite 数据库，无需额外安装数据库服务。

### 1. 初始化数据库

在项目根目录运行：

```bash
pnpm db:init
```

这会自动：
- 创建 `data/honghong.db` 数据库文件
- 创建 `users` 表
- 创建必要的索引

### 2. 配置环境变量

`.env` 文件已配置好，默认设置：

```env
DATABASE_URL="./data/honghong.db"
```

### 3. 开始使用

数据库已准备完毕！现在可以启动开发服务器：

```bash
pnpm dev
```

访问 http://localhost:5000 开始使用注册和登录功能！

## 文件结构

新增的文件：

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts       # 登录 API
│   │       ├── register/route.ts    # 注册 API
│   │       ├── logout/route.ts      # 登出 API
│   │       └── me/route.ts        # 获取当前用户 API
│   ├── login/page.tsx             # 登录页面
│   └── register/page.tsx          # 注册页面
├── components/
│   └── Header.tsx               # 顶部导航栏（显示用户信息）
├── context/
│   └── AuthContext.tsx          # 认证上下文
├── lib/
│   └── db/
│       ├── index.ts            # 数据库连接（SQLite）
│       └── schema.ts          # 数据库 schema
└── types/
    └── auth.ts                # 认证相关类型

scripts/
└── init-db.ts               # 数据库初始化脚本

data/
└── honghong.db             # SQLite 数据库文件（自动创建）

.env                        # 环境变量配置
.env.example                # 环境变量示例
drizzle.config.ts            # Drizzle ORM 配置
AUTH_SETUP.md              # 本文档
```

## API 说明

### POST /api/auth/register

注册新用户

请求体：
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

响应（成功）：
```json
{
  "user": {
    "id": 1,
    "username": "your_username"
  }
}
```

### POST /api/auth/login

用户登录

请求体：
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

响应（成功）：
```json
{
  "user": {
    "id": 1,
    "username": "your_username"
  }
}
```

### POST /api/auth/logout

用户登出

响应：
```json
{
  "success": true
}
```

### GET /api/auth/me

获取当前登录用户信息

响应（已登录）：
```json
{
  "user": {
    "id": 1,
    "username": "your_username"
  }
}
```

## 使用方法

1. 初始化数据库 `pnpm db:init`
2. 启动开发服务器 `pnpm dev`
3. 访问 http://localhost:5000
4. 点击右上角的"注册"创建账号
5. 使用注册的账号登录
6. 登录成功后可以看到用户名显示在右上角
7. 开始玩游戏！

## 安全说明

- 密码使用 bcrypt 加密（12 rounds）
- 会话使用 HTTP-only cookie
- Cookie 有效期 7 天
- 生产环境会设置 `secure: true`
