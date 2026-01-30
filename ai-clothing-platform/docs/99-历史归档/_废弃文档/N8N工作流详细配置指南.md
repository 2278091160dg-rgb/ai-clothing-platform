# 🔧 N8N双轨工作流详细配置指南

## 📋 目录

1. [快速开始](#快速开始)
2. [需要修改的参数清单](#需要修改的参数清单)
3. [节点详细配置](#节点详细配置)
4. [连线验证](#连线验证)
5. [测试验证](#测试验证)
6. [常见问题](#常见问题)

---

## 🚀 快速开始

### 第1步：导入工作流

1. 登录你的N8N实例
2. 点击右上角 **"Import from File"** 或 **"从文件导入"**
3. 选择文件：`docs/n8n-workflows/AI服装平台-双轨工作流-最终版.json`
4. 点击 **"Import"** 或 **"导入"**

### 第2步：查看工作流结构

导入后你会看到以下节点结构：

```
┌─────────────────────┐
│ 【修改】Webhook接收  │ ⚠️ 需要配置Webhook URL
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   提取请求参数      │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐  ┌──────────┐
│判断：场景│  │判断：虚拟│
│生图？    │  │试衣？    │
└────┬─────┘  └────┬─────┘
     │             │
     ▼             ▼
┌─────────┐   ┌─────────┐
│下载商品图│   │下载模特图│
│下载场景图│   │下载服装图│
└────┬────┘   └────┬────┘
     │             │
     └──────┬──────┘
            ▼
     ┌─────────────┐
     │【修改】AI生成│ ⚠️ 需要配置API
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │【修改】上传  │ ⚠️ 需要配置API
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │【修改】回调  │ ⚠️ 需要配置URL
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │ Webhook响应  │
     └─────────────┘
```

---

## ⚠️ 需要修改的参数清单

### 🔴 高优先级（必须修改）

| 节点名称                    | 参数位置   | 参数名           | 示例值                                             |
| --------------------------- | ---------- | ---------------- | -------------------------------------------------- |
| **【修改】Webhook接收**     | 节点设置   | Path             | `ai-clothing`                                      |
| **【修改】AI生成-场景生图** | 代码第2行  | `AI_API_URL`     | `https://your-ai-api.com/generate`                 |
| **【修改】AI生成-场景生图** | 代码第3行  | `AI_API_KEY`     | `your-api-key-here`                                |
| **【修改】AI生成-场景生图** | 代码第10行 | `model`          | `FLUX.1`                                           |
| **【修改】AI生成-虚拟试衣** | 代码第2行  | `TRYON_API_URL`  | `https://your-tryon-api.com/generate`              |
| **【修改】AI生成-虚拟试衣** | 代码第3行  | `TRYON_API_KEY`  | `your-tryon-api-key-here`                          |
| **【修改】AI生成-虚拟试衣** | 代码第10行 | `model`          | `VITON`                                            |
| **【修改】上传结果图**      | 代码第2行  | `UPLOAD_API_URL` | `https://api.deerapi.com/upload`                   |
| **【修改】上传结果图**      | 代码第3行  | `UPLOAD_API_KEY` | `your-deerapi-key-here`                            |
| **【修改】回调通知**        | URL        | `url`            | `http://your-domain.com/api/webhooks/n8n/callback` |

### 🟡 中优先级（建议修改）

| 节点名称                | 参数位置 | 参数名         | 说明               |
| ----------------------- | -------- | -------------- | ------------------ |
| **【修改】Webhook接收** | 节点设置 | Authentication | 建议添加Header认证 |
| **【修改】回调通知**    | Headers  | 自定义Header   | 添加认证密钥       |

---

## 📖 节点详细配置

### 节点1：【修改】Webhook接收

**功能：** 接收来自前端的AI生成请求

**配置步骤：**

1. 点击节点进入编辑模式
2. **HTTP Method**: 选择 `POST`
3. **Path**: 输入 `ai-clothing`（或你自定义的路径）
4. **Response Mode**: 选择 `Using 'Respond to Webhook' Node`
5. **Authentication** (可选):
   - 选择 `Header Auth`
   - 添加密钥验证：`X-Webhook-Token`

**获取Webhook URL：**
配置完成后，点击节点右上角的 **"Production URL"** 或 **"生产URL"** 复制URL，格式类似：

```
https://your-n8n-instance.com/webhook/ai-clothing
```

**更新到项目环境变量：**

```bash
# 编辑 .env.local 文件
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-clothing
```

---

### 节点2：提取请求参数

**功能：** 从Webhook请求体中提取参数

**无需修改** - 该节点自动提取以下参数：

- `mode`: 模式（scene/tryon）
- `taskId`: 任务ID
- `userId`: 用户ID
- `prompt`: 提示词
- `aspectRatio`: 宽高比
- `imageCount`: 图片数量
- `quality`: 质量
- `productImageUrl`: 商品图片URL（场景模式）
- `sceneImageUrl`: 场景图片URL（场景模式）
- `modelImageUrl`: 模特图片URL（试衣模式）
- `clothingImageUrl`: 服装图片URL（试衣模式）

---

### 节点3：判断：场景生图？

**功能：** 判断是否为场景生图模式

**条件设置：**

```
Left Value: {{ $json.mode }}
Operation: Equals
Right Value: scene
```

**True输出**: 执行场景生图流程
**False输出**: 跳到下一个判断节点

---

### 节点4：判断：虚拟试衣？

**功能：** 判断是否为虚拟试衣模式

**条件设置：**

```
Left Value: {{ $json.mode }}
Operation: Equals
Right Value: tryon
```

**True输出**: 执行虚拟试衣流程
**False输出**: 设置为不支持的模式错误

---

### 节点5-6：下载图片（4个节点）

**功能：** 从URL下载图片为二进制数据

**配置：**

- `下载商品图`: URL = `{{ $json.productImageUrl }}`
- `下载场景图`: URL = `{{ $json.sceneImageUrl }}`
- `下载模特图`: URL = `{{ $json.modelImageUrl }}`
- `下载服装图`: URL = `{{ $json.clothingImageUrl }}`

**Response Format**: 选择 `File`

---

### 节点7：【修改】AI生成-场景生图

**功能：** 调用AI API生成场景图

**⚠️ 必须修改的参数：**

点击节点，编辑JavaScript代码：

```javascript
// ==================== 配置区域 ====================
const AI_API_URL = 'https://your-ai-api.com/generate'; // ⚠️ 修改为你的AI API地址
const AI_API_KEY = 'your-api-key-here'; // ⚠️ 修改为你的API密钥
const MODEL_ID = 'FLUX.1'; // ⚠️ 修改为你的模型ID
// ==================================================

const requestBody = {
  model: MODEL_ID,
  prompt: $input.item.json.prompt,
  product_image: $input.item.json.binary.productImage.data,
  scene_image: $input.item.json.binary.sceneImage.data,
  aspect_ratio: $input.item.json.aspectRatio || '1:1',
  num_images: $input.item.json.imageCount || 4,
  quality: $input.item.json.quality || 'high',
};

// 发送请求
const response = await fetch(AI_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AI_API_KEY}`,
  },
  body: JSON.stringify(requestBody),
});

const result = await response.json();

return {
  json: {
    taskId: $input.item.json.taskId,
    mode: 'scene',
    success: result.success || true,
    images: result.images || [],
    message: result.message || '生成成功',
  },
};
```

**根据你的AI API调整：**

- 请求体格式
- 认证方式
- 响应数据结构

---

### 节点8：【修改】AI生成-虚拟试衣

**功能：** 调用虚拟试衣API生成试衣图

**⚠️ 必须修改的参数：**

```javascript
// ==================== 配置区域 ====================
const TRYON_API_URL = 'https://your-tryon-api.com/generate'; // ⚠️ 修改
const TRYON_API_KEY = 'your-tryon-api-key-here'; // ⚠️ 修改
const MODEL_ID = 'VITON'; // ⚠️ 修改
// ==================================================

const requestBody = {
  model: MODEL_ID,
  prompt: $input.item.json.prompt,
  model_image: $input.item.json.binary.modelImage.data,
  clothing_image: $input.item.json.binary.clothingImage.data,
  num_images: $input.item.json.imageCount || 4,
  quality: $input.item.json.quality || 'high',
};

// 发送请求
const response = await fetch(TRYON_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TRYON_API_KEY}`,
  },
  body: JSON.stringify(requestBody),
});

const result = await response.json();

return {
  json: {
    taskId: $input.item.json.taskId,
    mode: 'tryon',
    success: result.success || true,
    images: result.images || [],
    message: result.message || '生成成功',
  },
};
```

---

### 节点9：【修改】上传结果图

**功能：** 将生成的图片上传到图床

**⚠️ 必须修改的参数：**

```javascript
// ==================== 配置区域 ====================
const UPLOAD_API_URL = 'https://api.deerapi.com/upload'; // ⚠️ 修改为你的图床API
const UPLOAD_API_KEY = 'your-deerapi-key-here'; // ⚠️ 修改为你的API密钥
// ==================================================

const images = $input.item.json.images || [];
const uploadedUrls = [];

// 根据你的图床API调整上传逻辑
for (const imageData of images) {
  try {
    const formData = new FormData();

    // 如果imageData是base64
    if (imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      formData.append('file', blob, 'result.jpg');
    } else {
      // 如果是URL或其他格式
      formData.append('file', imageData);
    }

    const response = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPLOAD_API_KEY}`,
      },
      body: formData,
    });

    const result = await response.json();
    uploadedUrls.push(result.url || result.data?.url);
  } catch (error) {
    console.error('图片上传失败:', error);
  }
}

