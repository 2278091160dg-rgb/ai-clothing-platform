# 自动化备份使用指南

## 备份脚本位置
```
scripts/auto-backup.sh
```

## 使用方式

### 方式 1：手动执行（推荐在重要节点使用）

```bash
cd /Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform
./scripts/auto-backup.sh
```

### 方式 2：设置快捷命令

在 `~/.zshrc` 中添加：
```bash
alias backup='cd /Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform && ./scripts/auto-backup.sh'
```

使用时只需输入：
```bash
backup
```

### 方式 3：macOS 定时任务（自动化）

创建定时任务配置文件：
```bash
# 编辑 launchd 配置
nano ~/Library/LaunchAgents/com.aiclothing.backup.plist
```

添加以下内容：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.aiclothing.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform/scripts/auto-backup.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>18</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/aiclothing-backup.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/aiclothing-backup-error.log</string>
</dict>
</plist>
```

加载定时任务：
```bash
launchctl load ~/Library/LaunchAgents/com.aiclothing.backup.plist
```

查看任务状态：
```bash
launchctl list | grep aiclothing
```

卸载定时任务：
```bash
launchctl unload ~/Library/LaunchAgents/com.aiclothing.backup.plist
```

## 脚本功能

- ✅ 自动检测未提交的更改
- ✅ 显示更改的文件列表
- ✅ 自动添加并提交更改
- ✅ 推送到 GitHub 远程仓库
- ✅ 显示备份结果
- ✅ 记录备份时间

## 备份频率建议

| 场景 | 建议 |
|------|------|
| 每日结束 | 定时任务自动执行 |
| 完成功能 | 手动执行 `backup` |
| 重构前 | 手动执行 `backup` |
| 发布前 | 手动执行 `backup` |

## 注意事项

1. **首次使用前**确保已配置 GitHub 认证（Personal Access Token）
2. **网络连接**需要稳定的互联网连接
3. **冲突处理**如果本地和远程有冲突，需要手动解决
4. **查看日志**：`cat /tmp/aiclothing-backup.log`

## 手动备份流程（不使用脚本）

如果脚本不可用，可以手动执行：
```bash
cd /Users/denggui/Documents/trae_projects/PENCILTEST/ai-clothing-platform
git add .
git commit -m "backup: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
```
