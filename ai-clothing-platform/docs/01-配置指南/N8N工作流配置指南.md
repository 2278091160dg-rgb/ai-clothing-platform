# 🔧 N8N工作流配置指南

## 快速开始

### 1. 导入工作流

1. 登录你的N8N实例
2. 点击右上角 **"Import from File"**
3. 选择文件：`docs/n8n-workflows/双轨工作流-场景生图-虚拟试衣.json`
4. 点击 **"Import"**

### 2. 配置Webhook节点

找到 **"Webhook接收"** 节点，配置：

```yaml
Webhook URL: your-n8n-instance.com/webhook/ai-clothing-generation
HTTP Method: POST
Authentication: None (或设置Header密钥)
```

**重要：** 复制Webhook URL并更新到项目的 `.env` 文件：

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-clothing-generation
```

### 3. 配置AI模型节点

#### 场景生图模式 (AI生成-场景图)

```yaml
模型ID: 你的FLUX模型ID
API Endpoint: 你的AI服务API地址
参数映射:
  - prompt: {{ $json.prompt }}
  - productImage: {{ $node['下载商品图'].binary.data }}
  - sceneImage: {{ $node['下载场景图'].binary.data }}
  - aspectRatio: {{ $json.aspectRatio || '1:1' }}
  - imageCount: {{ $json.imageCount || 4 }}
  - quality: {{ $json.quality || 'high' }}
```

#### 虚拟试衣模式 (AI生成-虚拟试衣)

```yaml
模型ID: 你的VITON/IDM-VTON模型ID
API Endpoint: 你的虚拟试衣API地址
参数映射:
  - prompt: {{ $json.prompt }}
  - modelImage: {{ $node['下载模特图'].binary.data }}
  - clothingImage: {{ $node['下载服装图'].binary.data }}
  - imageCount: {{ $json.imageCount || 4 }}
  - quality: {{ $json.quality || 'high' }}
```

### 4. 配置图片上传节点

找到 **"上传结果图"** 节点：

```yaml
API: DeerAPI或其他图床
认证: Bearer Token (你的DeerAPI Key)
```

### 5. 配置回调节点

找到 **"回调通知"** 节点：

```yaml
URL: {{ $json.callbackUrl || 'http://your-domain.com/api/webhooks/n8n/callback' }}
Method: POST
Body:
  - taskId: {{ $json.taskId }}
  - mode: {{ $json.mode }}
  - status: COMPLETED
  - resultImageUrls: {{ JSON.stringify($node['上传结果图'].json.urls) }}
```

---

## 📊 工作流结构

```
┌─────────────────┐
│  Webhook接收    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│    模式分发      │────►│ 场景生图?     │
└─────────────────┘     └──────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
              ┌──────────┐          ┌──────────┐
              │下载商品图 │          │下载场景图 │
              └────┬─────┘          └────┬─────┘
                   │                     │
                   └──────────┬──────────┘
                              ▼
                     ┌────────────────┐
                     │ AI生成-场景图   │
                     └────────┬───────┘
                              │
                              ▼
                     ┌────────────────┐
                     │  上传结果图     │
                     └────────┬───────┘
                              │
                              ▼
                     ┌────────────────┐
                     │   回调通知     │
                     └────────────────┘

并行处理虚拟试衣模式...
```

---

## 🧪 测试工作流

### 测试用例1: 场景生图

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "scene",
    "taskId": "test-001",
    "userId": "test-user",
    "productImageUrl": "https://example.com/product.jpg",
    "sceneImageUrl": "https://example.com/scene.jpg",
    "prompt": "时尚模特在现代咖啡厅",
    "aspectRatio": "1:1",
    "imageCount": 4,
    "quality": "high"
  }'
```

### 测试用例2: 虚拟试衣

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "tryon",
    "taskId": "test-002",
    "userId": "test-user",
    "modelImageUrl": "https://example.com/model.jpg",
    "clothingImageUrl": "https://example.com/clothing.jpg",
    "prompt": "红色连衣裙，优雅气质",
    "imageCount": 4,
    "quality": "high"
  }'
```

---

## 🔍 故障排查

### Webhook无法触发

- 检查N8N实例是否可访问
- 确认Webhook URL正确
- 查看N8N执行日志

### 图片下载失败

- 检查图片URL是否可访问
- 确认有网络访问权限
- 查看下载节点错误信息

### AI生成失败

- 确认AI模型API密钥有效
- 检查请求格式是否符合API要求
- 查看AI服务返回的错误信息

### 回调失败

- 确认回调URL可访问
- 检查防火墙设置
- 查看N8N执行日志中的错误详情

---

## 📝 API数据格式参考

### Webhook接收格式

```json
{
  "mode": "scene|tryon|wear|combine",
  "taskId": "uuid",
  "userId": "user-id",
  "prompt": "提示词",
  "aiModel": "FLUX.1",
  "aspectRatio": "1:1",
  "imageCount": 4,
  "quality": "high",
  // 场景生图模式
  "productImageUrl": "https://...",
  "sceneImageUrl": "https://...",
  // 虚拟试衣模式
  "modelImageUrl": "https://...",
  "clothingImageUrl": "https://..."
}
```

### 回调格式

```json
{
  "taskId": "uuid",
  "mode": "scene|tryon",
  "status": "COMPLETED",
  "resultImageUrls": ["https://example.com/result1.jpg", "https://example.com/result2.jpg"]
}
```

---

_文档创建时间: 2026-01-29_
