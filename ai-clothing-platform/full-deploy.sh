#!/bin/bash

# 完整的部署脚本
echo "🔄 正在运行数据库迁移..."

# 切换到项目目录
cd "$(dirname "$0")"

# 运行数据库迁移和生成客户端
npx prisma db push --skip-generate

echo "🔄 正在生成 Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
  echo "✅ Prisma Client 生成成功！"
  echo "🚀 正在部署到 Vercel..."
  vercel --prod --yes
else
  echo "❌ Prisma Client 生成失败！"
  exit 1
fi
