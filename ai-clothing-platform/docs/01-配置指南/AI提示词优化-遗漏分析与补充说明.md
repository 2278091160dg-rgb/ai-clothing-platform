# ⚠️ AI提示词优化 - 遗漏分析与补充说明

## 📅 文档版本：v1.0

## 📅 更新日期：2026-01-29

---

## 🎯 问题说明

在之前的文档中，我**遗漏了AI提示词优化模块**这个用户的核心需求。本文档说明遗漏了什么、补充了什么，以及如何正确配置。

---

## 1. 遗漏的内容

### 1.1 之前遗漏的核心功能

| 功能                  | 遗漏内容       | 影响                              |
| --------------------- | -------------- | --------------------------------- |
| **AI提示词优化**      | 完全遗漏       | ❌ 用户无法优化提示词             |
| **优化后提示词字段**  | 飞书表格字段   | ❌ 无法保存AI优化结果             |
| **提示词来源字段**    | 飞书表格字段   | ❌ 无法标识使用哪个提示词         |
| **AI对话URL配置**     | 飞书表格字段   | ❌ 无法跳转到AI对话页面           |
| **N8N提示词选择逻辑** | N8N工作流节点  | ❌ 无法根据用户选择使用对应提示词 |
| **数据库AI优化字段**  | Prisma模型字段 | ❌ 无法保存AI优化数据             |

### 1.2 遗漏的根本原因

**原因分析**：

1. 没有仔细阅读 `docs/` 目录下的AI优化相关文档
2. 没有检查前端代码中的AI对话组件
3. 没有验证飞书表格字段配置说明中的"AI优化"字段
4. 直接根据现有工作流JSON推测功能，而没有查看完整需求

**应该做的**：

- ✅ 先阅读 `docs/AI优化提示词功能设计_v2.md`
- ✅ 先阅读 `docs/飞书表格AI对话URL配置指南.md`
- ✅ 先检查 `src/lib/services/ai-conversation.service.ts`
- ✅ 先验证飞书表格字段列表是否完整

---

## 2. 补充的内容

### 2.1 新增文档

| 文档名称                                         | 说明                          | 状态      |
| ------------------------------------------------ | ----------------------------- | --------- |
| `AI提示词优化-完整配置指南.md`                   | AI优化功能的完整配置指南      | ✅ 已创建 |
| `AI提示词优化-实施检查清单.md`                   | 各个地方的修改说明和检查清单  | ✅ 已创建 |
| `ai-clothing-platform-with-ai-optimization.json` | 包含AI优化功能的完整N8N工作流 | ✅ 已创建 |

### 2.2 更新文档

| 文档名称            | 更新内容               | 状态      |
| ------------------- | ---------------------- | --------- |
| `三端字段映射表.md` | 添加AI优化相关字段映射 | ✅ 已更新 |

### 2.3 飞书表格字段补充

**之前（11个字段）**：

```
1. 提示词
2. 商品图
3. 场景图
4. AI模型
5. 尺寸比例
6. 生成数量
7. 状态
8. 生成结果
9. 数据来源
10. 同步状态
11. 进度
```

**现在（13个字段）**：

```
1. 提示词
2. 优化后提示词 ⭐ 新增
3. AI对话 ⭐ 新增
4. 提示词来源 ⭐ 新增
5. 商品图
6. 场景图
7. AI模型
8. 尺寸比例
9. 生成数量
10. 状态
11. 生成结果
12. 数据来源
13. 同步状态
```

### 2.4 N8N工作流补充

**之前缺少的节点**：

```
前端轨道：
❌ "选择最终提示词"节点 - 根据promptSource选择使用哪个提示词
❌ Webhook接收optimizedPrompt参数
❌ Webhook接收promptSource参数
❌ 创建飞书记录时包含"优化后提示词"字段
❌ 创建飞书记录时包含"提示词来源"字段
```

**现在已补充**：

