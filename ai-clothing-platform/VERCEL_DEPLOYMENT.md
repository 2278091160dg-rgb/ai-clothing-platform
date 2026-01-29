# Vercel 部署指南

本指南将帮助你将 AI 服装平台部署到 Vercel（免费）。

## 📋 部署前准备

### 1. 确保代码已提交到 Git

```bash
cd /Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform
git add .
git commit -m "准备部署到 Vercel"
git push
```

### 2. 注册 Vercel 账号

访问：https://vercel.com/signup

- 推荐使用 GitHub 账号登录
- 部署更方便，支持自动部署

---

## 🚀 部署步骤

### 方法 1：通过 Vercel CLI（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
cd /Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform
vercel
```

按照提示操作：

- ? Set up and deploy? **Y**es
- ? Which scope? 选择你的账号
- ? Link to existing project? **N**o
- ? What's your project's name? **ai-clothing-platform**
- ? In which directory is your code located? **.**
- ? Want to override the settings? **N**o

#### 4. 配置环境变量

访问：https://vercel.com/dashboard

进入你的项目 → **Settings** → **Environment Variables**

添加以下环境变量：

| Name                   | Value                                                    | Environment     |
| ---------------------- | -------------------------------------------------------- | --------------- |
| `N8N_WEBHOOK_URL`      | `https://n8n.denggui.top/webhook/ai-clothing-generation` | All             |
| `N8N_API_KEY`          | `n8n-callback-secret-key-2024`                           | All             |
| `NEXTAUTH_URL`         | `https://your-project.vercel.app`                        | All             |
| `NEXTAUTH_SECRET`      | （生成随机字符串）                                       | All             |
| `NEXT_PUBLIC_APP_URL`  | `https://your-project.vercel.app`                        | All             |
| `NEXT_PUBLIC_APP_NAME` | `电商AI商拍`                                             | All             |
| `ACCESS_TOKEN`         | `ai-clothing-2024`                                       | All             |
| `DATABASE_URL`         | `file:./dev.db`                                          | All（开发环境） |

**生成 NEXTAUTH_SECRET：**

```bash
openssl rand -base64 32
```

#### 5. 重新部署

```bash
vercel --prod
```

---

### 方法 2：通过 Vercel Dashboard

#### 1. 导入项目

访问：https://vercel.com/new

- 点击 **Import Project**
- 选择你的 GitHub 仓库
- 选择 `ai-clothing-platform` 目录

#### 2. 配置项目

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`（或 `pnpm build`）

#### 3. 添加环境变量

在 Configure Project 页面，点击 **Environment Variables**，添加上面的环境变量。

#### 4. 部署

点击 **Deploy** 按钮，等待部署完成（约 2-3 分钟）。

---

## 🔧 部署后配置

### 1. 获取部署 URL

部署成功后，你会得到一个 URL：

```
https://ai-clothing-platform-xxx.vercel.app
```

### 2. 更新环境变量

回到 Vercel Dashboard，更新以下环境变量：

- `NEXTAUTH_URL` → 改为你的 Vercel URL
- `NEXT_PUBLIC_APP_URL` → 改为你的 Vercel URL

### 3. 重新部署

```bash
vercel --prod
```

---

## 🌐 绑定自定义域名（可选）

### 1. 在 Vercel 中添加域名

1. 进入项目 → **Settings** → **Domains**
2. 点击 **Add Domain**
3. 输入：`denggui2026hz.denggui.top`

### 2. 配置 DNS

在你的域名服务商（Cloudflare）中添加 CNAME 记录：

| Type  | Name          | Target               |
| ----- | ------------- | -------------------- |
| CNAME | denggui2026hz | cname.vercel-dns.com |

### 3. 更新环境变量

- `NEXTAUTH_URL` → `https://denggui2026hz.denggui.top`
- `NEXT_PUBLIC_APP_URL` → `https://denggui2026hz.denggui.top`

---

## ⚠️ 重要说明

### 图片上传限制

当前版本的图片上传使用 **Base64 内存存储**：

- ✅ 优点：无需额外服务，部署简单
- ⚠️ 限制：
  - 单个图片最大 5MB
  - 文件存储在内存中，重启后会清空
  - 不适合大量图片或长期存储

### 生产环境建议

如果需要更好的图片存储，可以考虑：

#### 选项 1：Vercel Blob（推荐）

```bash
npm install @vercel/blob
```

参考文档：https://vercel.com/docs/storage/vercel-blob

#### 选项 2：Cloudinary

```bash
npm install cloudinary
```

#### 选项 3：继续使用 DeerAPI

如果已经有 DeerAPI 配置，系统会自动使用它。

---

## 🔄 自动部署

配置 GitHub 集成后，每次推送代码到 main 分支，Vercel 会自动部署。

```bash
git add .
git commit -m "更新功能"
git push
```

---

## 📊 监控和日志

访问：https://vercel.com/dashboard

- **Deployments**: 查看部署历史
- **Logs**: 查看应用日志
- **Analytics**: 查看访问统计

---

## 🆘 常见问题

### Q: 部署后提示 "Database Error"

A: Vercel serverless 环境不支持 SQLite。建议使用：

- Vercel Postgres（有免费额度）
- Supabase（免费）
- PlanetScale（免费）

### Q: 图片上传失败

A: 确保图片小于 5MB。如果需要更大，请配置云存储服务。

### Q: N8N 回调失败

A: 检查 `NEXT_PUBLIC_APP_URL` 是否正确配置为 Vercel URL。

---

## 📞 支持

如有问题，请访问：

- Vercel 文档：https://vercel.com/docs
- Next.js 部署文档：https://nextjs.org/docs/deployment
