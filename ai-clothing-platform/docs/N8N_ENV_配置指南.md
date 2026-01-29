# .env 文件配置位置详解

## 📍 N8N的.env文件位置

### 情况1：Docker 部署（最常见）

**文件位置**：

```bash
# 在你的 docker-compose.yml 同目录下
/path/to/your/docker-compose-directory/
├── docker-compose.yml
└── .env                    # ⭐ 就在这里！
```

**配置步骤**：

```bash
# 1. 找到 docker-compose.yml 文件
cd /path/to/n8n-docker

# 2. 编辑 .env 文件
vim .env
# 或者
nano .env
# 或者用任何文本编辑器打开

# 3. 添加以下内容
FEISHU_BITABLE_APP_TOKEN=app_你的AppToken
FEISHU_BITABLE_TABLE_ID=tbl_你的TableID

# 4. 保存文件后重启容器
docker-compose down
docker-compose up -d
```

---

### 情况2：直接安装（npm/npx）

**文件位置**：

```bash
# Linux/Mac
~/.n8n/.env
# 或者
/root/.n8n/.env

# Windows
C:\Users\YourUsername\.n8n\.env
```

**配置步骤**：

```bash
# 1. 编辑 .env 文件
vim ~/.n8n/.env

# 2. 添加环境变量
FEISHU_BITABLE_APP_TOKEN=app_你的AppToken
FEISHU_BITABLE_TABLE_ID=tbl_你的TableID

# 3. 重启N8N服务
pm2 restart n8n
# 或者
systemctl restart n8n
```

---

### 情况3：N8N Cloud（托管版本）

如果你使用的是 N8N Cloud（n8n.io）：

**不使用.env文件**，而是：

1. 登录 n8n.cloud
2. 进入 Settings → Environment Variables
3. 在网页界面中添加环境变量

---

## 🔍 如何确定你的部署方式？

### 方法1：检查是否有Docker

```bash
# 运行这个命令
docker ps

# 如果看到 n8n 容器 → Docker部署
# 如果提示命令不存在 → 直接安装
```

### 方法2：检查进程

```bash
# 查看 N8N 进程
ps aux | grep n8n

# 如果看到 docker-shim → Docker部署
# 如果看到 node/npx → 直接安装
```

### 方法3：检查端口占用

```bash
# 查看谁在监听 5678 端口
lsof -i :5678

# 根据 COMMAND 判断
```

---

## 📝 .env 文件内容示例

```bash
# ============== N8N 基础配置 ==============
# N8N的基本配置（通常已存在）
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_password
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
# ... 其他配置

# ============== 飞书配置（新增） ==============
# 飞书多维表格配置
FEISHU_BITABLE_APP_TOKEN=app_abc123def456
FEISHU_BITABLE_TABLE_ID=tbl789xyz012uvw

# 可选：飞书API配置
# FEISHU_APP_ID=cli_xxxxxxxxxxxx
# FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
# FEISHU_APP_ACCESS_TOKEN=t-xxxxxxxxxxxxxxxxxxxx

# ============== API 配置（可选） ==============
# DeerAPI配置（可选，也可以在节点中配置）
# DEERAPI_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx

# ============== 其他配置 ==============
# 时区设置
GENERIC_TIMEZONE=Asia/Shanghai
TZ=Asia/Shanghai
```

---

## ⚠️ 重要注意事项

### 1. 格式要求

```bash
# ✅ 正确格式
KEY=value
# 等号两边不要有空格

# ❌ 错误格式
KEY = value
# 有空格会导致读取失败
```

### 2. 引号问题

```bash
# ✅ 正确
FEISHU_TOKEN=app_abc123

# ❌ 错误（不要加引号）
FEISHU_TOKEN="app_abc123"

# ❌ 错误（不要加单引号）
FEISHU_TOKEN='app_abc123'
```

### 3. 注释

```bash
# 使用 # 号添加注释
# 这是注释，会被忽略

FEISHU_TOKEN=app_abc123  # 行尾注释也可以
```

### 4. 空行

```bash
# 空行会被忽略，可以用来分隔不同的配置块

FEISHU_TOKEN=app_abc123

# 这样更清晰
```

---

## 🔄 修改后必须重启！

### Docker 部署

```bash
docker-compose down
docker-compose up -d

# 或者
docker-compose restart
```

### 直接安装（PM2）

```bash
pm2 restart n8n
```

### 直接安装（Systemd）

```bash
systemctl restart n8n
```

### 直接安装（直接运行）

```bash
# 停止当前进程（Ctrl+C）
# 重新启动
n8n start
```

---

## ✅ 验证环境变量是否生效

### 方法1：在N8N中查看

1. 在N8N中创建一个临时节点
2. 添加一个"Set"节点
3. 设置字段：
   ```javascript
   "test_env": "={{ $env.FEISHU_BITABLE_APP_TOKEN }}"
   ```
4. 执行工作流
5. 查看输出，如果显示你的值，说明配置成功

### 方法2：查看N8N日志

```bash
# Docker部署
docker-compose logs -f n8n

# 直接安装
pm2 logs n8n
```

查找是否有关于环境变量的错误信息。

### 方法3：在Code节点中测试

创建一个Code节点，写入：

```javascript
console.log('FEISHU_BITABLE_APP_TOKEN:', $env.FEISHU_BITABLE_APP_TOKEN);
console.log('FEISHU_BITABLE_TABLE_ID:', $env.FEISHU_BITABLE_TABLE_ID);
return items;
```

执行后查看日志输出。

---

## 🚨 常见问题

### Q1: 修改了.env但没有生效？

**A**: 检查是否重启了N8N服务！

### Q2: .env文件不存在怎么办？

**A**: 创建一个新的：

```bash
# 在正确的目录下
touch .env
vim .env
```

### Q3: 不知道N8N安装在哪里？

**A**: 运行以下命令查找：

```bash
# 查找 n8n 可执行文件
which n8n

# 查找 .env 文件
find ~/ -name ".env" -path "*/.n8n/*" 2>/dev/null

# 查看 docker-compose 目录
find ~/ -name "docker-compose.yml" 2>/dev/null
```

### Q4: Docker容器里看不到.env？

**A**: .env在宿主机上，不在容器内！

### Q5: Windows上的文件位置？

**A**:

```
C:\Users\你的用户名\.n8n\.env
```

---

## 📋 快速配置清单

```
□ 确定部署方式（Docker/直接安装/Cloud）
□ 找到 .env 文件位置
□ 编辑 .env 文件
□ 添加以下内容：
  FEISHU_BITABLE_APP_TOKEN=app_你的值
  FEISHU_BITABLE_TABLE_ID=tbl_你的值
□ 保存文件
□ 重启 N8N 服务
□ 验证配置生效
```

---

## 🎯 总结

1. **Docker部署** → .env 在 docker-compose.yml 同目录
2. **直接安装** → .env 在 ~/.n8n/ 目录
3. **Cloud版本** → 在网页设置中添加
4. **修改后必须重启N8N**
5. **格式：KEY=value（不要引号，不要空格）**

希望这个指南能帮你找到正确的配置位置！🎉