```
前端轨道：
✅ "选择最终提示词"节点 - Code节点，根据promptSource选择
✅ Webhook接收optimizedPrompt参数
✅ Webhook接收promptSource参数
✅ 创建飞书记录时包含"优化后提示词"字段
✅ 创建飞书记录时包含"提示词来源"字段

飞书轨道：
✅ 提取飞书参数时读取"优化后提示词"字段
✅ 提取飞书参数时读取"提示词来源"字段
✅ "选择最终提示词-飞书"节点
✅ AI生成使用finalPrompt
```

### 2.5 数据库字段补充

**之前缺少的字段**：

```prisma
model Task {
  // ❌ 缺少AI优化相关字段
}
```

**现在已补充**：

```prisma
model Task {
  // AI提示词优化相关字段
  originalPrompt    String?       // 原始提示词
  optimizedPrompt   String?       // AI优化后的提示词
  promptSource      PromptSource  // 最终使用的提示词来源
  promptOptimizationEnabled Boolean  // 是否启用AI优化
  promptOptimizationId    String?   // 优化任务ID
  promptOptimizedAt       DateTime? // 优化时间
}

enum PromptSource {
  USER           // 最终使用用户原始提示词
  AI_OPTIMIZED   // 最终使用AI优化后的提示词
  FEISHU         // 飞书表格输入的提示词
}
```

---

## 3. 核心修改点总结

### 3.1 飞书多维表格（3个新增字段）

| 序号 | 字段名称     | 字段类型 | URL配置/选项                                               |
| ---- | ------------ | -------- | ---------------------------------------------------------- |
| 1    | 优化后提示词 | 多行文本 | -                                                          |
| 2    | AI对话       | URL      | `https://your-app.com/ai-chat/{record_id}?prompt={提示词}` |
| 3    | 提示词来源   | 单选     | 用户输入 / AI优化                                          |

### 3.2 N8N工作流（1个新增节点 + 5个修改节点）

**新增节点**：

- `选择最终提示词` - Code节点，根据promptSource选择使用哪个提示词

**修改节点**：

1. `Webhook触发器-前端` - 接收optimizedPrompt、promptSource参数
2. `创建飞书记录` - 包含"优化后提示词"、"提示词来源"字段
3. `AI图片生成-前端` - 使用finalPrompt而不是prompt
4. `提取飞书参数` - 读取"优化后提示词"、"提示词来源"字段
5. `AI图片生成`（飞书轨道） - 使用finalPrompt

### 3.3 前端Web（已有功能，无需新增）

前端已经实现了AI对话功能：

- ✅ `src/app/ai-chat/[recordId]/page.tsx` - AI对话页面
- ✅ `src/app/api/conversations/[id]/messages/route.ts` - AI对话API
- ✅ `src/lib/services/ai-conversation.service.ts` - AI对话服务

**需要验证**：

- ✅ AI对话页面路由存在
- ✅ AI对话API可访问
- ✅ 任务创建API支持optimizedPrompt、promptSource参数

---

## 4. 配置步骤

### 4.1 第一步：数据库迁移

```bash
# 1. 修改 prisma/schema.prisma，添加AI优化字段
# 参考：AI提示词优化-实施检查清单.md 第1节

# 2. 运行迁移
npx prisma migrate dev --name add_ai_prompt_optimization

# 3. 生成Prisma Client
npx prisma generate
```

### 4.2 第二步：飞书表格配置

在飞书多维表格中添加3个新字段：

1. **优化后提示词**
   - 字段类型：多行文本
   - 是否必需：否

2. **AI对话**
   - 字段类型：URL（超链接）
   - URL模板：`https://your-app-domain.com/ai-chat/{record_id}?prompt={提示词}`
   - 按钮文字：💬 AI对话优化

3. **提示词来源**
   - 字段类型：单选
   - 选项：用户输入 / AI优化

### 4.3 第三步：N8N工作流导入

