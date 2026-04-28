# 部署指南

## 1. GitHub 上传

```bash
# 初始化 git (如果还没初始化)
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库并推送
git remote add origin https://github.com/your-username/honghong.git
git branch -M main
git push -u origin main
```

## 2. Cloudflare Pages + D1 部署 (推荐)

### 前置准备

1. 注册 Cloudflare 账号: https://dash.cloudflare.com
2. 安装 Wrangler CLI:
```bash
npm install -g wrangler
wrangler login
```

### 步骤 1: 创建 D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create honghong-db

# 创建成功后，复制 database_id 到 wrangler.toml
```

### 步骤 2: 执行数据库迁移

```bash
# 本地测试迁移
pnpm d1:local

# 或远程部署迁移
wrangler d1 migrations apply honghong-db --remote
```

### 步骤 3: 部署到 Cloudflare Pages

#### 方式 A: Git 自动部署 (推荐)

1. 访问 https://pages.cloudflare.com
2. 点击 "Create a project" → "Connect to Git"
3. 选择你的 GitHub 仓库
4. 配置构建选项:
   - **Framework preset**: `Next.js`
   - **Build command**: `pnpm next build`
   - **Build output directory**: `.next`
5. 在 **Environment variables** 中添加:
   - `NEXTAUTH_SECRET` (运行 `openssl rand -hex 32` 生成)
   - `NEXTAUTH_URL` (你的 Pages URL，部署后获得)
6. 在项目设置 → **Functions** → **D1 database bindings** 中添加:
   - Variable name: `DB`
   - Database: 选择 `honghong-db`
7. 点击 "Save and Deploy"

#### 方式 B: CLI 直接部署

```bash
# 构建项目
pnpm build

# 部署
wrangler pages deploy .next --project-name=honghong
```

## 3. 数据库选项

### 选项 A: Cloudflare D1 (已配置) ✅

这是 Cloudflare Pages 的原生数据库，免费额度充足。

**已创建的文件:**
- `src/lib/db/schema-d1.ts` - D1 Schema
- `src/lib/db/index-d1.ts` - D1 连接
- `drizzle/d1/0001_init.sql` - 迁移脚本

### 选项 B: 外部 PostgreSQL

如果不想用 D1，可以使用 Neon、Supabase 等:

1. 注册 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com)
2. 创建数据库
3. 在 Pages 环境变量中设置 `DATABASE_URL`
4. 使用原有的 `src/lib/db/schema.ts`

## 4. 本地开发

### 使用 SQLite 模拟 D1

```bash
# 初始化本地数据库
pnpm d1:init

# 启动开发服务器
pnpm dev
```

### 使用 PostgreSQL

```bash
# 确保 DATABASE_URL 指向 PostgreSQL
pnpm db:init
pnpm dev
```

## 5. 常用命令

```bash
# 本地开发
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# D1 相关
pnpm d1:init          # 初始化本地 D1
pnpm d1:migrate       # 远程迁移
pnpm d1:local         # 本地迁移
```

