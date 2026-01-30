# 🔧 AI提示词优化 - 实施检查清单

## 📅 文档版本：v1.0

## 📅 更新日期：2026-01-29

---

## 🎯 概述

本文档明确说明**各个地方需要怎么修改**才能实现AI提示词优化效果，确保三端（前端Web、N8N工作流、飞书多维表格）联动不脱节。

---

## 1. 数据库修改

### 1.1 Task模型新增字段

**文件**：`prisma/schema.prisma`

**需要添加的字段**：

```prisma
model Task {
  id                String        @id @default(uuid())

  // ========== AI提示词优化相关字段 ==========
  // 原始提示词
  originalPrompt    String?       @map("original_prompt")

  // AI优化后的提示词
  optimizedPrompt   String?       @map("optimized_prompt")

  // 最终使用的提示词（已存在，保留）
  prompt            String?

  // 最终使用的提示词来源
  promptSource      PromptSource  @default(USER) @map("prompt_source")

  // 是否启用AI优化
  promptOptimizationEnabled Boolean  @default(false) @map("prompt_optimization_enabled")

  // 优化任务ID
  promptOptimizationId    String?   @map("prompt_optimization_id")

  // 优化时间
  promptOptimizedAt       DateTime? @map("prompt_optimized_at")
  // =========================================

  // ... 其他字段
}

enum PromptSource {
  USER           // 最终使用用户原始提示词
  AI_OPTIMIZED   // 最终使用AI优化后的提示词
  FEISHU         // 飞书表格输入的提示词
}
```

**验证命令**：

```bash
npx prisma migrate dev --name add_ai_prompt_optimization
npx prisma generate
```

---

## 2. 飞书多维表格修改

### 2.1 新增字段配置

需要在飞书多维表格中**新增3个字段**：

| 序号 | 字段名称         | 字段类型      | 必需/可选 | 说明                 |
| ---- | ---------------- | ------------- | --------- | -------------------- |
| 1    | **优化后提示词** | 多行文本      | 可选      | AI优化后的提示词     |
| 2    | **AI对话**       | URL（超链接） | 推荐      | 点击跳转到AI对话界面 |
| 3    | **提示词来源**   | 单选          | 推荐      | 用户输入/AI优化      |

### 2.2 字段配置详细说明

#### 字段1：优化后提示词

```
字段名称：优化后提示词
字段类型：多行文本
是否必需：否
默认值：空
说明：AI优化后的提示词，如果用户使用了AI优化功能
```

#### 字段2：AI对话

```
字段名称：AI对话
字段类型：URL（超链接）
是否必需：否（推荐）
URL模板：https://your-app-domain.com/ai-chat/{record_id}?prompt={提示词}
按钮文字：💬 AI对话优化
按钮颜色：蓝色
打开方式：新窗口
说明：点击跳转到Web端AI对话界面进行多轮对话优化
```

**URL配置示例**：

```
开发环境：https://localhost:3000/ai-chat/{record_id}?prompt={提示词}
生产环境：https://your-production-domain.com/ai-chat/{record_id}?prompt={提示词}
```

#### 字段3：提示词来源

```
字段名称：提示词来源
字段类型：单选
是否必需：否（推荐）
选项：
  - 用户输入
  - AI优化
默认值：用户输入
说明：标识最终使用的提示词来源
```

### 2.3 字段顺序建议

```
1. 提示词（原有）
2. 优化后提示词（新增）⭐
3. AI对话（新增）⭐
4. 提示词来源（新增）⭐
5. 商品图（原有）
6. 场景图（原有）
7. AI模型（原有）
8. 尺寸比例（原有）
9. 生成数量（原有）
10. 状态（原有）
11. 生成结果（原有）
12. 数据来源（原有）
13. 同步状态（原有）
```

---

## 3. N8N工作流修改

### 3.1 Webhook触发器参数扩展

**节点**：`Webhook触发器-前端`

**需要接收的新参数**：

