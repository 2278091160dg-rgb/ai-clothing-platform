# N8N 工作流完整使用教程

## 📖 目录

1. [前置准备](#前置准备)
2. [导入工作流](#导入工作流)
3. [配置认证信息](#配置认证信息)
4. [测试工作流](#测试工作流)
5. [常见问题](#常见问题)

---

## 前置准备

### 1. 确认 N8N 已安装并运行

```bash
# 检查 N8N 是否运行
# 访问: http://localhost:5678
```

### 2. 准备以下信息

| 配置项          | 说明             | 获取方式                                         |
| --------------- | ---------------- | ------------------------------------------------ |
| **DeerAPI Key** | DeerAPI的API密钥 | 从 [DeerAPI控制台](https://api.deerapi.com) 获取 |
| **后端URL**     | 你的后端服务地址 | 开发环境: `http://localhost:3000`                |
| **Webhook URL** | N8N的Webhook地址 | N8N会自动生成                                    |

---

## 导入工作流

### 步骤 1: 导入JSON文件

1. 打开 N8N 界面
2. 点击右上角的 **"+"** 按钮，选择 **"Import from File"**
3. 选择 `docs/n8n-workflow-complete.json` 文件
4. 点击 **"Import"**

### 步骤 2: 查看工作流

导入后你会看到以下节点：

```
Webhook触发器 → 解析请求参数 → 检查图片比例
                                           ↓
                              ┌──────────┴──────────┐
                              ↓                     ↓
                         1:1尺寸                 3:4尺寸
                              ↓                     ↓
                         16:9尺寸                9:16尺寸
                              ↓                     ↓
                         └──────────┬──────────┘
                                    ↓
                             AI图片生成
                                    ↓
                             格式化结果
                                    ↓
                             回调后端API
                                    ↓
                          返回Webhook响应
```

---

## 配置认证信息

### 1. 配置 DeerAPI 认证

**a. 在 N8N 中创建认证：**

1. 点击左侧菜单的 **"Credentials"**
2. 点击 **"New Credential"**
3. 选择 **"Header Auth"** 类型
4. 配置如下：
   - **Name**: `DeerAPI认证`
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_DEERAPI_KEY`
5. 点击 **"Save"**

**b. 关联到HTTP Request节点：**

1. 点击 **"AI图片生成"** 节点
2. 在右侧配置面板找到 **"Credentials"**
3. 选择 **"Header Auth"** → **"DeerAPI认证"**

### 2. 获取 Webhook URL

1. 点击 **"Webhook触发器"** 节点
2. 在右侧配置面板可以看到 **"Production URL"**
3. 复制这个URL，格式类似：
   ```
   https://your-n8n.com/webhook/ai-clothing-generation
   ```

### 3. 配置后端环境变量

在你的后端 `.env` 文件中添加：

```bash
# N8N配置
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/ai-clothing-generation
N8N_API_KEY=your-secret-key
```

---

## 测试工作流

### 方法1: 使用 N8N 测试功能

1. 点击 **"Webhook触发器"** 节点
2. 点击右上角的 **"Execute Workflow"**
3. 会弹出 **"Test Workflow"** 对话框
4. 切换到 **"Manual Execution"** 标签
5. 点击 **"Listen for Test Event"**

### 方法2: 使用 curl 命令测试

```bash
curl -X POST https://your-n8n.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-123",
    "userId": "dev-user-123",
    "productImageUrl": "https://example.com/product.jpg",
    "prompt": "一个时尚的模特在街头",
    "aiModel": "flux-realism",
    "aspectRatio": "1:1",
    "imageCount": 4,
    "quality": "high",
    "callbackUrl": "http://your-backend.com/api/webhooks/n8n/callback"
  }'
```

### 方法3: 从前端测试

1. 启动后端服务：`npm run dev`
2. 打开前端页面：`http://localhost:3000`
3. 上传商品图片
4. 输入提示词
5. 点击 **"开始生成场景图"**
6. 查看 N8N 执行日志

---

## 工作流详细说明

### 节点1: Webhook触发器

**作用**: 接收后端发送的生成请求

**接收的数据格式**:

```json
{
  "taskId": "uuid",
  "userId": "user-id",
  "productImageUrl": "/uploads/product.jpg",
  "sceneImageUrl": "/uploads/scene.jpg",
  "prompt": "用户输入的提示词",
  "aiModel": "flux-realism",
  "aspectRatio": "1:1",
  "imageCount": 4,
  "quality": "high",
  "callbackUrl": "http://localhost:3000/api/webhooks/n8n/callback"
}
```

---

### 节点2: 解析请求参数

**作用**: 将JSON数据提取为独立的字段

**输出字段**:

- `taskId`: 任务ID
- `userId`: 用户ID
- `productImageUrl`: 商品图片URL
- `sceneImageUrl`: 场景图片URL（可选）
- `prompt`: 提示词
- `aiModel`: AI模型
- `aspectRatio`: 图片比例
- `imageCount`: 生成数量
- `quality`: 质量设置
- `callbackUrl`: 回调地址

---

### 节点3: 检查图片比例

**作用**: 根据前端传入的 `aspectRatio` 参数，决定图片尺寸

**分支说明**:
| 比例 | 分支 | 输出尺寸 |
|------|------|----------|
| 1:1 | ✅ 第一个输出 | 1024x1024 |
| 3:4 | ✅ 第二个输出 | 768x1024 |
| 16:9 | ✅ 第三个输出 | 1344x768 |
| 9:16 | ✅ 第四个输出 | 768x1344 |

---

### 节点4-7: 尺寸设置节点

**作用**: 根据图片比例设置对应的宽度和高度

**关键配置**: ⚠️ **不要写死这些值！**

这些节点的值来自前端的 `aspectRatio` 参数，不是硬编码的！

---

### 节点8: AI图片生成

**作用**: 调用 DeerAPI 生成图片

**重要参数**:

| 参数         | 来源                          | 说明                        |
| ------------ | ----------------------------- | --------------------------- |
| `model`      | `{{ $json.aiModel }}`         | 从前端传入，如 flux-realism |
| `prompt`     | `{{ $json.prompt }}`          | 用户输入的提示词            |
| `image`      | `{{ $json.productImageUrl }}` | 商品图片URL                 |
| `width`      | `{{ $json.width }}`           | 根据比例动态计算            |
| `height`     | `{{ $json.height }}`          | 根据比例动态计算            |
| `num_images` | `{{ $json.imageCount }}`      | 从前端传入，如4张           |

**⚠️ 关键点**:

- ✅ 所有参数都用 `{{ $json.xxx }}` 引用
- ❌ 不要直接写死值，如 `"flux-1.1-pro"` 或 `1024`

---

### 节点9: 格式化结果

**作用**: 将AI返回的图片数组格式化

**输出**:

```json
{
  "resultImageUrls": ["url1", "url2", "url3", "url4"],
  "status": "completed"
}
```

---

### 节点10: 回调后端API

**作用**: 将生成结果发送回后端

**发送的数据**:

```json
{
  "taskId": "任务ID",
  "status": "completed",
  "resultImageUrls": ["图片URL数组"],
  "progress": 100
}
```

---

### 节点11: 返回Webhook响应

**作用**: 给后端返回成功响应

**响应内容**:

```json
{
  "success": true,
  "taskId": "任务ID",
  "message": "图片生成成功"
}
```

---

## 常见问题

### Q1: Webhook无法触发？

**检查清单**:

1. N8N 是否正在运行？
2. Webhook URL 是否正确？
3. 后端 `.env` 中的 `N8N_WEBHOOK_URL` 是否配置？
4. 网络是否可达？（本地开发需要确保N8N可访问）

**解决方案**:

```bash
# 测试N8N是否运行
curl http://localhost:5678/healthz

# 测试Webhook是否可达
curl -X POST https://your-n8n.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

### Q2: AI生成失败？

**可能原因**:

1. DeerAPI Key 无效
2. 图片URL无法访问
3. 参数格式错误

**调试步骤**:

1. 检查 **"AI图片生成"** 节点的输出
2. 查看 DeerAPI 的错误消息
3. 确认图片URL是公网可访问的

**临时解决方案**:
如果图片URL无法从外部访问，可以先使用测试图片：

```
https://picsum.photos/1024/1024
```

---

### Q3: 回调失败？

**检查清单**:

1. 后端服务是否运行？
2. `callbackUrl` 是否正确？
3. 后端是否有CORS限制？

**解决方案**:

```bash
# 测试后端回调接口
curl -X POST http://localhost:3000/api/webhooks/n8n/callback \
  -H "Content-Type: application/json" \
  -H "x-n8n-api-key: your-api-key" \
  -d '{
    "taskId": "test-123",
    "status": "completed",
    "resultImageUrls": ["url1", "url2"]
  }'
```

---

### Q4: 如何修改AI模型？

**不需要修改N8N工作流！**

在前端选择模型即可：

- `flux-1.1-pro`
- `flux-1.1-ultra`
- `flux-realism`
- `sd3`
- `mj-v6`

这些参数会自动传递到N8N工作流。

---

### Q5: 如何支持更多图片比例？

1. 在 **"检查图片比例"** 节点添加新的条件
2. 添加对应的尺寸设置节点
3. 连接到 **"AI图片生成"** 节点

---

## 完整流程示例

### 用户操作流程

```
1. 用户打开前端页面
2. 配置品牌信息（标题、Logo）
3. 上传商品图片: product.jpg
4. 输入提示词: "时尚模特在街头"
5. 选择参数:
   - 模型: flux-realism
   - 比例: 16:9
   - 数量: 4张
   - 质量: high
6. 点击"开始生成"
```

### 后端处理流程

```
1. 接收前端请求
2. 创建任务记录 (SQLite)
3. 发布事件 (触发飞书同步)
4. 调用N8N webhook
5. 返回任务ID给前端
```

### N8N工作流执行流程

```
1. Webhook接收请求
2. 解析参数:
   - aiModel = "flux-realism"
   - aspectRatio = "16:9"
   - imageCount = 4
3. 检查比例 → 16:9分支
4. 设置尺寸 → 1344x768
5. 调用DeerAPI生成4张图片
6. 格式化结果
7. 回调后端: /api/webhooks/n8n/callback
8. 返回成功响应
```

### 前端轮询流程

```
1. 每2秒轮询 /api/tasks/{id}
2. 后端返回最新状态
3. 更新前端UI:
   - 进度条
   - 状态文字
   - 生成完成后显示结果图片
```

---

## 高级配置

### 添加进度更新

如果想在生成过程中更新进度，可以在N8N中添加多个HTTP Request节点：

```
开始生成 → 回调"进度25%"
处理中 → 回调"进度50%"
生成中 → 回调"进度75%"
完成 → 回调"进度100%"
```

### 添加错误处理

在 **"AI图片生成"** 节点后添加 **"IF"** 节点：

```
判断生成是否成功
  ├─ 成功 → 继续正常流程
  └─ 失败 → 回调错误状态
```

### 支持场景图合成

如果需要将商品图合成到场景图：

1. 添加 **"下载场景图"** 节点
2. 添加 **"图像合成"** 节点（使用其他AI服务）
3. 将合成结果传给生成节点

---

## 🎯 快速检查清单

部署前请确认：

- [ ] N8N 已导入工作流
- [ ] DeerAPI认证已配置
- [ ] Webhook URL已复制
- [ ] 后端 `.env` 已配置N8N相关变量
- [ ] 后端服务正在运行
- [ ] 测试Webhook可以触发
- [ ] 测试回调接口可以访问
- [ ] 前端可以正常创建任务

---

## 📞 技术支持

遇到问题？

1. 查看 N8N 执行日志（点击节点可以看到输入输出）
2. 查看后端控制台日志
3. 检查浏览器控制台错误
4. 使用 curl 命令单独测试每个接口

---

**祝使用愉快！** 🎉
