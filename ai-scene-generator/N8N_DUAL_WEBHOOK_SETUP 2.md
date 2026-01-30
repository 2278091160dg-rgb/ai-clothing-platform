# n8n 完整版双Webhook工作流 - 配置指南

## 🎯 方案概述

使用完整版双Webhook方案，实现前端和飞书两个独立入口：

```
前端入口: /webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a
飞书入口: /webhook/feishu-trigger
```

## 📥 导入步骤

### 1. 导入工作流到n8n

1. 打开 n8n: https://n8n.denggui.top
2. 点击右上角 **"+"** 创建新工作流
3. 点击右上角 **"..."** → **"Import from File"**
4. 选择文件：`n8n-workflow-dual-webhook.json`
5. 点击 **"Import"** 导入

### 2. 激活两个Webhook

导入后，你会看到两个Webhook节点，分别激活：

#### Webhook A（前端入口）
1. 点击 **"Webhook A (前端入口)"** 节点
2. 点击 **"Listen for Test Event"**
3. 确认Webhook URL：`/webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a`
4. 状态变为 **"Active"**

#### Webhook B（飞书入口）
1. 点击 **"Webhook B (飞书入口)"** 节点
2. 点击 **"Listen for Test Event"**
3. 确认Webhook URL：`/webhook/feishu-trigger`
4. 状态变为 **"Active"**

## ⚙️ 配置凭证

### 3. 配置 Gemini API 凭证

1. 找到 **"Gemini生成场景图"** 节点
2. 点击 **Credentials** → **Create New**
3. 选择 **"Header Auth"**
4. 配置：
   - **Credential Name**: `DEERAPI Gemini`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_DEERAPI_KEY`
5. 点击 **"Save"**

> 获取DEERAPI Key: https://api.deerapi.com

### 4. 配置飞书API凭证

1. 找到 **"保存到飞书记录"** 节点
2. 点击 **Credentials** → **Create New**（或选择已有）
3. 选择 **"Feishu API"**
4. 配置：
   - **Credential Name**: `飞书多维表格`
   - **App ID**: `cli_xxxxxxxxxxxxx`
   - **App Secret**: `your_app_secret`
5. 点击 **"Save"**

> 飞书应用配置: https://open.feishu.cn/app

## 🔧 配置节点参数

### 5. 配置飞书记录节点

1. 点击 **"保存到飞书记录"** 节点
2. 配置参数：
   - **Operation**: `Append` (追加记录)
   - **Table ID**: 输入你的多维表格ID
   - **Data**: 设置要保存的字段

```json
{
  "图片": "{{ $json.imageUrl }}",
  "提示词": "{{ $json.prompt }}",
  "来源": "{{ $json.source }}",
  "宽高比": "{{ $json.aspectRatio }}",
  "创建时间": "{{ $now.toISO() }}"
}
```

### 6. 配置 Respond to Webhook 节点

1. 点击 **"Respond to Webhook (前端)"** 节点
2. 配置：
   - **Respond With**: `JSON`
   - **Response Body**:
   ```json
   {
     "imageUrl": "{{ $json.imageUrl }}",
     "success": true,
     "message": "场景图生成成功"
   }
   ```
   - **Response Code**: `200`

### 7. 配置 Switch 节点

1. 点击 **"判断来源"** 节点
2. 配置条件：
   - **Condition 1**: `{{ $json.source }} === "frontend"`
     - Output: `frontend-response`
   - **Condition 2**: `{{ $json.source }} === "feishu"`
     - Output: `feishu-end`

## 🧪 测试工作流

### 测试前端入口

1. **启动代理服务器**：
   ```bash
   cd /Users/denggui/Documents/trae_projects/PENCILTEST/ai-scene-generator
   node proxy-server.cjs
   ```

2. **启动前端**：
   ```bash
   npm run dev
   ```

3. **测试上传**：
   - 上传商品图和场景图
   - 输入提示词
   - 点击"开始生成场景图"
   - 检查是否返回生成的图片URL

4. **检查n8n执行**：
   - 打开n8n工作流
   - 查看 **Executions** 页面
   - 确认工作流执行成功

### 测试飞书入口

1. **配置飞书自动化**：
   - 打开飞书多维表格
   - 点击 **自动化** → **新建自动化**
   - 触发器：**当按钮被点击时**
   - 操作：**发送Webhook请求**
   - URL: `https://n8n.denggui.top/webhook/feishu-trigger`
   - 请求体：
   ```json
   {
     "source": "feishu",
     "record_id": "{{ 记录ID }}",
     "table_id": "{{ 表格ID }}"
   }
   ```

2. **测试触发**：
   - 在飞书多维表格中点击按钮
   - 检查n8n是否接收到webhook
   - 确认图片生成并保存到飞书

## 📊 工作流数据流

### 前端入口流程

```
1. 前端发送FormData
   ↓
2. Webhook A接收 (productImage, sceneImage, prompt, aspectRatio)
   ↓
3. 标记前端来源 (source: "frontend")
   ↓
4. 合并Webhook数据
   ↓
5. Gemini生成场景图
   ↓
6. 提取imageUrl
   ↓
7. 保存到飞书记录
   ↓
8. 判断来源 (source === "frontend") → True
   ↓
9. Respond to Webhook返回imageUrl
```

### 飞书入口流程

```
1. 飞书按钮触发
   ↓
2. Webhook B接收 (record_id, table_id)
   ↓
3. 标记飞书来源 (source: "feishu")
   ↓
4. 合并Webhook数据
   ↓
5. 读取飞书记录获取图片和提示词
   ↓
6. Gemini生成场景图
   ↓
7. 提取imageUrl
   ↓
8. 保存到飞书记录
   ↓
9. 判断来源 (source === "feishu") → True
   ↓
10. 结束(飞书) - 无需返回响应
```