```json
{
  "taskId": "uuid-xxx",
  "userId": "user-xxx",
  "prompt": "红色连衣裙", // 原始提示词（必填）
  "optimizedPrompt": "An elegant red...", // ⭐ 新增：AI优化后的提示词（可选）
  "promptSource": "AI_OPTIMIZED", // ⭐ 新增：最终使用哪个（USER/AI_OPTIMIZED/FEISHU）
  "productImageUrl": "https://...",
  "sceneImageUrl": "https://...",
  "aiModel": "Gemini-3-Pro-Image",
  "aspectRatio": "3:4",
  "imageCount": 4,
  "quality": "high",
  "callbackUrl": "https://..."
}
```

### 3.2 新增节点：选择最终提示词

**节点名称**：`选择最终提示词`
**节点类型**：Code节点
**位置**：在"解析前端参数"节点之后

**代码**：

```javascript
// 选择最终使用的提示词
const originalPrompt = $json.prompt;
const optimizedPrompt = $json.optimizedPrompt;
const promptSource = $json.promptSource || 'USER';

let finalPrompt;
let promptSourceDisplay;

if (promptSource === 'AI_OPTIMIZED' && optimizedPrompt) {
  finalPrompt = optimizedPrompt;
  promptSourceDisplay = 'AI优化';
} else {
  finalPrompt = originalPrompt;
  promptSourceDisplay = '用户输入';
}

return {
  json: {
    ...$json,
    finalPrompt: finalPrompt,
    promptSourceDisplay: promptSourceDisplay,
  },
};
```

### 3.3 修改节点：创建飞书记录

**节点名称**：`创建飞书记录`

**修改Body参数**（添加AI优化字段）：

```json
{
  "fields": {
    "提示词": "{{ $('选择最终提示词').item.json.prompt }}",
    "优化后提示词": "{{ $('选择最终提示词').item.json.optimizedPrompt || '' }}", // ⭐ 新增
    "提示词来源": "{{ $('选择最终提示词').item.json.promptSourceDisplay }}", // ⭐ 新增
    "商品图": [
      {
        "url": "{{ $('选择最终提示词').item.json.productImageUrl }}"
      }
    ],
    "场景图": "{{ $('选择最终提示词').item.json.sceneImageUrl ? '[{\"url\": \"' + $('选择最终提示词').item.json.sceneImageUrl + '\"}]' : '[]' }}",
    "状态": "待处理",
    "数据来源": "🌐 前端用户",
    "同步状态": "✅ 已同步",
    "前端用户ID": "{{ $('选择最终提示词').item.json.userId }}",
    "AI模型": "{{ $('选择最终提示词').item.json.aiModel }}",
    "尺寸比例": "{{ $('选择最终提示词').item.json.aspectRatio }}",
    "生成数量": "{{ $('选择最终提示词').item.json.imageCount }}"
  }
}
```

### 3.4 修改节点：AI图片生成

**节点名称**：`AI图片生成-前端`

**修改**：使用 `finalPrompt` 而不是 `prompt`

```json
{
  "url": "https://api.deerapi.com/",
  "body": {
    "model": "Gemini-3-Pro-Image",
    "prompt": "{{ $('选择最终提示词').item.json.finalPrompt }}", // ⭐ 修改：使用finalPrompt
    "image": "{{ $('选择最终提示词').item.json.productImageUrl }}",
    "width": 768,
    "height": 1024,
    "num_images": 1
  }
}
```

### 3.5 飞书轨道修改

**节点**：`提取飞书参数`

**需要提取的新字段**：

```javascript
{
  "record_id": "{{ $json.body.record_id }}",
  "app_token": "{{ $json.body.app_token }}",
  "table_id": "{{ $json.body.table_id }}",
  "prompt": "{{ $json.data.records[0].fields['提示词'][0].text }}",
  "optimizedPrompt": "{{ $json.data.records[0].fields['优化后提示词'] && $json.data.records[0].fields['优化后提示词'][0].text || '' }}",  // ⭐ 新增
  "promptSource": "{{ $json.data.records[0].fields['提示词来源'] || '用户输入' }}",                                        // ⭐ 新增
  "productImageUrl": "{{ $json.data.records[0].fields['商品图'][0].url }}",
  "sceneImageUrl": "{{ $json.data.records[0].fields['场景图'] && $json.data.records[0].fields['场景图'][0].url || '' }}",
  "aspectRatio": "{{ $json.data.records[0].fields['尺寸比例'] || '3:4' }}",
  "aiModel": "{{ $json.data.records[0].fields['AI模型'] || 'Gemini-3-Pro-Image' }}",
  "imageCount": "{{ $json.data.records[0].fields['生成数量'] || 4 }}"
}
```

