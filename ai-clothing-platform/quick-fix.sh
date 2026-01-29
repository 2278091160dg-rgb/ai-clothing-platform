#!/bin/bash

echo "=== 🔧 AI 电商商拍平台 - 一键修复脚本 ==="
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 当前目录：$(pwd)"
echo ""

# 询问用户选择数据库类型
echo "📊 选择数据库类型："
echo "  1) SQLite（推荐用于快速开发，无需安装数据库）"
echo "  2) PostgreSQL（生产环境推荐）"
echo ""
read -p "请选择 [1-2]: " db_choice

if [ "$db_choice" = "1" ]; then
    echo ""
    echo "🔧 配置 SQLite..."

    # 修改 schema.prisma
    sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

    # 修改 prisma.config.ts 添加 SQLite 备用
    sed -i.bak 's/url: process.env\["DATABASE_URL"\],/url: process.env["DATABASE_URL"] || "file:.\/*dev.db",/' prisma.config.ts

    echo "✅ SQLite 配置完成"

elif [ "$db_choice" = "2" ]; then
    echo ""
    echo "🔧 配置 PostgreSQL..."

    # 检查 PostgreSQL 是否运行
    if command -v psql &> /dev/null; then
        echo "⚠️  请确保 PostgreSQL 正在运行："
        echo "   macOS: brew services start postgresql"
        echo "   Linux: sudo systemctl start postgresql"
        echo ""
        read -p "按 Enter 继续..."
    fi

    # 恢复 PostgreSQL 配置
    sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    sed -i.bak 's/url: process.env\["DATABASE_URL"\] || "file:\/*dev.db",/url: process.env["DATABASE_URL"],/' prisma.config.ts

    echo "✅ PostgreSQL 配置完成"
else
    echo "❌ 无效选择"
    exit 1
fi

echo ""
echo "📦 重新生成 Prisma 客户端..."
npx prisma generate

echo ""
echo "🗄️  推送数据库 schema..."
npx prisma db push --skip-generate

echo ""
echo "✅ 修复完成！"
echo ""
echo "🚀 启动开发服务器："
echo "   npm run dev"
echo ""
echo "📖 查看完整调试指南："
echo "   cat DEBUG_GUIDE.md"