1. 打开N8N界面
2. 点击"Import from File"
3. 选择 `docs/ai-clothing-platform-with-ai-optimization.json`
4. 配置3个凭证：
   - Feishu Credentials
   - DeerAPI
   - HTTP Header Auth
5. 配置环境变量：
   - `FEISHU_APP_TOKEN`
   - `FEISHU_TABLE_ID`
6. 激活两个Webhook

### 4.4 第四步：前端环境变量配置

在 `.env.local` 中添加：

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

### 4.5 第五步：验证测试

参考 `AI提示词优化-实施检查清单.md` 第6节进行完整验证。

---

## 5. 数据流说明

### 5.1 前端AI优化流程

```
用户输入提示词
    ↓
点击"💬 AI对话优化"
    ↓
多轮AI对话优化
    ↓
用户选择：原始版 / AI优化版
    ↓
提交任务（包含 optimizedPrompt 和 promptSource）
    ↓
N8N接收
    ↓
【关键】"选择最终提示词"节点：
  if (promptSource === 'AI_OPTIMIZED' && optimizedPrompt) {
    finalPrompt = optimizedPrompt;  // 使用AI优化版
  } else {
    finalPrompt = prompt;           // 使用原始版
  }
    ↓
创建飞书记录（包含优化后提示词、提示词来源）
    ↓
AI图片生成（使用 finalPrompt）
    ↓
更新飞书记录
    ↓
回调前端
```

### 5.2 飞书AI优化流程

```
飞书表格输入提示词
    ↓
点击"💬 AI对话"按钮
    ↓
跳转到 /ai-chat/{recordId}
    ↓
多轮AI对话优化
    ↓
点击"确认并生图"
    ↓
前端更新飞书记录（优化后提示词、提示词来源）
    ↓
触发N8N工作流
    ↓
N8N读取飞书记录（包含优化后提示词、提示词来源）
    ↓
【关键】"选择最终提示词-飞书"节点：
  if (提示词来源 === 'AI优化' && 优化后提示词) {
    finalPrompt = 优化后提示词;
  } else {
    finalPrompt = 提示词;
  }
    ↓
AI图片生成（使用 finalPrompt）
    ↓
更新飞书记录
```

---

## 6. 关键验证点

### 6.1 数据库验证

```bash
# 检查Prisma Schema
cat prisma/schema.prisma | grep -A 5 "optimizedPrompt"

# 期望看到：
# optimizedPrompt   String?       @map("optimized_prompt")
# promptSource      PromptSource  @default(USER)
```

### 6.2 飞书表格验证

```
检查项：
✅ "优化后提示词"字段已创建
✅ "AI对话"URL字段已创建
✅ "提示词来源"单选字段已创建
```

### 6.3 N8N工作流验证

```
前端轨道：
✅ Webhook接收 optimizedPrompt 参数
✅ Webhook接收 promptSource 参数
✅ "选择最终提示词"节点存在
✅ "创建飞书记录"包含"优化后提示词"字段
✅ "创建飞书记录"包含"提示词来源"字段
✅ "AI图片生成-前端"使用 finalPrompt

飞书轨道：
✅ "提取飞书参数"读取"优化后提示词"字段
✅ "提取飞书参数"读取"提示词来源"字段
✅ "选择最终提示词-飞书"节点存在
✅ "AI图片生成"使用 finalPrompt
```

### 6.4 前端Web验证

```
✅ AI对话页面路由存在：/ai-chat/[recordId]
✅ AI对话API存在：POST /api/conversations/{id}/messages
✅ 任务创建API支持 optimizedPrompt 参数
✅ 任务创建API支持 promptSource 参数
```

---

## 7. 测试用例

### 7.1 测试用例1：前端使用AI优化版

**输入**：

```json
{
  "prompt": "红色连衣裙",
  "optimizedPrompt": "An elegant red silk evening gown featuring a classic A-line silhouette, with delicate lace trim along the neckline",
  "promptSource": "AI_OPTIMIZED",
  "productImageUrl": "https://example.com/product.jpg"
}
```