**新增节点**：`选择最终提示词-飞书`

**位置**：在"提取飞书参数"节点之后

**代码**：

```javascript
// 选择最终使用的提示词（飞书轨道）
const originalPrompt = $json.prompt;
const optimizedPrompt = $json.optimizedPrompt;
const promptSource = $json.promptSource || '用户输入';

let finalPrompt;

if (promptSource === 'AI优化' && optimizedPrompt) {
  finalPrompt = optimizedPrompt;
} else {
  finalPrompt = originalPrompt;
}

return {
  json: {
    ...$json,
    finalPrompt: finalPrompt,
  },
};
```

---

## 4. 前端Web修改

### 4.1 任务创建接口扩展

**文件**：`src/app/api/tasks/route.ts`

**修改请求体类型**（添加AI优化字段）：

```typescript
interface CreateTaskRequest {
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string; // 原始提示词
  optimizedPrompt?: string; // ⭐ 新增：AI优化后的提示词
  promptSource?: 'USER' | 'AI_OPTIMIZED' | 'FEISHU'; // ⭐ 新增
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
}
```

### 4.2 任务处理器修改

**文件**：`src/lib/api/tasks/handlers/create-task.handler.ts`

**修改**：保存AI优化相关字段

```typescript
const task = await taskRepo.create({
  // ... 其他字段

  // AI提示词优化相关
  originalPrompt: prompt, // 原始提示词
  optimizedPrompt: body.optimizedPrompt, // AI优化后的提示词
  prompt: body.promptSource === 'AI_OPTIMIZED' ? body.optimizedPrompt : prompt, // 最终使用的提示词
  promptSource: body.promptSource || 'USER', // 提示词来源
  promptOptimizationEnabled: !!body.optimizedPrompt,
  promptOptimizedAt: body.optimizedPrompt ? new Date() : undefined,
});
```

### 4.3 AI对话页面

**文件**：`src/app/ai-chat/[recordId]/page.tsx`

**路由参数**：

- `recordId`：飞书记录ID（可选）
- `prompt`：初始提示词（从URL参数获取）

**页面功能**：

1. 多轮AI对话优化提示词
2. 显示原始提示词和优化后提示词对比
3. "确认并生图"按钮

### 4.4 AI对话API

**文件**：`src/app/api/conversations/[id]/messages/route.ts`

**接口**：`POST /api/conversations/{id}/messages`

**请求体**：

```typescript
interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  context?: {
    originalPrompt?: string;
    currentPrompt?: string;
  };
}
```

**响应**：

```typescript
interface ChatResponse {
  message: string;
  suggestedPrompt?: string;
}
```

---

## 5. 修改优先级

### 5.1 必须修改（P0）

如果不修改这些，AI提示词优化功能**无法工作**：

- ✅ **数据库**：添加 `optimizedPrompt`、`promptSource` 字段
- ✅ **N8N工作流**：添加"选择最终提示词"节点
- ✅ **N8N工作流**：Webhook接收 `optimizedPrompt`、`promptSource` 参数
- ✅ **N8N工作流**：AI生成使用 `finalPrompt` 而不是 `prompt`

### 5.2 推荐修改（P1）

修改后用户体验更好：

- 🔄 **飞书表格**：添加"优化后提示词"字段
- 🔄 **飞书表格**：添加"提示词来源"字段
- 🔄 **飞书表格**：添加"AI对话"URL字段
- 🔄 **前端Web**：实现AI对话页面

### 5.3 可选修改（P2）

增强功能，不影响核心流程：

