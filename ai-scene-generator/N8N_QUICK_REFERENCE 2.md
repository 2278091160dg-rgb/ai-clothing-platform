# n8n 双Webhook配置 - 快速参考

## 🚀 快速启动（5分钟配置）

### 1️⃣ 导入工作流
```
n8n界面 → Import from File → 选择 n8n-workflow-dual-webhook.json
```

### 2️⃣ 激活两个Webhook
| Webhook | 路径 | 操作 |
|---------|------|------|
| 前端入口 | `/webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a` | 点击 "Listen for Test Event" |
| 飞书入口 | `/webhook/feishu-trigger` | 点击 "Listen for Test Event" |

### 3️⃣ 配置凭证（2个）
```
1. Gemini API (DEERAPI)
   → Header Auth
   → Authorization: Bearer YOUR_DEERAPI_KEY

2. 飞书多维表格
   → Feishu API
   → App ID & App Secret
```

### 4️⃣ 配置飞书Table ID
```
"保存到飞书记录"节点 → Table ID → 输入你的表格ID
```

### 5️⃣ 测试
```bash
# 启动代理服务器
node proxy-server.cjs

# 启动前端
npm run dev

# 上传图片测试
```

---

## 📡 Webhook URL总览

### 前端调用
```
POST http://localhost:3002/api/n8n/webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a
Content-Type: multipart/form-data

Body:
- productImage: (文件)
- sceneImage: (文件)
- prompt: (字符串)
- aspectRatio: (字符串)
```

### 飞书调用
```
POST https://n8n.denggui.top/webhook/feishu-trigger
Content-Type: application/json

Body:
{
  "source": "feishu",
  "record_id": "记录ID",
  "table_id": "表格ID"
}
```

---

## 🔧 核心节点配置速查

### Gemini API节点
```
URL: https://api.deerapi.com/v1/models/gemini-2.0-flash-exp-image-generation:generateContent
Method: POST
Response Format: JSON
```

### 提取imageUrl节点
```javascript
{{ $json.candidates[0].content.parts[0].inlineData.data }}
```

### Switch节点条件
```
Condition 1: {{ $json.source }} === "frontend"
Condition 2: {{ $json.source }} === "feishu"
```

### Respond to Webhook节点
```json
{
  "imageUrl": "{{ $json.imageUrl }}",
  "success": true
}
```

---

## ✅ 配置检查清单

导入和激活
- [ ] 工作流已导入
- [ ] Webhook A已激活（前端入口）
- [ ] Webhook B已激活（飞书入口）

凭证配置
- [ ] DEERAPI Key已配置
- [ ] 飞书API已配置
- [ ] 飞书Table ID已设置

节点配置
- [ ] Webhook A: Response Mode = "responseNode"
- [ ] Webhook B: Response Mode = "lastNode"
- [ ] Gemini: 使用正确的API凭证
- [ ] 飞书记录: Table ID正确
- [ ] Switch: 两个条件都已设置
- [ ] Respond: Response Body包含imageUrl

测试验证
- [ ] 前端能成功上传图片
- [ ] n8n工作流执行成功
- [ ] 返回imageUrl给前端
- [ ] 飞书记录正确保存
- [ ] 飞书按钮能触发工作流

---

## 📊 工作流结构图

```
┌──────────────────────────────────────────────────────────┐
│                    n8n 双Webhook工作流                      │
└──────────────────────────────────────────────────────────┘

前端请求                 飞书触发
    ↓                        ↓
Webhook A                Webhook B
(POST FormData)         (POST JSON)
    ↓                        ↓
标记前端来源            标记飞书来源
(source: frontend)      (source: feishu)
    ↓                        ↓
         └──────────┬───────────┘
                    ↓
            合并Webhook数据
                    ↓
            Gemini生成场景图
                    ↓
            提取imageUrl
                    ↓
            保存到飞书记录
                    ↓
            Switch判断来源
         ↙                    ↘
    source=frontend      source=feishu
         ↓                    ↓
  Respond to Webhook      结束(无响应)
    (返回JSON)          (飞书已保存)
```

---

## 🚨 常见问题速解

| 问题 | 解决方案 |
|------|---------|
| Webhook不工作 | 检查代理服务器是否运行在3002端口 |
| CORS错误 | 确认通过代理服务器访问，不直连n8n |
| Gemini调用失败 | 验证DEERAPI Key是否正确 |
| 图片未生成 | 检查Base64编码是否正确 |
| 飞书记录失败 | 确认Table ID和字段映射 |
| Switch判断错误 | 检查source字段是否正确设置 |
| 前端收不到响应 | 确认Respond节点已连接到Switch |

---

## 📁 相关文件

| 文件 | 用途 |
|------|------|
| `n8n-workflow-dual-webhook.json` | 工作流配置文件（导入此文件）|
| `N8N_DUAL_WEBHOOK_SETUP.md` | 详细配置指南 |
| `N8N_QUICK_REFERENCE.md` | 本文件（快速参考）|
| `.env` | 前端环境变量（无需修改）|

---

## 🔗 有用链接

- **n8n界面**: https://n8n.denggui.top
- **DEERAPI**: https://api.deerapi.com
- **飞书开放平台**: https://open.feishu.cn
- **代理服务器**: http://localhost:3002
- **前端应用**: http://localhost:3000

---

## 💡 提示

1. **首次配置**：建议先在n8n测试模式中手动触发每个节点
2. **调试技巧**：在关键节点间插入"Set"节点打印中间值
3. **日志查看**：n8n → Executions → 查看执行历史和错误信息
4. **备份习惯**：每次修改后导出备份工作流

---

**配置完成后，双入口系统即可正常工作！** ✨
