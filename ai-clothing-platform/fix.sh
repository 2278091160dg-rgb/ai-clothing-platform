#!/bin/bash

echo "=== AI 电商商拍平台 - 修复脚本 ==="
echo ""

echo "1️⃣  检查 Prisma 安装..."
if ! npm list prisma &> /dev/null; then
    echo "❌ Prisma 未安装"
    echo "📦 安装 Prisma..."
    npm install --save-dev prisma @prisma/client
else
    echo "✅ Prisma 已安装"
fi

echo ""
echo "2️⃣  生成 Prisma 客户端..."
npx prisma generate

echo ""
echo "3️⃣  检查数据库配置..."
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL 已配置"
    else
        echo "⚠️  DATABASE_URL 未配置"
        echo "请在 .env 文件中配置 DATABASE_URL"
    fi
else
    echo "⚠️  .env 文件不存在"
    echo "请先创建 .env 文件"
fi

echo ""
echo "4️⃣  推送数据库 schema（如果使用 SQLite）..."
# 注意：如果使用 PostgreSQL，请确保数据库正在运行
npx prisma db push --skip-generate || echo "⚠️  如果使用 PostgreSQL，请先启动数据库"

echo ""
echo "5️⃣  创建初始数据（如果需要）..."
# npx prisma db seed

echo ""
echo "✅ 修复完成！"
echo ""
echo "🚀 启动开发服务器："
echo "   npm run dev"