return {
  json: {
    ...$input.item.json,
    resultImageUrls: uploadedUrls,
    uploadCount: uploadedUrls.length,
  },
};
```

---

### 节点10：【修改】回调通知

**功能：** 通知前端任务完成

**⚠️ 必须修改的参数：**

1. **URL**: 修改为你的回调地址

   ```
   http://your-domain.com/api/webhooks/n8n/callback
   ```

2. **Method**: `POST`

3. **Request Body** (JSON格式):

   ```json
   {
     "taskId": "{{ $json.taskId }}",
     "mode": "{{ $json.mode }}",
     "status": "COMPLETED",
     "resultImageUrls": "{{ $json.resultImageUrls }}",
     "message": "{{ $json.message }}"
   }
   ```

4. **Authentication** (可选):
   - 如果需要认证，添加Header:
     ```
     X-Callback-Token: your-callback-secret
     ```

---

### 节点11：Webhook响应

**功能：** 立即响应Webhook请求

**无需修改** - 自动返回：

```json
{
  "success": true,
  "message": "任务已接收",
  "taskId": "xxx",
  "mode": "scene"
}
```

---

### 节点12：设置错误-不支持的模式

**功能：** 处理不支持的模式

**无需修改** - 自动返回错误信息

---

## 🔗 连线验证

### 检查连线

在N8N工作流编辑器中，确认以下连线存在：

**主线流程：**

1. ✅ `【修改】Webhook接收` → `提取请求参数`
2. ✅ `提取请求参数` → `判断：场景生图？`
3. ✅ `提取请求参数` → `判断：虚拟试衣？`

**场景生图分支：** 4. ✅ `判断：场景生图？` (True) → `下载商品图` 5. ✅ `判断：场景生图？` (True) → `下载场景图` 6. ✅ `下载商品图` → `【修改】AI生成-场景生图` 7. ✅ `下载场景图` → `【修改】AI生成-场景生图`

**虚拟试衣分支：** 8. ✅ `判断：虚拟试衣？` (True) → `下载模特图` 9. ✅ `判断：虚拟试衣？` (True) → `下载服装图` 10. ✅ `下载模特图` → `【修改】AI生成-虚拟试衣` 11. ✅ `下载服装图` → `【修改】AI生成-虚拟试衣`

**合并流程：** 12. ✅ `【修改】AI生成-场景生图` → `【修改】上传结果图` 13. ✅ `【修改】AI生成-虚拟试衣` → `【修改】上传结果图` 14. ✅ `【修改】上传结果图` → `【修改】回调通知` 15. ✅ `【修改】回调通知` → `Webhook响应`

**错误处理：** 16. ✅ `判断：场景生图？` (False) → `设置错误-不支持的模式` 17. ✅ `判断：虚拟试衣？` (False) → `设置错误-不支持的模式` 18. ✅ `设置错误-不支持的模式` → `Webhook响应`

### 保存工作流

1. 点击右上角 **"Save"** 或 **"保存"**
2. 点击 **"Active"** 或 **"激活"** 开关，确保工作流处于激活状态

---

## 🧪 测试验证

### 测试1: 场景生图模式

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "scene",
    "taskId": "test-scene-001",
    "userId": "test-user",
    "productImageUrl": "https://picsum.photos/seed/product/512/512",
    "sceneImageUrl": "https://picsum.photos/seed/scene/512/512",
    "prompt": "时尚模特在现代咖啡厅",
    "aspectRatio": "1:1",
    "imageCount": 2,
    "quality": "high"
  }'
```

