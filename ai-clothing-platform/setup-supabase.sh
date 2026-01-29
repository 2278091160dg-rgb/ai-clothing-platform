#!/bin/bash

echo "🔄 正在连接到 Supabase 数据库..."

# 切换到项目目录
cd "$(dirname "$0")"

# 推送数据库 schema 到 Supabase
npx prisma db push

if [ $? -eq 0 ]; then
  echo "✅ 数据库连接成功！"
  echo ""
  echo "🚀 正在部署到 Vercel..."
  vercel --prod --yes
else
  echo "❌ 数据库连接失败！"
  echo ""
  echo "请检查："
  echo "1. Supabase 项目是否已创建？"
  echo "2. DATABASE_URL 环境变量是否正确设置？"
  echo "3. prisma/schema.prisma 中的 provider 是否已改为 postgresql？"
  exit 1
fi
