# n8n 双Webhook工作流配置指南

## 📋 概述

这个工作流实现了双入口设计：
- **前端入口**：接收FormData（包含图片文件），返回生成的图片URL
- **飞书入口**：接收飞书记录ID，生成图片后自动保存到飞书

## 🎯 工作流结构

```
前端用户 → Webhook → Gemini生成 → 飞书记录 → 返回URL
                    ↑
飞书用户 → 按钮触发 → 共享工作流逻辑
```

## 📦 导入步骤

### 1. 在n8n中导入工作流

1. 打开n8n界面：https://n8n.denggui.top
2. 点击右上角 **"Import from File"**
3. 选择以下任一文件：
   - `n8n-workflow-simple.json` （推荐，简化版）
   - `n8n-workflow-dual-webhook.json` （完整版，双Webhook）
4. 点击 **"Import"**

### 2. 配置凭证（Credentials）

#### 2.1 配置 DEERAPI 凭证

1. 在工作流中找到 **"调用Gemini生成图片"** 节点
2. 点击节点 → **Credentials** → **Create New**
3. 选择 **"Header Auth"**
4. 配置：
   - **Name**: `DEERAPI API`
   - **Name** (Header): `Authorization`
   - **Value**: `Bearer YOUR_DEERAPI_KEY`
5. 点击 **"Save"**

#### 2.2 配置飞书凭证

1. 找到 **"保存到飞书多维表格"** 节点
2. 点击节点 → **Credentials** → **Create New**
3. 选择 **"Feishu API"**
4. 配置：
   - **Name**: `飞书账号`
   - **App ID**: 你的飞书应用ID
   - **App Secret**: 你的飞书应用密钥
5. 点击 **"Save"**

### 3. 配置节点参数

#### 3.1 飞书多维表格节点

1. 找到 **"保存到飞书多维表格"** 节点
2. 修改 **Table ID**：将 `YOUR_MULTI_TABLE_ID` 替换为你的飞书多维表格ID
3. 修改 **Data** 字段映射为你的表格列名：
   ```json
   {
     "图片": "{{ $json.imageUrl }}",
     "提示词": "{{ $json.prompt }}",
     "来源": "{{ $json.source }}",
     "创建时间": "{{ $now.toISO() }}"
   }
   ```

#### 3.2 Webhook节点

1. 找到 **"Webhook接收"** 节点
2. 记录 **Webhook URL**：
   ```
   https://n8n.denggui.top/webhook/scene-generate
   ```
3. 确保 **Response Mode** 设置为 **"Using 'Respond to Webhook' Node"**
4. 点击 **"Listen for Test Event"** 激活webhook

### 4. 更新前端配置

打开 `.env` 文件，更新webhook路径：

```bash
# 修改为新的webhook路径
VITE_N8N_WEBHOOK_PATH=/webhook/scene-generate
```

## 🧪 测试工作流

### 测试前端入口

1. 启动代理服务器：
   ```bash
   node proxy-server.cjs
   ```

2. 启动前端：
   ```bash
   npm run dev
   ```

3. 在前端上传图片并点击生成
4. 检查：
   - ✅ n8n工作流是否执行
   - ✅ Gemini是否生成图片
   - ✅ 飞书记录是否创建
   - ✅ 前端是否收到URL

### 测试飞书入口

1. 在飞书多维表格中点击触发按钮
2. 检查n8n执行历史
3. 确认飞书记录已创建

## 🔧 节点配置详解

### Webhook节点

| 参数 | 值 | 说明 |
|------|-----|------|
| HTTP Method | POST | 接收POST请求 |
| Path | scene-generate | Webhook路径 |
| Response Mode | responseNode | 使用Respond节点返回 |
| Authentication | None | 无需认证（代理服务器处理CORS） |

### SET节点（准备输入数据）

```javascript
{
  "source": "{{ $json.source || 'frontend' }}",
  "prompt": "{{ $json.prompt }}",
  "aspectRatio": "{{ $json.aspectRatio || '1:1' }}",
  "productImage": "{{ $binary.productImage }}",
  "sceneImage": "{{ $binary.sceneImage }}"
}
```

