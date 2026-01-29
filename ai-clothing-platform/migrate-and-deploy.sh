#!/bin/bash

# 数据库迁移和部署脚本
echo "🔄 正在运行数据库迁移..."

# 切换到项目目录
cd "$(dirname "$0")"

# 运行数据库迁移
npx prisma db push

if [ $? -eq 0 ]; then
  echo "✅ 数据库迁移成功！"
  echo "🚀 正在部署到 Vercel..."
  vercel --prod --yes
else
  echo "❌ 数据库迁移失败！"
  exit 1
fi
