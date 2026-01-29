# 🗄️ 数据库迁移操作指南

## 启用完整配置功能 - 从 SQLite 切换到 Vercel Postgres

---

## 📋 为什么需要迁移？

- ❌ **SQLite** - 只适合本地开发，Vercel 不支持
- ✅ **Vercel Postgres** - 生产级数据库，Vercel 原生支持
- ✅ **完整功能** - 支持配置保存、用户管理、任务记录等

---

## 🚀 方案 1: Vercel Postgres（推荐）

### 步骤 1: 创建 Vercel Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目：**ai-clothing-platform**
3. 点击顶部导航栏的 **"Storage"** 标签
4. 点击 **"Create Database"**
5. 选择 **"Postgres"**
6. 配置数据库：
   - **Database Name**: `ai-clothing-platform-db`（或自定义）
   - **Region**: `Hong Kong`（推荐，与你的应用同区域）
7. 点击 **"Create"**

### 步骤 2: 获取数据库连接字符串

创建完成后，Vercel 会自动：

- ✅ 在项目根目录创建 `.env.local` 文件（本地开发）
- ✅ 在 Vercel 项目中添加 `DATABASE_URL` 环境变量（生产环境）

连接字符串格式：

```
postgresql://user:password@host-vercel.postgres.vercel-storage.com/dbname?sslmode=require
```

### 步骤 3: 验证环境变量

在 Vercel Dashboard 中：

1. 进入项目 → **Settings** → **Environment Variables**
2. 确认 `DATABASE_URL` 已存在
3. 值应该类似：`postgres://...`

### 步骤 4: 运行数据库迁移

```bash
# 在项目目录执行
npx prisma db push
```

### 步骤 5: 重新部署

```bash
vercel --prod --yes
```

### 步骤 6: 验证功能

1. 访问登录页面：`https://denggui2026hz.denggui.top/login`
2. 使用密码登录：`DG+AB2026`
3. 登录后点击右上角 **"⚙️ 设置"**
4. 尝试修改配置并保存
5. 刷新页面验证配置已保存

---

## 💡 方案 2: Supabase（免费额度更大）

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 **"Start your project"**
3. 使用 GitHub 账号登录
4. 创建新项目：
   - **Name**: `ai-clothing-platform`
   - **Database Password**: 设置强密码（保存好！）
   - **Region**: `Southeast Asia (Singapore)` 推荐

### 步骤 2: 获取数据库连接字符串

1. 在 Supabase Dashboard 中：
   - 点击左侧 **"Settings"** → **"Database"**
2. 找到 **"Connection string"** 部分
3. 选择 **"URI"** 标签页
4. 复制连接字符串（格式如下）：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 步骤 3: 在 Vercel 中配置环境变量

1. 进入 Vercel Dashboard → 你的项目
2. **Settings** → **Environment Variables**
3. 添加环境变量：
   - **Key**: `DATABASE_URL`
   - **Value**: 粘贴你的 Supabase 连接字符串
   - **Environments**: 选择 `Production`, `Preview`, `Development`
4. 点击 **"Save"**

### 步骤 4: 更新 Prisma Schema

编辑 `prisma/schema.prisma`，修改数据源：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 步骤 5: 运行迁移并部署

```bash
# 推送 schema 到数据库
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 部署到 Vercel
vercel --prod --yes
```

---

## 💡 方案 3: Neon（无服务器 Postgres）

### 步骤 1: 创建 Neon 项目

1. 访问 [Neon](https://neon.tech)
2. 点击 **"Sign up"**（可使用 GitHub 登录）
3. 点击 **"Create a project"**
4. 配置：
   - **Project Name**: `ai-clothing-platform`
   - **Choose a region**: `Asia East (Hong Kong)` 推荐
   - **PostgreSQL Version**: `16`（默认）

### 步骤 2: 获取连接字符串

创建后，Neon 会显示连接字符串：

```
postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

### 步骤 3: 配置到 Vercel

1. Vercel Dashboard → 项目 → **Settings** → **Environment Variables**
2. 添加 `DATABASE_URL`，粘贴 Neon 连接字符串
3. 选择所有环境，保存

### 步骤 4: 更新 schema 并迁移

```prisma
# prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
npx prisma db push
npx prisma generate
vercel --prod --yes
```

---

## 🔍 验证数据库连接

部署后，检查 API 是否正常：

```bash
# 测试配置 API
curl https://denggui2026hz.denggui.top/api/login-config
```

应该返回 JSON 配置，而不是 HTML。

---

## 📊 方案对比

| 特性         | Vercel Postgres | Supabase      | Neon          |
| ------------ | --------------- | ------------- | ------------- |
| **免费额度** | 60小时/月       | 500MB 数据库  | 0.5GB 存储    |
| **价格**     | $20/月起        | $25/月起      | $19/月起      |
| **延迟**     | ⭐⭐⭐⭐⭐ 最低 | ⭐⭐⭐⭐ 较低 | ⭐⭐⭐⭐ 较低 |
| **设置难度** | ⭐ 最简单       | ⭐⭐ 简单     | ⭐⭐ 简单     |
| **推荐度**   | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐      | ⭐⭐⭐⭐      |

---

## ⚠️ 常见问题

### Q1: Vercel Postgres 免费额度用完了怎么办？

- 可以：
  - 升级到付费计划（$20/月）
  - 或切换到 Supabase/Neon（免费额度更大）

### Q2: 数据会丢失吗？

- ✅ 不会！迁移时会保留所有数据
- SQLite 的数据可以导出后导入到新数据库

### Q3: 可以回退到 SQLite 吗？

- ❌ 不推荐。Vercel 生产环境不支持 SQLite
- 建议直接使用 Postgres

### Q4: 需要修改代码吗？

- ✅ 只需修改 `prisma/schema.prisma` 中的 provider
- ✅ 运行 `npx prisma db push`
- ✅ 重新部署

---

## 🎯 我的推荐

**Vercel Postgres**，因为：

- ✅ 与 Vercel 深度集成，设置最简单
- ✅ 延迟最低（同区域部署）
- ✅ 自动备份
- ✅ 一键创建，零配置

---

## 📞 需要帮助？

如果在迁移过程中遇到问题：

1. 检查环境变量是否正确设置
2. 检查 `DATABASE_URL` 格式是否正确
3. 查看 Vercel 部署日志

告诉我你选择哪个方案，我可以提供更详细的指导！
