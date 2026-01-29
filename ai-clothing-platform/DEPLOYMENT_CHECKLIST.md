# 部署检查清单

## 📋 部署前准备

### 本地测试

- [ ] 功能正常：登录、保存配置、预览效果
- [ ] 数据库正常：可以保存和读取配置
- [ ] 无编译错误：`npm run build` 成功
- [ ] 无TypeScript错误：`npx tsc --noEmit` 无错误

### 环境变量确认

- [ ] 本地 `.env` 和 `.env.local` 配置正确
- [ ] Vercel `DATABASE_URL` 环境变量已记录（见下方）

---

## 🚀 Vercel 部署步骤

### 1. 修改 schema.prisma

```bash
# 部署前必须修改
datasource db {
  provider = "postgresql"  # 从 sqlite 改为 postgresql
  url      = env("DATABASE_URL")
}
```

### 2. Vercel 环境变量设置

在 Vercel Dashboard → Settings → Environment Variables 添加：

```
DATABASE_URL = postgresql://postgres:G2d2Avr6dCW3J2@db.xjojyolfqpjfgdkywkew.supabase.co:5432/postgres
```

### 3. 推送代码

```bash
git add .
git commit -m "feat: 完成登录页面配置系统优化"
git push
```

### 4. 首次部署后初始化数据库

部署完成后，访问：

```
https://your-domain.vercel.app/api/init-db
```

方法：POST（可以用 Postman 或 curl）

---

## ✅ 部署后验证

### 功能测试

- [ ] 访问首页正常
- [ ] 登录功能正常
- [ ] "登录设置"按钮可见且可点击
- [ ] 配置保存功能正常
- [ ] 预览功能正常
- [ ] 背景图片切换正常

### 数据库验证

- [ ] 配置可以保存
- [ ] 刷新页面后配置保持
- [ ] 表单标签和文案更新生效

---

## 🐛 常见问题排查

### 问题1：部署后保存失败

**可能原因**：

- Vercel 环境变量未设置
- Supabase 连接失败
- 数据库表未创建

**解决方案**：

1. 检查 Vercel Dashboard 的环境变量
2. 访问 `/api/init-db` 初始化数据库
3. 检查 Supabase 项目状态

### 问题2：本地能用但生产不能用

**可能原因**：

- `schema.prisma` provider 未改回 `postgresql`
- 环境变量未正确配置

**解决方案**：

1. 确认 `schema.prisma` 中 provider 是 `postgresql`
2. 检查 Vercel 环境变量是否正确

### 问题3：图片上传失败

**可能原因**：

- 文件太大
- 上传API未正确配置
- 存储服务未配置

---

## 📞 紧急联系

如果部署遇到问题：

1. 查看 Vercel 部署日志
2. 检查浏览器控制台错误
3. 查看 PROJECT_STATUS.md 的完整文档
