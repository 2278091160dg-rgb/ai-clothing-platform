# 🔧 系统配置管理指南

## 📋 概述

本系统采用**前端配置 + 后端环境变量**的双层配置架构，确保系统既灵活又安全。

## 🏗️ 配置架构

### 前层：前端用户配置（localStorage）

用户可以通过界面配置的参数：

- ✅ **品牌配置**：标题、副标题、图标、Logo
- ✅ **DeerAPI配置**：Endpoint、API Key
- ✅ **N8N配置**：自定义Webhook URL（可选）

### 后层：后端环境变量（.env.local）

系统管理员配置的核心参数：

- 🔒 `N8N_WEBHOOK_URL`：默认N8N Webhook地址
- 🔒 `N8N_API_KEY`：N8N认证密钥
- 🔒 `NEXT_PUBLIC_APP_URL`：应用回调地址

---

## 🎯 配置优先级

```
前端配置 > 后端默认配置
```

**示例**：

- 用户在前端配置了 `n8nWebhookUrl` → 使用前端配置
- 用户未配置 → 使用后端 `.env.local` 中的 `N8N_WEBHOOK_URL`

---

## 📱 前端配置使用方法

### 方法1：通过界面配置

1. 点击右上角 **⚙️ 设置** 按钮
2. 在配置面板中填写：
   - **DeerAPI Endpoint**：`https://api.deerapi.com`
   - **DeerAPI Key**：你的API密钥
   - **N8N Webhook URL**：`https://n8n.denggui.top/webhook/ai-clothing-generation`（可选）
3. 点击 **保存配置**

### 方法2：直接修改localStorage（高级用户）

```javascript
// 浏览器控制台执行
localStorage.setItem(
  'ai_platform_config',
  JSON.stringify({
    brandTitle: '我的AI平台',
    deerApiEndpoint: 'https://api.deerapi.com',
    deerApiKey: 'sk-xxxxx',
    n8nWebhookUrl: 'https://n8n.denggui.top/webhook/ai-clothing-generation',
  })
);
```

---

## 🔐 后端配置（.env.local）

### 默认配置

```bash
# n8n Webhook Configuration
N8N_WEBHOOK_URL="https://n8n.denggui.top/webhook/ai-clothing-generation"
N8N_API_KEY="n8n-webhook-secret-key-2024"

# Application URL (for callbacks)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 更换N8N实例时

**场景**：你更换了N8N服务器或Webhook路径

**解决方案**：

**方案A：前端配置**（推荐，无需重启）

```
界面 → 设置 → N8N Webhook URL → 填写新地址 → 保存
```

**方案B：修改环境变量**（需要重启）

```bash
# 1. 编辑 .env.local
N8N_WEBHOOK_URL="https://new-n8n.com/webhook/ai-clothing-generation"

# 2. 重启开发服务器
Ctrl+C
npm run dev
```

---

## 🔄 配置迁移指南

### 从旧版本升级

**如果你之前在 `.env.local` 中配置了DeerAPI**：

1. 打开前端界面
2. 进入设置面板
3. 填写DeerAPI配置：
   - Endpoint: `https://api.deerapi.com`
   - API Key: 你的密钥
4. 保存配置

**配置从后端迁移到前端的好处**：

- ✅ 无需重启服务器
- ✅ 不同用户可以使用不同的API
- ✅ 配置更灵活

---

## 🛡️ 安全性说明

### 配置存储位置

| 配置项          | 存储位置           | 安全性                   |
| --------------- | ------------------ | ------------------------ |
| 品牌配置        | localStorage       | 公开，无安全风险         |
| DeerAPI Key     | localStorage       | **敏感**，请勿分享       |
| N8N Webhook URL | localStorage       | 公开，无安全风险         |
| N8N API Key     | .env.local（后端） | **高度敏感**，仅后端可见 |

### 最佳实践

1. **生产环境**：
   - ❌ 不要在前端配置敏感信息
   - ✅ 使用后端环境变量管理所有密钥
   - ✅ 使用环境特定的配置文件

2. **开发环境**：
   - ✅ 前端配置方便测试
   - ⚠️ 注意不要提交localStorage数据到代码仓库

3. **团队协作**：
   - ✅ 使用 `.env.local.template` 模板文件
   - ❌ 不要提交 `.env.local` 到Git

---

## 🧪 测试配置

### 测试1：验证前端配置

```javascript
// 浏览器控制台
const config = JSON.parse(localStorage.getItem('ai_platform_config'));
console.log(config);
```

**预期输出**：

```javascript
{
  brandTitle: "AI场景图生成器",
  deerApiEndpoint: "https://api.deerapi.com",
  deerApiKey: "sk-xxxxx",
  n8nWebhookUrl: "https://n8n.denggui.top/webhook/ai-clothing-generation"
}
```

### 测试2：验证后端配置

```bash
# 终端执行
echo $N8N_WEBHOOK_URL
```

**预期输出**：

```
https://n8n.denggui.top/webhook/ai-clothing-generation
```

### 测试3：完整流程测试

1. 在前端配置面板填写N8N URL
2. 上传图片并点击生成
3. 查看N8N执行记录
4. 确认图片生成成功

---

## ❓ 常见问题

### Q1: 更换了N8N URL，系统无法使用？

**A**: 有两个解决方案：

**快速方案**（推荐）：

```
界面 → 设置 → N8N Webhook URL → 填写新地址 → 保存
```

**标准方案**：

```bash
# 1. 修改 .env.local
N8N_WEBHOOK_URL="新地址"

# 2. 重启服务器
npm run dev
```

### Q2: 前端配置和后端配置冲突怎么办？

**A**: 前端配置优先。如果你想使用后端配置：

```javascript
// 清除前端配置
localStorage.removeItem('ai_platform_config');
// 或在设置面板中清空相应字段
```

### Q3: DeerAPI Key保存在前端安全吗？

**A**:

- **开发环境**：可以接受，方便测试
- **生产环境**：不安全，应该：
  - 使用后端代理API
  - 或使用服务端渲染

### Q4: 如何重置所有配置？

**A**: 在设置面板中：

1. 逐个清空所有字段
2. 点击保存
3. 刷新页面

---

## 📞 技术支持

如果遇到配置问题：

1. 检查浏览器控制台错误
2. 查看后端终端日志
3. 参考 [n8n-workflow-fix-guide.md](./n8n-workflow-fix-guide.md)