- 💡 **飞书自动化**：AI优化按钮
- 💡 **前端Web**：提示词对比预览
- 💡 **前端Web**：多版本同时生成

---

## 6. 验证检查清单

### 6.1 数据库验证

```bash
# 1. 检查Prisma Schema
cat prisma/schema.prisma | grep -A 10 "optimizedPrompt"

# 2. 运行迁移
npx prisma migrate dev

# 3. 检查数据库表结构
sqlite3 data.db ".schema Task"
```

**期望结果**：

```
Task 表包含以下字段：
- original_prompt TEXT
- optimized_prompt TEXT
- prompt_source TEXT
- prompt_optimization_enabled BOOLEAN
- prompt_optimization_id TEXT
- prompt_optimized_at DATETIME
```

### 6.2 飞书表格验证

**检查项**：

- [ ] "优化后提示词"字段已创建
- [ ] "AI对话"URL字段已创建
- [ ] "提示词来源"单选字段已创建
- [ ] 字段顺序正确

**测试步骤**：

1. 在飞书表格中输入提示词："红色连衣裙"
2. 点击"AI对话"按钮
3. 验证能跳转到 `/ai-chat/{recordId}`
4. 验证提示词自动填充

### 6.3 N8N工作流验证

**测试用例1：使用AI优化版**

**输入**：

```json
{
  "taskId": "test-001",
  "userId": "user-001",
  "prompt": "红色连衣裙",
  "optimizedPrompt": "An elegant red silk evening gown featuring a classic A-line silhouette",
  "promptSource": "AI_OPTIMIZED",
  "productImageUrl": "https://example.com/product.jpg",
  "aiModel": "Gemini-3-Pro-Image",
  "aspectRatio": "3:4",
  "imageCount": 4,
  "callbackUrl": "https://example.com/callback"
}
```

**验证点**：

- ✅ N8N成功接收所有参数
- ✅ "选择最终提示词"节点输出 `finalPrompt = "An elegant red..."`
- ✅ "选择最终提示词"节点输出 `promptSourceDisplay = "AI优化"`
- ✅ "创建飞书记录"节点包含"优化后提示词"字段
- ✅ "创建飞书记录"节点包含"提示词来源"字段
- ✅ "AI图片生成"节点使用 `finalPrompt` 生成图片

**测试用例2：使用原始版**

**输入**：

```json
{
  "taskId": "test-002",
  "userId": "user-002",
  "prompt": "蓝色连衣裙",
  "promptSource": "USER",
  "productImageUrl": "https://example.com/product.jpg"
}
```

**验证点**：

- ✅ "选择最终提示词"节点输出 `finalPrompt = "蓝色连衣裙"`
- ✅ "选择最终提示词"节点输出 `promptSourceDisplay = "用户输入"`

### 6.4 前端Web验证

**检查点**：

- [ ] AI对话页面路由存在：`/ai-chat/[recordId]`
- [ ] AI对话API存在：`POST /api/conversations/{id}/messages`
- [ ] 任务创建API支持 `optimizedPrompt` 参数
- [ ] 任务创建API支持 `promptSource` 参数

**测试步骤**：

1. 打开前端Web
2. 输入提示词："红色连衣裙"
3. 点击"💬 AI对话优化"
4. 进行多轮对话
5. 选择使用AI优化版
6. 点击"生成"
7. 验证数据库保存了 `optimizedPrompt`
8. 验证数据库 `promptSource = "AI_OPTIMIZED"`

---

## 7. 故障排查

### 7.1 常见错误

| 错误现象             | 可能原因              | 解决方法                                |
| -------------------- | --------------------- | --------------------------------------- |
| N8N没有使用优化版    | `promptSource` 未传递 | 检查前端是否正确传递 `promptSource`     |
| 飞书记录没有优化字段 | 字段未创建            | 检查飞书表格是否有"优化后提示词"字段    |
| AI对话页面404        | 路由未配置            | 检查 `/ai-chat/[recordId]` 路由是否存在 |
| 数据库字段不存在     | 迁移未运行            | 运行 `npx prisma migrate dev`           |

### 7.2 日志检查

