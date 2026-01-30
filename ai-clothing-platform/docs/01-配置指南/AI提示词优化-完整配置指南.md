# 🤖 AI提示词优化 - 完整配置指南

## 📅 文档版本：v1.0

## 📅 更新日期：2026-01-29

---

## 🎯 概述

AI提示词优化是本平台的**核心功能**，允许用户：

- 在前端Web界面通过多轮AI对话优化提示词
- 在飞书表格点击"AI对话"按钮跳转到Web端优化
- 自由选择使用原始提示词或AI优化后的提示词

**核心原则**：并列选择，而非强制流程

---

## 1. 功能架构

### 1.1 三端联动架构

```
┌─────────────────────────────────────────────────────────────┐
│                       前端Web界面                            │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │ 提示词输入框 │ ───→ │ AI对话优化   │ ───→ │ 提交任务 │  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│         │                      │                               │
│         ↓                      ↓                               │
└─────────────────────────────────────────────────────────────┘
         │                      │
         │                      │
         ↓                      ↓
┌─────────────────────────────────────────────────────────────┐
│                      N8N工作流                               │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │ 接收任务参数 │ ───→ │ AI生成图片   │ ───→ │ 回调前端 │  │
│  │              │      │ (使用优化版) │      │          │  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│                     飞书多维表格                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │ 提示词字段   │      │ AI对话按钮   │      │ 优化结果 │  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据流

**前端优化流程**：

```
用户输入提示词
    ↓
点击"💬 AI对话优化"
    ↓
多轮AI对话优化
    ↓
选择：原始版 / AI优化版
    ↓
提交任务（包含 optimizedPrompt）
    ↓
N8N根据 promptSource 选择使用哪个提示词
    ↓
AI图片生成
```

**飞书优化流程**：

```
飞书表格输入提示词
    ↓
点击"💬 AI对话"URL按钮
    ↓
跳转到 /ai-chat/{recordId}
    ↓
多轮AI对话优化
    ↓
点击"确认并生图"
    ↓
自动更新飞书记录
    ↓
触发N8N生成图片
```

---

## 2. 数据库字段配置

### 2.1 Task模型必需字段

```prisma
model Task {
  id                String        @id @default(uuid())

  // 提示词相关字段（必需）
  prompt            String?       // 最终使用的提示词
  originalPrompt    String?       // 用户输入的原始提示词
  optimizedPrompt   String?       // AI优化后的提示词（可选）
  promptSource      PromptSource  @default(USER) // 最终使用的提示词来源

  // 优化相关（可选）
  promptOptimizationEnabled Boolean  @default(false)
  promptOptimizationId    String?
  promptOptimizedAt       DateTime?

  // ... 其他字段
}