**验证点**：

- ✅ N8N `finalPrompt = "An elegant red silk..."`
- ✅ 飞书记录"优化后提示词" = "An elegant red silk..."
- ✅ 飞书记录"提示词来源" = "AI优化"
- ✅ AI生成使用优化后的提示词
- ✅ 生成的图片符合优化后的提示词

### 7.2 测试用例2：前端使用原始版

**输入**：

```json
{
  "prompt": "蓝色连衣裙",
  "promptSource": "USER",
  "productImageUrl": "https://example.com/product.jpg"
}
```

**验证点**：

- ✅ N8N `finalPrompt = "蓝色连衣裙"`
- ✅ 飞书记录"优化后提示词"为空
- ✅ 飞书记录"提示词来源" = "用户输入"
- ✅ AI生成使用原始提示词

### 7.3 测试用例3：飞书使用AI优化版

**操作**：

1. 飞书表格输入提示词："红色连衣裙"
2. 点击"AI对话"按钮
3. 跳转到 `/ai-chat/{recordId}`
4. AI对话优化
5. 点击"确认并生图"

**验证点**：

- ✅ 飞书记录"优化后提示词"有值
- ✅ 飞书记录"提示词来源" = "AI优化"
- ✅ N8N使用优化后的提示词
- ✅ AI生成成功

---

## 8. 文档索引

### 8.1 核心文档

| 文档                                             | 用途                          | 优先级      |
| ------------------------------------------------ | ----------------------------- | ----------- |
| `AI提示词优化-实施检查清单.md`                   | 各个地方的修改说明和检查清单  | ⭐⭐⭐ 最高 |
| `AI提示词优化-完整配置指南.md`                   | AI优化功能的完整配置指南      | ⭐⭐⭐ 最高 |
| `三端字段映射表.md`（已更新）                    | 三端字段映射关系              | ⭐⭐ 高     |
| `ai-clothing-platform-with-ai-optimization.json` | 包含AI优化功能的完整N8N工作流 | ⭐⭐⭐ 最高 |

### 8.2 参考文档

| 文档                           | 用途                  |
| ------------------------------ | --------------------- |
| `飞书表格AI对话URL配置指南.md` | 飞书表格AI对话URL配置 |
| `AI优化提示词功能设计_v2.md`   | AI优化功能设计文档    |
| `三端联动验证指南.md`          | 三端联动验证步骤      |

---

## 9. 总结

### 9.1 遗漏原因

1. ❌ 没有仔细阅读项目文档
2. ❌ 没有检查前端代码中的AI对话组件
3. ❌ 直接根据现有工作流推测功能
4. ❌ 没有反向验证需求是否完整

### 9.2 补充内容

1. ✅ 创建了3个新文档
2. ✅ 更新了1个现有文档
3. ✅ 创建了包含AI优化的完整N8N工作流
4. ✅ 补充了飞书表格3个字段
5. ✅ 补充了N8N工作流1个新节点
6. ✅ 补充了数据库6个字段

### 9.3 下一步行动

**立即执行**：

1. 阅读 `AI提示词优化-实施检查清单.md`
2. 按照清单逐步修改
3. 导入新的N8N工作流
4. 配置飞书表格字段
5. 运行数据库迁移
6. 进行端到端测试

**验证成功后**：

1. 参考 `三端联动验证指南.md` 进行完整验证
2. 确保**三端联动不脱节**
3. 确保**AI提示词优化功能正常工作**

---

## 10. 致歉

非常抱歉之前遗漏了**AI提示词优化模块**这个核心需求。现在我已经：

1. ✅ 仔细阅读了项目文档
2. ✅ 检查了前端代码
3. ✅ 理解了完整的业务需求
4. ✅ 补充了所有遗漏的内容
5. ✅ 创建了详细的实施指南

现在文档应该是完整的，包含了AI提示词优化的所有配置说明。

**如有遗漏，请指出，我会立即补充！**
