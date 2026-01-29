# 快速参考卡 - AI服装平台登录配置系统

## 🚀 30秒快速上下文

```
项目：AI服装平台登录页面配置功能
位置：ai-clothing-platform/
状态：已完成6项优化（2026-01-29）

核心改动：
✅ 简化UI（3个标签页）
✅ 添加预览功能
✅ 背景图上传（30+张模板）
✅ 本地SQLite数据库

文件：PROJECT_STATUS.md（完整状态）
```

---

## 🎯 核心文件速查

| 文件                                     | 用途              |
| ---------------------------------------- | ----------------- |
| `src/components/login/LoginSettings.tsx` | 登录设置主组件    |
| `src/config/login-backgrounds.ts`        | 背景图库（30+张） |
| `src/app/api/login-config/route.ts`      | 配置保存API       |
| `prisma/schema.prisma`                   | 数据库模型定义    |
| `prisma/dev.db`                          | 本地数据库文件    |

---

## 🔧 环境配置速查

**本地（当前）：**

```bash
DATABASE_URL="file:./prisma/dev.db"  # SQLite ✅
schema.prisma: provider = "sqlite"
```

**Vercel生产：**

```bash
DATABASE_URL="postgresql://..."  # Supabase
schema.prisma: provider = "postgresql"  # ⚠️ 需手动改
```

---

## 📝 新对话开始（复制粘贴版）

```
我正在继续开发AI服装平台的登录配置功能。
项目位置：/Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform

已完成：
- 登录设置UI优化（3个标签页：LOGO、文案、背景）
- 预览功能和背景上传（30+张模板图）
- 本地SQLite数据库配置

请查看 PROJECT_STATUS.md 了解完整状态。
当前需要：[你的需求]
```

---

## ⚡ 常用命令

```bash
# 启动开发服务器
npm run dev

# 重置数据库（如果需要）
rm prisma/dev.db && npx prisma db push

# 生成Prisma客户端
npx prisma generate

# 运行类型检查
npx tsc --noEmit
```

---

_最后更新：2026-01-29_
