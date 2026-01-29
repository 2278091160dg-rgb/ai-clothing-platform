# 🚀 N8N 工作流快速开始指南

## ⚡ 5分钟快速部署

### 第一步：打开N8N

访问你的N8N实例：`http://localhost:5678`

---

### 第二步：创建新工作流

1. 点击右上角 **"+"** 按钮
2. 选择 **"Add Workflow"**

---

### 第三步：添加Webhook节点

1. 在节点搜索框输入 **"webhook"**
2. 选择 **"Webhook"** 节点并添加
3. 配置Webhook：
   - **HTTP Method**: `POST`
   - **Path**: `ai-clothing-generation`
   - 点击 **"Save"**
4. 复制 **"Production URL"** (类似 `https://your-n8n.com/webhook/xxx`)
5. 将这个URL添加到后端 `.env` 文件：
   ```bash
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/ai-clothing-generation
   ```

---

### 第四步：添加数据处理节点

添加 **"Set"** 节点，配置以下字段：

```
字段名: taskId
值: {{ $json.taskId }}
类型: String

字段名: prompt
值: {{ $json.prompt }}
类型: String

字段名: aiModel
值: {{ $json.aiModel }}
类型: String

字段名: aspectRatio
值: {{ $json.aspectRatio }}
类型: String

字段名: imageCount
值: {{ $json.imageCount }}
类型: Number
```

⚠️ **关键点**：所有值都使用 `{{ $json.xxx }}` 格式，不要写死！

---

### 第五步：配置AI生成节点

1. 添加 **"HTTP Request"** 节点
2. 配置DeerAPI调用：
   - **Method**: `POST`
   - **URL**: `https://api.deerapi.com/v1/ai/generate`
   - **Authentication**: 选择 "Header Auth"
     - Name: `Authorization`
     - Value: `Bearer YOUR_DEERAPI_KEY`
   - **Body** (使用JSON):
     ```json
     {
       "model": "{{ $json.aiModel }}",
       "prompt": "{{ $json.prompt }}",
       "image": "{{ $json.productImageUrl }}",
       "num_images": {{ $json.imageCount }}
     }
     ```

---

### 第六步：添加回调节点

添加另一个 **"HTTP Request"** 节点：

- **Method**: `POST`
- **URL**: `http://your-backend:3000/api/webhooks/n8n/callback`
- **Headers**:
  - `x-n8n-api-key`: `your-api-key-from-env`
- **Body**:
  ```json
  {
    "taskId": "{{ $json.taskId }}",
    "status": "completed",
    "resultImageUrls": "{{ $json.data.images }}"
  }
  ```

---

### 第七步：测试工作流

1. 点击 **"Webhook"** 节点
2. 点击 **"Listen for Test Event"**
3. 在前端创建一个测试任务
4. 查看N8N是否接收到请求
5. 检查每个节点的输入输出

---

## 📊 数据流向图

```
前端表单
    ↓
后端API (/api/tasks)
    ↓
创建任务 → 存入数据库
    ↓
触发N8N Webhook
    ↓
N8N工作流:
    1. 接收参数
    2. 调用AI生成
    3. 获取结果
    4. 回调后端
    ↓
更新任务状态
    ↓
前端轮询获取最新状态
```

---

## 🔑 关键参数说明

### 前端传递的参数

| 参数名            | 类型   | 说明             | 示例值             |
| ----------------- | ------ | ---------------- | ------------------ |
| `taskId`          | string | 任务唯一ID       | `uuid-xxx`         |
| `productImageUrl` | string | 商品图片URL      | `/uploads/abc.jpg` |
| `prompt`          | string | 用户输入的提示词 | `时尚模特在街头`   |
| `aiModel`         | string | AI模型           | `flux-realism`     |
| `aspectRatio`     | string | 图片比例         | `1:1`, `16:9`      |
| `imageCount`      | number | 生成数量         | `4`                |
| `quality`         | string | 质量设置         | `high`             |

### N8N传给AI的参数

| 参数         | 来源                     | 说明                 |
| ------------ | ------------------------ | -------------------- |
| `model`      | `{{ $json.aiModel }}`    | 使用前端选择的模型   |
| `prompt`     | `{{ $json.prompt }}`     | 使用用户输入的提示词 |
| `num_images` | `{{ $json.imageCount }}` | 使用前端选择的数量   |

⚠️ **不要写死！** 所有参数都应该从 `$json` 中读取！

---

## 🧪 测试数据

使用以下JSON测试工作流：

```json
{
  "taskId": "test-task-001",
  "userId": "dev-user-123",
  "productImageUrl": "https://picsum.photos/1024/1024",
  "prompt": "一个时尚的模特在街头",
  "aiModel": "flux-realism",
  "aspectRatio": "1:1",
  "imageCount": 2,
  "quality": "high",
  "callbackUrl": "http://localhost:3000/api/webhooks/n8n/callback"
}
```

---

## ✅ 部署检查清单

- [ ] N8N工作流已创建
- [ ] Webhook URL已复制
- [ ] 后端 `.env` 已配置 `N8N_WEBHOOK_URL`
- [ ] 后端 `.env` 已配置 `N8N_API_KEY`
- [ ] DeerAPI认证已配置
- [ ] 前端可以创建任务
- [ ] N8N能接收到请求
- [ ] AI生成成功
- [ ] 回调后端成功
- [ ] 前端能显示结果

---

## 🐛 常见错误

### 错误1: "Cannot read property 'aiModel' of undefined"

**原因**: 没有添加数据处理节点，直接使用 `$json`

**解决**: 添加 "Set" 节点提取所有字段

---

### 错误2: "API Key invalid"

**原因**: DeerAPI密钥错误或未配置

**解决**:

1. 检查 N8N credentials
2. 确认格式为 `Bearer YOUR_KEY`

---

### 错误3: "Callback failed"

**原因**: 后端地址无法访问或API Key不匹配

**解决**:

1. 确认后端正在运行
2. 检查 `N8N_API_KEY` 是否一致
3. 使用 curl 测试回调接口

---

## 📞 需要帮助？

1. 查看 [完整教程](./N8N_SETUP_GUIDE.md)
2. 检查 N8N 执行日志
3. 检查后端控制台输出
4. 使用浏览器开发工具查看网络请求

---

**准备好了吗？开始部署吧！** 🚀