## 🔍 节点配置详情

### Webhook A（前端入口）

| 参数 | 值 |
|------|-----|
| HTTP Method | POST |
| Path | `4eebc87c-b884-47c6-a6b1-80ff6b62ce8a` |
| Response Mode | `Using 'Respond to Webhook' Node` |
| Authentication | None |

**接收数据**：
- `productImage`: 文件（二进制）
- `sceneImage`: 文件（二进制）
- `prompt`: 字符串
- `aspectRatio`: 字符串

### Webhook B（飞书入口）

| 参数 | 值 |
|------|-----|
| HTTP Method | POST |
| Path | `feishu-trigger` |
| Response Mode | `Last Node` |
| Authentication | None（可选添加Token验证） |

**接收数据**：
- `source`: "feishu"
- `record_id`: 字符串
- `table_id`: 字符串

### SET节点 - 标记前端来源

```javascript
{
  "source": "frontend",
  "productImage": "{{ $binary.productImage }}",
  "sceneImage": "{{ $binary.sceneImage }}",
  "prompt": "{{ $json.prompt }}",
  "aspectRatio": "{{ $json.aspectRatio }}"
}
```

### SET节点 - 标记飞书来源

```javascript
{
  "source": "feishu",
  "record_id": "{{ $json.record_id }}",
  "table_id": "{{ $json.table_id }}"
}
```

### Gemini API节点

```javascript
// URL
https://api.deerapi.com/v1/models/gemini-2.0-flash-exp-image-generation:generateContent

// Method
POST

// Headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}

// Body
{
  "contents": [
    {
      "parts": [
        {
          "inlineData": {
            "mimeType": "image/png",
            "data": "{{ $json.productImage.data.toString('base64') }}"
          }
        },
        {
          "inlineData": {
            "mimeType": "image/png",
            "data": "{{ $json.sceneImage.data.toString('base64') }}"
          }
        },
        {
          "text": "{{ $json.prompt }}"
        }
      ]
    }
  ]
}
```

### SET节点 - 提取imageUrl

```javascript
{
  "imageUrl": "{{ $json.candidates[0].content.parts[0].inlineData.data }}"
}
```

### Switch节点 - 判断来源

**Routing**:
- Condition 1: `{{ $json.source }} === "frontend"` → Respond to Webhook
- Condition 2: `{{ $json.source }} === "feishu"` → 结束节点

### Respond to Webhook节点

```javascript
{
  "imageUrl": "{{ $json.imageUrl }}",
  "success": true,
  "message": "场景图生成成功",
  "timestamp": "{{ $now.toISO() }}"
}
```

## 🚨 故障排查

### 问题1：Webhook无法触发

**检查清单**：
- ✅ 代理服务器运行在端口3002
- ✅ Webhook节点状态为"Active"
- ✅ CORS配置正确
- ✅ Webhook URL路径正确

**解决方法**：
```bash
# 检查代理服务器状态
curl http://localhost:3002/api/n8n/webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a

# 测试n8n webhook直连
curl -X POST https://n8n.denggui.top/webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a
```

### 问题2：Gemini API调用失败

**检查清单**：
- ✅ DEERAPI Key正确配置
- ✅ API账户有足够额度
- ✅ 请求格式正确

**调试方法**：
1. 在n8n中查看执行日志
2. 检查HTTP Response状态码
3. 验证Base64编码的图片数据

### 问题3：飞书记录保存失败

**检查清单**：
- ✅ 飞书应用有权限访问表格
- ✅ Table ID正确
- ✅ 字段映射匹配表格列名

**解决方法**：
```bash
# 使用飞书开放平台测试工具
https://open.feishu.cn/api-explorer/bitable/v1/app_table_record/create
```

### 问题4：Switch节点判断错误

**检查清单**：
- ✅ source字段正确设置
- ✅ 条件表达式语法正确
- ✅ 节点连接正确

**调试方法**：
在Switch节点前添加一个**Set节点**打印调试信息：
```javascript
{
  "debug_source": "{{ $json.source }}",
  "debug_type": "{{ typeof $json.source }}"
}
```

## 📝 保存和备份

### 导出工作流备份

1. 在n8n中打开工作流
2. 点击 **"..."** → **"Download"**
3. 保存为 `n8n-workflow-backup-YYYYMMDD.json`

### 版本管理

建议使用Git管理工作流配置：

```bash
# 添加工作流文件到Git
git add n8n-workflow-dual-webhook.json
git commit -m "添加n8n双Webhook工作流配置"
```

## 🔐 安全建议

1. **Webhook安全**：
   - 添加API Token验证
   - 限制允许的来源IP
   - 使用HTTPS

2. **API Key保护**：
   - 使用n8n凭证管理
   - 定期轮换密钥
   - 设置使用额度限制

3. **数据验证**：
   - 验证文件大小和类型
   - 限制prompt长度
   - 防止注入攻击

## ✅ 配置完成检查清单

- [ ] 两个Webhook节点都已激活
- [ ] Gemini API凭证已配置
- [ ] 飞书API凭证已配置
- [ ] 飞书Table ID已设置
- [ ] Respond to Webhook节点已配置
- [ ] Switch节点条件已设置
- [ ] 前端测试成功
- [ ] 飞书测试成功
- [ ] 数据正确保存到飞书

---

**配置完成后，你的系统支持**：
- ✅ 前端用户上传图片并获取URL
- ✅ 飞书用户点击按钮自动生成
- ✅ 所有记录统一保存到飞书多维表格
- ✅ 独立的双入口，灵活扩展