### HTTP Request节点（Gemini API）

- **URL**: `https://api.deerapi.com/v1/models/gemini-2.0-flash-exp-image-generation:generateContent`
- **Method**: POST
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  }
  ```
- **Body**:
  ```json
  {
    "contents": [
      {
        "parts": [
          { "inlineData": { "mimeType": "image/png", "data": "{{ $json.productImage }}" }},
          { "inlineData": { "mimeType": "image/png", "data": "{{ $json.sceneImage }}" }},
          { "text": "{{ $json.prompt }}" }
        ]
      }
    ]
  }
  ```

### IF节点（判断来源）

```
条件: {{ $json.source }} === "frontend"
- True: 连接到 "Respond to Webhook"
- False: 不连接（飞书触发不需要响应）
```

### Respond to Webhook节点

```json
{
  "imageUrl": "{{ $json.imageUrl }}",
  "success": true,
  "message": "图片生成成功"
}
```

## 🚨 常见问题

### Q1: Webhook无法触发

**解决方法**：
1. 确保代理服务器运行在端口3002
2. 检查 `.env` 文件中的webhook路径是否正确
3. 在n8n中点击 "Listen for Test Event"

### Q2: Gemini API调用失败

**解决方法**：
1. 检查DEERAPI_KEY是否正确配置
2. 确认账户有足够的API额度
3. 查看n8n执行日志中的错误详情

### Q3: 飞书记录保存失败

**解决方法**：
1. 确认飞书应用有权限访问该多维表格
2. 检查Table ID是否正确
3. 验证字段映射是否与表格列名匹配

### Q4: 前端收不到响应

**解决方法**：
1. 确保Webhook节点设置为 "responseNode" 模式
2. 检查 "Respond to Webhook" 节点已正确连接
3. 验证IF节点条件判断正确

## 📊 工作流执行示例

### 前端请求流程

```
用户上传图片
  ↓
前端发送FormData到 /webhook/scene-generate
  ↓
n8n接收请求（Webhook节点）
  ↓
准备输入数据（SET节点）
  ↓
调用Gemini生成图片（HTTP Request）
  ↓
提取生成的图片URL（SET节点）
  ↓
保存到飞书多维表格（Feishu节点）
  ↓
判断是否前端请求（IF节点）→ True
  ↓
返回图片URL给前端（Respond节点）
```

### 飞书触发流程

```
用户在飞书点击按钮
  ↓
飞书自动化触发webhook
  ↓
n8n接收请求（source: "feishu"）
  ↓
准备输入数据（从飞书记录读取）
  ↓
调用Gemini生成图片
  ↓
提取生成的图片URL
  ↓
保存到飞书多维表格
  ↓
判断是否前端请求（IF节点）→ False
  ↓
工作流结束（无需返回响应）
```

## 🔐 安全建议

1. **API Key保护**：
   - 不要在JSON文件中硬编码API Key
   - 使用n8n的凭证管理功能

2. **Webhook安全**：
   - 添加请求头验证
   - 限制允许的来源IP
   - 使用API Token验证

3. **数据验证**：
   - 验证上传文件的大小和类型
   - 限制prompt的长度
   - 防止注入攻击

## 📝 维护建议

1. **监控工作流**：
   - 定期检查n8n执行历史
   - 设置错误通知
   - 监控API使用量

2. **优化性能**：
   - 添加缓存机制
   - 优化图片处理
   - 批量处理请求

3. **版本管理**：
   - 导出工作流备份
   - 记录每次修改
   - 使用Git管理配置文件

---

**配置完成后，你的工作流将支持：**
- ✅ 前端用户上传图片并获取生成结果
- ✅ 飞书用户点击按钮自动生成场景图
- ✅ 所有生成记录统一保存到飞书多维表格
- ✅ 灵活的双入口设计，易于扩展