**前端日志**：

```bash
npm run dev

# 查找关键词
[API] optimizedPrompt
[API] promptSource
```

**N8N日志**：

```
N8N界面 → Executions → 选择执行记录

检查"选择最终提示词"节点：
- finalPrompt: "An elegant red..."
- promptSourceDisplay: "AI优化"
```

---

## 8. 完整配置文件

### 8.1 N8N工作流JSON

**文件**：`docs/ai-clothing-platform-with-ai-optimization.json`

**包含内容**：

- ✅ 前端轨道：接收AI优化参数 → 选择最终提示词 → 创建飞书记录 → AI生成
- ✅ 飞书轨道：读取优化字段 → 选择最终提示词 → AI生成 → 更新飞书记录
- ✅ 所有节点已正确配置

**使用方法**：

1. 打开N8N界面
2. 点击"Import from File"
3. 选择 `ai-clothing-platform-with-ai-optimization.json`
4. 配置3个凭证（飞书、DeerAPI、HTTP Header Auth）
5. 配置环境变量（FEISHU_APP_TOKEN、FEISHU_TABLE_ID）
6. 激活两个Webhook

### 8.2 环境变量配置

**N8N环境变量**：

```env
# 飞书配置
FEISHU_APP_TOKEN=your_app_token
FEISHU_TABLE_ID=your_table_id

# DeerAPI配置
DEERAPI_API_KEY=your_deerapi_key

# 前端回调配置
N8N_CALLBACK_SECRET=n8n-callback-secret-key-2024
```

**前端环境变量**：

```env
# OpenAI配置（用于AI对话优化）
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 飞书配置
FEISHU_APP_TOKEN=your_app_token
FEISHU_BITABLE_TABLE_ID=your_table_id

# N8N配置
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ai-clothing-generation
```

---

## 9. 总结

### 9.1 核心修改点

1. **数据库**：添加6个AI优化相关字段
2. **飞书表格**：添加3个新字段
3. **N8N工作流**：添加1个新节点（选择最终提示词）
4. **N8N工作流**：修改3个节点（Webhook、创建飞书记录、AI生成）
5. **前端Web**：实现AI对话页面

### 9.2 验证成功标志

- ✅ 数据库包含AI优化字段
- ✅ 飞书表格包含13个字段（包含3个AI优化字段）
- ✅ N8N工作流包含"选择最终提示词"节点
- ✅ N8N工作流使用 `finalPrompt` 生成图片
- ✅ 前端可以打开AI对话页面
- ✅ 用户可以选择使用原始版或AI优化版
- ✅ 飞书记录正确保存所有字段

### 9.3 下一步

完成所有修改后，参考：

- [AI提示词优化-完整配置指南.md](./AI提示词优化-完整配置指南.md)
- [三端联动验证指南.md](./三端联动验证指南.md)

进行完整的端到端测试验证。

---

## 10. 快速参考

### 10.1 字段映射速查

| 功能         | 前端字段          | N8N参数           | 飞书字段       | 数据库字段        |
| ------------ | ----------------- | ----------------- | -------------- | ----------------- |
| 原始提示词   | `prompt`          | `prompt`          | `提示词`       | `originalPrompt`  |
| AI优化提示词 | `optimizedPrompt` | `optimizedPrompt` | `优化后提示词` | `optimizedPrompt` |
| 提示词来源   | `promptSource`    | `promptSource`    | `提示词来源`   | `promptSource`    |
| 最终提示词   | -                 | `finalPrompt`     | -              | `prompt`          |

### 10.2 修改文件清单

- [ ] `prisma/schema.prisma` - 数据库模型
- [ ] 飞书多维表格 - 添加3个字段
- [ ] N8N工作流JSON - 导入新版本
- [ ] `src/app/api/tasks/route.ts` - 任务创建API
- [ ] `src/lib/api/tasks/handlers/create-task.handler.ts` - 任务处理器
- [ ] `src/app/ai-chat/[recordId]/page.tsx` - AI对话页面
- [ ] `src/app/api/conversations/[id]/messages/route.ts` - AI对话API