enum PromptSource {
  USER           // 最终使用用户原始提示词
  AI_OPTIMIZED   // 最终使用AI优化后的提示词
  FEISHU         // 飞书表格输入的提示词
}
```

### 2.2 字段说明

| 字段                        | 类型    | 说明                 | 示例                                  |
| --------------------------- | ------- | -------------------- | ------------------------------------- |
| `prompt`                    | String? | **最终使用的提示词** | 根据promptSource决定                  |
| `originalPrompt`            | String? | 用户输入的原始提示词 | "红色连衣裙"                          |
| `optimizedPrompt`           | String? | AI优化后的提示词     | "An elegant red silk evening gown..." |
| `promptSource`              | Enum    | 最终使用哪个提示词   | USER / AI_OPTIMIZED / FEISHU          |
| `promptOptimizationEnabled` | Boolean | 用户是否选择了AI优化 | true/false                            |

---

## 3. 飞书多维表格字段配置

### 3.1 完整字段列表（13个必需字段）

| 序号 | 字段名称         | 字段类型 | 说明                     | 示例                        |
| ---- | ---------------- | -------- | ------------------------ | --------------------------- |
| 1    | 提示词           | 多行文本 | 用户输入的提示词         | 红色连衣裙，优雅            |
| 2    | **优化后提示词** | 多行文本 | AI优化后的提示词         | An elegant red gown...      |
| 3    | **AI对话**       | URL      | 点击跳转到AI对话界面     | https://app.com/ai-chat/... |
| 4    | 商品图           | 附件     | 产品图片                 | [图片]                      |
| 5    | 场景图           | 附件     | 场景参考图（可选）       | [图片]                      |
| 6    | AI模型           | 单选     | AI生成模型               | Gemini-3-Pro-Image          |
| 7    | 尺寸比例         | 单选     | 图片尺寸比例             | 3:4                         |
| 8    | 生成数量         | 数字     | 生成图片数量             | 4                           |
| 9    | 状态             | 单选     | 任务状态                 | 待处理/处理中/已完成        |
| 10   | 生成结果         | 附件     | AI生成的图片             | [图片]                      |
| 11   | 数据来源         | 单选     | 标识数据来源             | 🌐 前端用户 / 📊 飞书用户   |
| 12   | **提示词来源**   | 单选     | 标识最终使用的提示词来源 | 用户输入 / AI优化           |
| 13   | 同步状态         | 单选     | 同步状态                 | ✅ 已同步 / 🔄 同步中       |

### 3.2 AI对话URL配置

**字段名称**：AI对话
**字段类型**：URL（超链接）

**URL模板**：

```
https://your-app-domain.com/ai-chat/{record_id}?prompt={提示词}
```

**示例**：

```
开发环境：https://localhost:3000/ai-chat/{record_id}?prompt={提示词}
生产环境：https://your-production-domain.com/ai-chat/{record_id}?prompt={提示词}
```

**按钮配置**：

```
按钮文字：💬 AI对话优化
按钮颜色：蓝色
打开方式：新窗口
```

### 3.3 提示词来源字段配置

**字段名称**：提示词来源
**字段类型**：单选

**选项**：

```
- 用户输入
- AI优化
```

**说明**：此字段标识最终使用的提示词来源

---

## 4. N8N工作流配置

### 4.1 接收参数扩展

N8N工作流的 **Webhook触发器-前端** 需要接收以下参数：

```json
{
  "taskId": "uuid-xxx",
  "userId": "user-xxx",
  "prompt": "红色连衣裙", // 原始提示词（必填）
  "optimizedPrompt": "An elegant...", // AI优化后的提示词（可选）
  "promptSource": "AI_OPTIMIZED", // 最终使用哪个（USER/AI_OPTIMIZED）
  "productImageUrl": "https://...",
  "sceneImageUrl": "https://...",
  "aiModel": "Gemini-3-Pro-Image",
  "aspectRatio": "3:4",
  "imageCount": 4,
  "quality": "high",
  "callbackUrl": "https://..."
}
```

### 4.2 提示词选择逻辑

在N8N工作流中添加 **"选择最终提示词"** 节点：

```javascript
// Code节点：选择最终提示词
const originalPrompt = $json.prompt;
const optimizedPrompt = $json.optimizedPrompt;
const promptSource = $json.promptSource;

