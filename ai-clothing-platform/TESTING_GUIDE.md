# AI 电商商拍平台 - 测试指南

## 📋 前置条件

### 1. 环境变量配置

创建 `.env.local` 文件：

```bash
# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# DeerAPI（图片上传服务）
NEXT_PUBLIC_DEERAPI_ENDPOINT=https://your-deerapi-endpoint.com
NEXT_PUBLIC_DEERAPI_KEY=your-deerapi-key

# 飞书配置
FEISHU_APP_ID=your-feishu-app-id
FEISHU_APP_SECRET=your-feishu-app-secret
FEISHU_BITABLE_APP_TOKEN=your-bitable-app-token
FEISHU_BITABLE_TABLE_ID=your-bitable-table-id
FEISHU_ENCRYPT_KEY=your-encrypt-key

# n8n 工作流
N8N_WEBHOOK_URL=https://your-n8n-webhook.com/webhook/generate
N8N_API_KEY=your-n8n-api-key
```

### 2. 安装依赖并启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：http://localhost:3000

## 🔧 功能测试清单

### ✅ 品牌配置功能

**测试步骤：**

1. 点击右上角设置按钮（⚙️）
2. 在配置面板中修改：
   - 主标题：输入自定义标题
   - 副标题：输入自定义副标题
   - Logo 图标：输入 Emoji（如 🚀）
   - Logo 图片：点击上传本地图片
3. 点击"保存配置"
4. 观察顶部导航栏的品牌信息是否立即更新

**预期结果：**

- 保存后顶部 Logo、标题、副标题立即更新
- 刷新页面后配置保持不变
- Logo 图片正确显示

---

### ✅ 图片上传功能

**测试步骤：**

1. 点击"商品图"上传区域
2. 选择一张本地图片
3. 观察预览是否正确显示
4. 同样操作"场景图"（可选）

**预期结果：**

- 图片上传成功
- 预览正确显示
- 上传后的图片保存在 `public/uploads/temp/` 目录

---

### ✅ 任务创建功能

**测试步骤：**

1. 确保已配置 API（在配置面板中填写必要信息）
2. 上传商品图片
3. 输入提示词（如："简约风格，白色背景"）
4. 选择参数：
   - 图片比例：1:1 / 3:4 / 16:9
   - 文本模型：Gemini 2.0
   - 生图模型：FLUX 1.1
   - 清晰度：高质量
5. 点击"开始生成场景图"按钮

**预期结果：**

- 任务出现在历史记录列表
- 状态显示为"生成中"
- 显示进度条和预计剩余时间

---

### ✅ 任务进度更新

**测试步骤：**

1. 观察任务列表中的进度更新
2. 等待任务完成（或使用 N8N 回调测试）

**预期结果：**

- 每 2 秒自动更新进度
- 完成后状态变为"已完成"
- 可以点击图片预览结果

---

## 🧪 API 测试（使用 curl）

### 1. 上传图片

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg"
```

**预期响应：**

```json
{
  "success": true,
  "url": "/uploads/temp/1234567890-abc123.jpg",
  "fileName": "1234567890-abc123.jpg"
}
```

### 2. 创建任务（需要认证）

由于当前 API 需要认证，建议使用浏览器 DevTools 测试：

1. 打开浏览器 DevTools（F12）
2. 切换到 Console 标签
3. 执行以下代码：

```javascript
// 首先配置 API
await fetch('/api/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deerApiEndpoint: 'https://your-api.com',
    deerApiKey: 'your-key',
    // ... 其他配置
  }),
});

// 创建任务
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productImageUrl: '/uploads/temp/test.jpg',
    prompt: '简约风格，白色背景',
    aiModel: 'flux-1.1-pro',
    aspectRatio: '1:1',
    imageCount: 1,
    quality: 'high',
  }),
});

console.log(await response.json());
```

### 3. 查询任务

```bash
curl http://localhost:3000/api/tasks/{task-id}
```

## 🔍 调试技巧

### 1. 查看浏览器控制台

- 打开 DevTools → Console
- 查看日志输出：
  - `生成按钮被点击` - 按钮点击事件
  - `上传商品图片...` - 开始上传
  - `商品图片上传成功:` - 上传完成
  - `任务创建成功:` - 任务创建完成
  - `任务进度更新:` - 进度更新

### 2. 查看网络请求

- 打开 DevTools → Network
- 筛选 XHR 请求
- 查看以下 API 调用：
  - `POST /api/upload` - 图片上传
  - `POST /api/tasks` - 创建任务
  - `GET /api/tasks/{id}` - 查询任务进度

### 3. 查看后端日志

后端日志会显示在终端：

```
[API] Failed to create task: ...
[N8n] Failed to trigger generation: ...
```

## ⚠️ 常见问题

### 问题 1：API 未配置

**症状：** 点击"开始生成"后弹出配置面板

**解决：**

- 在配置面板中填写 API 配置
- 至少需要配置 DeerAPI（用于图片上传）

### 问题 2：图片上传失败

**症状：** 提示"Failed to upload image"

**解决：**

- 检查 `public/uploads/temp/` 目录是否存在
- 检查文件大小是否超过 10MB
- 查看后端日志获取详细错误

### 问题 3：任务创建失败

**症状：** 提示"Failed to create task"

**解决：**

- 检查 API 配置是否完整
- 确保后端服务正常运行
- 查看 Network 标签中的响应内容

### 问题 4：401 Unauthorized

**症状：** API 返回 401 错误

**说明：** 当前实现需要用户认证。有两种解决方案：

**方案 A：添加认证**

```bash
# 需要配置 NextAuth
# 添加 auth 配置到环境变量
```

**方案 B：临时移除认证（仅用于开发）**

在 `/api/tasks/route.ts` 中注释掉认证检查：

```typescript
// 临时注释掉认证检查
// const session = await getServerSession(authOptions)
// if (!session?.user?.id) {
//   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
// }
```

## 📝 测试报告模板

```markdown
## 测试日期：2025-01-27

## 测试环境：localhost:3000

### 功能测试结果

- [x] 品牌配置保存
- [ ] 图片上传
- [ ] 任务创建
- [ ] 进度更新
- [ ] 结果显示

### 发现的问题

1. 问题描述
   - 复现步骤：
   - 预期结果：
   - 实际结果：

### 建议

- 改进建议 1
- 改进建议 2
```

## 🚀 下一步

测试完成后，可以考虑：

1. 添加用户认证（NextAuth.js）
2. 实现 WebSocket 替代轮询
3. 添加错误边界和更好的错误处理
4. 优化移动端适配