**预期响应：**

```json
{
  "success": true,
  "message": "任务已接收",
  "taskId": "test-scene-001",
  "mode": "scene"
}
```

### 测试2: 虚拟试衣模式

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "tryon",
    "taskId": "test-tryon-001",
    "userId": "test-user",
    "modelImageUrl": "https://picsum.photos/seed/model/512/512",
    "clothingImageUrl": "https://picsum.photos/seed/clothing/512/512",
    "prompt": "红色连衣裙",
    "imageCount": 2,
    "quality": "high"
  }'
```

### 测试3: 不支持的模式

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "unsupported",
    "taskId": "test-error-001",
    "userId": "test-user"
  }'
```

---

## ❓ 常见问题

### Q1: Webhook节点显示"Waiting for webhook"

**A:** 这是正常的。保存并激活工作流后，Webhook会自动监听。可以通过发送测试请求来验证。

### Q2: 图片下载失败

**A:** 检查：

- 图片URL是否可公开访问
- 是否有CORS限制
- N8N服务器是否有网络访问权限

### Q3: AI生成节点报错

**A:** 检查：

- API_URL是否正确
- API_KEY是否有效
- 请求体格式是否符合API要求
- 响应数据结构是否正确

### Q4: 回调失败

**A:** 检查：

- 回调URL是否可访问
- 防火墙是否阻止N8N服务器访问
- 是否需要认证密钥

### Q5: 如何查看执行日志？

**A:**

1. 点击左侧菜单 **"Executions"** 或 **"执行记录"**
2. 查看每次Webhook触发的执行详情
3. 点击每个节点查看输入输出数据

---

## 📝 配置检查清单

导入工作流后，逐项检查：

- [ ] **Webhook URL已复制** 并更新到 `.env.local`
- [ ] **AI_API_URL** 已修改为实际的AI API地址
- [ ] **AI_API_KEY** 已设置为有效的API密钥
- [ ] **MODEL_ID** 已设置为正确的模型ID
- [ ] **TRYON_API_URL** 已修改为实际的虚拟试衣API地址
- [ ] **TRYON_API_KEY** 已设置为有效的API密钥
- [ ] **UPLOAD_API_URL** 已修改为图床API地址
- [ ] **UPLOAD_API_KEY** 已设置为有效的图床密钥
- [ ] **回调URL** 已修改为实际域名
- [ ] **所有连线** 已验证正确
- [ ] **工作流已激活**
- [ ] **测试请求** 已成功执行

---

_文档创建时间: 2026-01-29_
_工作流版本: v1.0.0_