let finalPrompt;
if (promptSource === 'AI_OPTIMIZED' && optimizedPrompt) {
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

### 4.3 飞书记录创建/更新

**创建飞书记录时**：

```json
{
  "fields": {
    "提示词": "{{ prompt }}",
    "优化后提示词": "{{ optimizedPrompt }}",
    "提示词来源": "{{ promptSource === 'AI_OPTIMIZED' ? 'AI优化' : '用户输入' }}",
    "数据来源": "🌐 前端用户",
    "状态": "待处理"
  }
}
```

**更新飞书记录时**：

```json
{
  "fields": {
    "优化后提示词": "{{ optimizedPrompt }}",
    "提示词来源": "{{ promptSource === 'AI_OPTIMIZED' ? 'AI优化' : '用户输入' }}",
    "生成结果": [...],
    "状态": "已完成"
  }
}
```

---

## 5. 前端Web配置

### 5.1 AI对话页面路由

**文件路径**：`src/app/ai-chat/[recordId]/page.tsx`

**路由参数**：

- `recordId`：飞书记录ID（可选，用于飞书表格跳转）
- `prompt`：初始提示词（从URL参数获取）

**页面功能**：

1. 多轮AI对话优化提示词
2. 显示原始提示词和优化后提示词对比
3. "确认并生图"按钮

### 5.2 API接口

**AI对话接口**：

```
POST /api/conversations/{id}/messages
```

**请求体**：

```json
{
  "messages": [{ "role": "user", "content": "请帮我优化这个提示词：红色连衣裙" }],
  "context": {
    "originalPrompt": "红色连衣裙",
    "currentPrompt": "红色连衣裙"
  }
}
```

**响应**：

```json
{
  "message": "我已经分析了你的提示词...",
  "suggestedPrompt": "An elegant red silk evening gown..."
}
```

**快速优化接口**：

```
POST /api/optimize-prompt
```

**请求体**：

```json
{
  "prompt": "红色连衣裙"
}
```

**响应**：

```json
{
  "originalPrompt": "红色连衣裙",
  "optimizedPrompt": "An elegant red silk evening gown..."
}
```

### 5.3 任务创建接口扩展

**接口**：`POST /api/tasks`

**请求体**（新增AI优化字段）：

```json
{
  "productImageUrl": "data:image/png;base64,...",
  "prompt": "红色连衣裙", // 原始提示词（必填）
  "optimizedPrompt": "An elegant...", // AI优化后的提示词（可选）
  "promptSource": "AI_OPTIMIZED", // 最终使用哪个（必填）
  "aiModel": "Gemini-3-Pro-Image",
  "aspectRatio": "3:4",
  "imageCount": 4
}
```

---

## 6. 配置检查清单

### 6.1 数据库配置

- [ ] Task模型包含 `originalPrompt` 字段
- [ ] Task模型包含 `optimizedPrompt` 字段
- [ ] Task模型包含 `promptSource` 字段（枚举：USER/AI_OPTIMIZED/FEISHU）
- [ ] Task模型包含 `promptOptimizationEnabled` 字段

### 6.2 飞书多维表格配置

- [ ] 创建了"提示词"字段（多行文本）
- [ ] 创建了"优化后提示词"字段（多行文本）
- [ ] 创建了"AI对话"字段（URL类型）
- [ ] 配置了AI对话URL模板
- [ ] 创建了"提示词来源"字段（单选）
- [ ] 其他11个基础字段已创建

### 6.3 N8N工作流配置

- [ ] Webhook接收 `optimizedPrompt` 参数
- [ ] Webhook接收 `promptSource` 参数
- [ ] 添加了"选择最终提示词"节点
- [ ] 创建飞书记录时包含"优化后提示词"字段
- [ ] 创建飞书记录时包含"提示词来源"字段

### 6.4 前端Web配置

- [ ] AI对话页面路由已创建（`/ai-chat/[recordId]`）
- [ ] AI对话API接口已实现
- [ ] 快速优化API接口已实现
- [ ] 任务创建接口支持 `optimizedPrompt` 和 `promptSource`

---

## 7. 验证步骤

### 7.1 前端AI优化验证

**步骤1**：打开前端Web界面

```
访问：https://your-app-domain.com
```

**步骤2**：输入提示词并点击AI优化

```
提示词：红色连衣裙
操作：点击"💬 AI对话优化"按钮
```

**步骤3**：多轮对话优化

```
用户：请帮我优化这个提示词
AI：我已经分析了你的提示词...
用户：好的，使用优化版
```

**步骤4**：选择并提交

```
选择：⦿ AI优化后  ○ 原始版
操作：点击"生成"按钮
```

**步骤5**：验证结果

```
检查点：
✅ 前端显示"任务创建成功"
✅ 数据库保存了 optimizedPrompt
✅ 数据库 promptSource = "AI_OPTIMIZED"
✅ 飞书记录"优化后提示词"字段有值
✅ 飞书记录"提示词来源" = "AI优化"
✅ N8N使用了优化后的提示词
✅ 生成的图片符合优化后的提示词
```

### 7.2 飞书AI优化验证

**步骤1**：在飞书表格输入提示词

```
提示词字段：红色连衣裙
```

**步骤2**：点击AI对话按钮

```
操作：点击"💬 AI对话优化"按钮
```

**步骤3**：跳转到Web AI对话

```
验证：自动跳转到 https://app.com/ai-chat/{recordId}
验证：提示词自动填充
```

**步骤4**：多轮对话优化

```
同前端AI优化验证
```

**步骤5**：点击"确认并生图"

```
操作：点击"确认并生图"按钮
```

**步骤6**：验证飞书记录自动更新

```
检查点：
✅ 飞书记录"优化后提示词"字段有值
✅ 飞书记录"提示词来源" = "AI优化"
✅ 飞书记录状态变为"处理中"
✅ N8N工作流被触发
✅ N8N使用了优化后的提示词
```

### 7.3 N8N工作流验证

**验证点1**：接收参数

```bash
# 检查N8N执行日志
Webhook接收到的参数包含：
- prompt: "红色连衣裙"
- optimizedPrompt: "An elegant red..."
- promptSource: "AI_OPTIMIZED"
```

**验证点2**：提示词选择逻辑

```bash
# 检查"选择最终提示词"节点
finalPrompt = "An elegant red..."  # 使用了优化版
```

**验证点3**：飞书记录同步

```bash
# 检查飞书记录
"优化后提示词" = "An elegant red..."
"提示词来源" = "AI优化"
```

---

## 8. 故障排查

### 8.1 常见问题

| 问题                 | 可能原因         | 解决方法                                |
| -------------------- | ---------------- | --------------------------------------- |
| 点击AI对话按钮无响应 | URL配置错误      | 检查URL模板是否正确                     |
| 跳转后页面404        | 路由未配置       | 检查 `/ai-chat/[recordId]` 路由是否存在 |
| AI对话失败           | API密钥未配置    | 检查 `OPENAI_API_KEY` 环境变量          |
| 优化后提示词未保存   | 字段未创建       | 检查飞书表格是否有"优化后提示词"字段    |
| N8N使用了原始提示词  | promptSource错误 | 检查前端是否正确传递 `promptSource`     |

### 8.2 日志检查

**前端日志**：

```bash
# 本地开发
npm run dev

# 检查关键词
[API] promptSource: AI_OPTIMIZED
[API] optimizedPrompt: An elegant red...
```

**N8N日志**：

```bash
N8N界面 → Executions → 选择执行记录

# 检查节点
"解析请求参数"节点：
- prompt: "红色连衣裙"
- optimizedPrompt: "An elegant red..."
- promptSource: "AI_OPTIMIZED"

"选择最终提示词"节点：
- finalPrompt: "An elegant red..."
```

**飞书自动化日志**：

```bash
飞书多维表格 → 自动化 → 选择自动化 → 查看执行记录
```

---

## 9. 总结

### 9.1 核心要点

1. **AI提示词优化是核心功能**，不是可选功能
2. **三端必须联动**：前端Web → N8N工作流 → 飞书表格
3. **数据必须完整**：`prompt` + `optimizedPrompt` + `promptSource`
4. **用户有选择权**：可以使用原始提示词或AI优化版

### 9.2 配置优先级

**高优先级（必需）**：

- ✅ 数据库字段配置
- ✅ 飞书表格13个字段
- ✅ N8N工作流接收AI优化参数
- ✅ 前端AI对话页面

**中优先级（推荐）**：

- 🔄 AI对话URL配置
- 🔄 快速优化API
- 🔄 提示词对比预览

**低优先级（可选）**：

- 💡 提示词优化历史
- 💡 多版本对比生成
- 💡 批量优化

### 9.3 验证成功标志

- ✅ 前端可以点击"AI对话优化"按钮
- ✅ 可以进行多轮AI对话
- ✅ 可以选择使用原始版或AI优化版
- ✅ N8N正确使用选择的提示词
- ✅ 飞书记录完整保存所有字段
- ✅ 生成的图片符合选择的提示词

---

## 10. 相关文档

- [完整配置指南-小白版.md](./完整配置指南-小白版.md)
- [三端字段映射表.md](./三端字段映射表.md)
- [三端联动验证指南.md](./三端联动验证指南.md)
- [飞书表格AI对话URL配置指南.md](./飞书表格AI对话URL配置指南.md)
- [AI优化提示词功能设计\_v2.md](./AI优化提示词功能设计_v2.md)
