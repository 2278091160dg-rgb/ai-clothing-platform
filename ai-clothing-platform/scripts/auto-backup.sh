#!/bin/bash

#############################################
# 自动备份脚本 - AI Clothing Platform
# 功能：自动提交并推送到 GitHub 远程仓库
#############################################

set -e

# 项目路径
PROJECT_DIR="/Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform"

# 切换到项目目录
cd "$PROJECT_DIR"

# 获取当前时间
CURRENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')
CURRENT_DATE=$(date '+%Y%m%d')

echo "======================================"
echo "  自动备份脚本 - AI Clothing Platform"
echo "  时间: $CURRENT_TIME"
echo "======================================"

# 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有未提交的更改，无需备份"
    exit 0
fi

echo "📝 检测到未提交的更改..."

# 显示更改的文件
echo "📋 更改的文件："
git status --short

# 添加所有更改
echo "➕ 添加所有更改..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "auto-backup: $CURRENT_TIME

[自动备份]
- 所有未提交的更改已自动提交
- 时间: $CURRENT_TIME
"

# 推送到远程仓库
echo "📤 推送到 GitHub..."
if git push origin main; then
    echo ""
    echo "✅ 备份成功！"
    echo "🔗 仓库: https://github.com/2278091160dg-rgb/ai-clothing-platform"
    echo "⏰ 时间: $CURRENT_TIME"
else
    echo ""
    echo "❌ 备份失败！请检查网络连接或 GitHub 凭据"
    exit 1
fi

echo "======================================"
