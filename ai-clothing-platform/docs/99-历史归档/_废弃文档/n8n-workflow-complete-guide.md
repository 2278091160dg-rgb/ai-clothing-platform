# N8N完整工作流使用指南

## 📋 文档信息

- **文件名**: `n8n-workflow-complete.json`
- **工作流名称**: AI服装平台-完整工作流-双触发器-AI优化-多模板
- **版本**: v1.0
- **更新日期**: 2026-01-29

---

## 🎯 工作流特性

### ✅ 核心功能

1. **双Webhook触发器**
   - 前端Webhook触发器（`/ai-clothing-generation`）
   - 飞书Webhook触发器（`/feishu-trigger`）

2. **AI优化提示词功能**
   - 支持原始提示词和优化后提示词
   - 根据promptSource自动选择最终提示词
   - 两个独立的AI优化节点（前端和飞书轨道）

3. **结构化提示词模板**
   - 支持模板类型标识（templateType）
   - 模板类型：服装模特展示、产品静物展示、分层逻辑控制、自定义
   - 自动记录模板类型到飞书表格

4. **多模板系统**
   - 模板类型字段映射
   - 产品描述、模特类型、场景风格字段支持
   - 完整的模板元数据记录

5. **完整的尺寸比例支持**
   - 1:1、3:4、4:3、16:9、9:16
   - 自动尺寸参数标准化
   - 智能回退到默认尺寸

---

## 📊 节点详解

### 🔷 前端轨道节点

#### 1. Webhook触发器-前端

- **节点ID**: `webhook-frontend-trigger`
- **路径**: `/ai-clothing-generation`
- **方法**: POST
- **Webhook ID**: `ai-clothing-frontend-complete`

**输入字段**:

```json
{
  "taskId": "string",
  "userId": "string",
  "prompt": "string",
  "optimizedPrompt": "string (可选)",
  "promptSource": "USER | AI_OPTIMIZED | TEMPLATE",
  "templateType": "fashion_model | product_still | layered_logic | custom",
  "productDescription": "string (可选)",
  "modelType": "string (可选)",
  "sceneStyle": "string (可选)",
  "productImageUrl": "string",
  "sceneImageUrl": "string (可选)",
  "aiModel": "string",
  "aspectRatio": "string",
  "imageCount": "number",
  "quality": "string",
  "callbackUrl": "string"
}
```

#### 2. 解析前端参数

- **节点ID**: `parse-frontend-params`
- **功能**: 提取并标准化所有前端传入参数
- **新增字段**: templateType、productDescription、modelType、sceneStyle

#### 3. AI优化-选择最终提示词 ⭐

- **节点ID**: `ai-optimize-prompt`
- **类型**: Code节点
- **功能**: 根据promptSource和templateType决定使用哪个提示词

**核心逻辑**:

```javascript
// 决定优先级
1. 如果 promptSource === 'AI_OPTIMIZED' 且有optimizedPrompt → 使用AI优化版
2. 如果 promptSource === 'TEMPLATE' → 使用模板生成的提示词
3. 否则 → 使用用户原始输入

// 模板类型映射
const templateNames = {
  'fashion_model': '服装模特展示',
  'product_still': '产品静物展示',
  'layered_logic': '分层逻辑控制',
  'custom': '自定义提示词'
};
```

**输出字段**:

- `finalPrompt`: 最终使用的提示词
- `promptSourceDisplay`: 提示词来源显示名称
- `templateName`: 模板名称
- `promptLength`: 提示词长度

#### 4. 创建飞书记录

- **节点ID**: `create-feishu-record`
- **功能**: 在飞书表格中创建新记录
- **新增字段**:
  - `模板类型`: 记录使用的模板类型
  - `产品描述`: 用户输入的产品描述
  - `模特类型`: 用户选择的模特类型
  - `场景风格`: 用户选择的场景风格
  - `提示词长度`: 记录提示词字符数

#### 5. 尺寸处理节点链

- 标准化尺寸参数 → 尺寸比例Switch → 5个尺寸设置节点 → AI图片生成

---

### 🔷 飞书轨道节点

#### 1. Webhook触发器-飞书

- **节点ID**: `webhook-feishu-trigger`
- **路径**: `/feishu-trigger`
- **方法**: POST
- **Webhook ID**: `feishu-trigger-complete`

**输入字段**:

```json
{
  "app_token": "string",
  "table_id": "string",
  "record_id": "string"
}
```

#### 2. 飞书鉴权

- **节点ID**: `feishu-auth`
- **功能**: 获取飞书API访问令牌

#### 3. 获取飞书记录

- **节点ID**: `get-feishu-record`
- **功能**: 从飞书表格获取记录详情

#### 4. 提取飞书参数

- **节点ID**: `extract-feishu-params`
- **功能**: 提取飞书记录中的所有字段
- **新增字段**: `templateType`（从"模板类型"字段读取）

#### 5. AI优化-选择最终提示词-飞书 ⭐

- **节点ID**: `ai-optimize-prompt-feishu`
- **类型**: Code节点
- **功能**: 飞书轨道的AI优化逻辑

**核心逻辑**:

```javascript
// 模板类型名称映射（飞书 → 系统）
const templateNames = {
  服装模特展示: 'fashion_model',
  产品静物展示: 'product_still',
  分层逻辑控制: 'layered_logic',
  自定义: 'custom',
};

// 提示词来源判断
if (promptSource === 'AI优化' && optimizedPrompt) {
  finalPrompt = optimizedPrompt;
} else if (promptSource === '模板生成' && originalPrompt) {
  finalPrompt = originalPrompt; // 模板已在后端组装
} else {
  finalPrompt = originalPrompt;
}
```

#### 6. 更新飞书状态-处理中

- **节点ID**: `update-feishu-processing`
- **功能**: 更新飞书记录状态为"处理中"
- **新增字段**: 更新"提示词长度"

---

## 🔌 节点连接关系

### 前端轨道流程

```
Webhook触发器-前端
    ↓
解析前端参数
    ↓
AI优化-选择最终提示词 ⭐
    ↓
创建飞书记录（包含模板类型、产品描述等）
    ↓
提取飞书记录ID
    ↓
标准化尺寸参数
    ↓
switch-aspect-ratio
    ├→ 1:1尺寸 ──┐
    ├→ 3:4尺寸 ──┤
    ├→ 16:9尺寸 ─┼→ AI图片生成-前端
    ├→ 9:16尺寸 ─┤
    └→ 默认尺寸 ──┘
    ↓
格式化结果
    ↓
更新飞书记录
    ↓
回调前端API（包含promptSource和templateType）
    ↓
返回前端成功响应
```

### 飞书轨道流程

```
Webhook触发器-飞书
    ↓
飞书鉴权
    ↓
获取飞书记录
    ↓
提取飞书参数（包含模板类型）
    ↓
AI优化-选择最终提示词-飞书 ⭐
    ↓
更新飞书状态-处理中（包含提示词长度）
    ↓
下载商品图片
    ↓
判断是否有场景图
    ├→ 有 ─→ 下载场景图 ─┐
    └→ 无 ──────────────┤
                         ↓
                   AI图片生成
                         ↓
                   处理生成结果
                         ↓
                   上传到飞书
                         ↓
                   更新飞书结果
                         ↓
                   返回飞书成功响应
```

---

## 📝 飞书表格字段配置

### 必需字段

| 字段名称 | 字段类型 | 说明             | 是否必需 |
| -------- | -------- | ---------------- | -------- |
| 提示词   | 文本     | 当前使用的提示词 | 是       |
| 商品图   | 附件     | 产品图片         | 是       |
| 状态     | 单选     | 任务状态         | 是       |
| 数据来源 | 单选     | 前端/飞书        | 是       |
| 同步状态 | 单选     | 同步状态         | 是       |

### AI优化相关字段 ⭐

| 字段名称     | 字段类型 | 说明                     | 是否必需 |
| ------------ | -------- | ------------------------ | -------- |
| 优化后提示词 | 文本     | AI优化后的提示词         | 可选     |
| 提示词来源   | 单选     | 用户输入/AI优化/模板生成 | 是       |
| 提示词长度   | 数字     | 提示词字符数             | 可选     |

### 模板系统相关字段 ⭐⭐

| 字段名称 | 字段类型 | 说明               | 是否必需 |
| -------- | -------- | ------------------ | -------- |
| 模板类型 | 单选     | 使用的模板类型     | 是       |
| 产品描述 | 文本     | 用户输入的产品描述 | 可选     |
| 模特类型 | 单选     | 用户选择的模特类型 | 可选     |
| 场景风格 | 单选     | 用户选择的场景风格 | 可选     |

### 其他字段

| 字段名称   | 字段类型 | 说明         | 是否必需 |
| ---------- | -------- | ------------ | -------- |
| 场景图     | 附件     | 场景参考图   | 可选     |
| 生成结果   | 附件     | 生成的图片   | 是       |
| 前端用户ID | 文本     | 前端用户ID   | 可选     |
| AI模型     | 单选     | 使用的AI模型 | 是       |
| 尺寸比例   | 单选     | 图片尺寸比例 | 是       |
| 生成数量   | 数字     | 生成图片数量 | 是       |

---

## 🚀 使用示例

### 示例1: 使用模板生成（前端）

**请求示例**:

```json
{
  "taskId": "task-001",
  "userId": "user-123",
  "prompt": "# 商业摄影提示词\n\n产品：红色连衣裙\n模特：亚洲女性\n场景：极简工作室\n\nProfessional commercial fashion photography...",
  "optimizedPrompt": "",
  "promptSource": "TEMPLATE",
  "templateType": "fashion_model",
  "productDescription": "红色连衣裙",
  "modelType": "young_asian_female",
  "sceneStyle": "minimal_studio",
  "productImageUrl": "https://example.com/product.jpg",
  "aiModel": "Gemini-3-Pro-Image",
  "aspectRatio": "3:4",
  "imageCount": 4,
  "callbackUrl": "https://your-app.com/api/webhooks/n8n/callback"
}
```

**处理流程**:

1. AI优化节点检测到 `promptSource === 'TEMPLATE'`
2. 使用模板生成的 `prompt` 作为 `finalPrompt`
3. 创建飞书记录时，模板类型显示为"服装模特展示"
4. 记录产品描述、模特类型、场景风格

### 示例2: 使用AI优化（前端）

**请求示例**:

```json
{
  "taskId": "task-002",
  "userId": "user-456",
  "prompt": "一件漂亮的红色连衣裙",
  "optimizedPrompt": "Professional fashion photography, red dress, Asian female model, elegant pose, minimalist studio lighting, soft shadows, commercial quality, 8k resolution...",
  "promptSource": "AI_OPTIMIZED",
  "templateType": "custom",
  "productImageUrl": "https://example.com/product.jpg",
  "aiModel": "FLUX.1",
  "aspectRatio": "1:1",
  "imageCount": 2,
  "callbackUrl": "https://your-app.com/api/webhooks/n8n/callback"
}
```

**处理流程**:

1. AI优化节点检测到 `promptSource === 'AI_OPTIMIZED'` 且有 `optimizedPrompt`
2. 使用 `optimizedPrompt` 作为 `finalPrompt`
3. 提示词来源显示为"AI优化"
4. 记录原始提示词和优化后提示词

### 示例3: 用户直接输入（飞书）

**飞书记录**:

- 提示词: "一个蓝色西装，职业男性，现代办公室"
- 优化后提示词: (空)
- 提示词来源: "用户输入"
- 模板类型: "自定义"
- 商品图: [已上传]

**处理流程**:

1. 飞书Webhook触发
2. 获取记录详情
3. AI优化节点检测到提示词来源为"用户输入"
4. 使用原始提示词进行生成
5. 更新飞书记录状态

---

## 🔧 环境变量配置

### N8N环境变量

在N8N工作流设置中配置以下环境变量：

```bash
# 飞书应用配置
FEISHU_APP_TOKEN=your_app_token
FEISHU_TABLE_ID=your_table_id

# API配置
N8N_WEBHOOK_URL=your_n8n_webhook_url
DEERAPI_KEY=your_deerapi_key
```

---

## 📊 数据流图

### 完整数据流（包含AI优化和模板）

```
┌─────────────────────────────────────────────────────────────┐
│                     前端Web界面                              │
│  用户选择模板 → 填写参数 → 后端组装提示词 → [可选]AI优化    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    N8N工作流                                 │
│  接收数据 → AI优化节点 → 创建飞书记录 → AI生成 → 回调      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    飞书表格                                  │
│  记录：提示词、模板类型、产品描述、AI模型、生成结果         │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ 注意事项

### 1. 凭证配置

**必需的凭证**:

- Feishu Credentials account 3 (飞书API)
- DeerAPI account 2 (AI图片生成)
- Header Auth account 2 (前端回调认证)

### 2. 字段映射

**前端 → N8N → 飞书**:

- `templateType` → `模板类型`
- `productDescription` → `产品描述`
- `modelType` → `模特类型`
- `sceneStyle` → `场景风格`
- `promptSource` → `提示词来源`
- `promptLength` → `提示词长度`

### 3. 模板类型枚举

**系统中的模板类型**:

- `fashion_model`: 服装模特展示
- `product_still`: 产品静物展示
- `layered_logic`: 分层逻辑控制
- `custom`: 自定义提示词

### 4. 提示词来源枚举

**系统中的提示词来源**:

- `USER`: 用户输入
- `AI_OPTIMIZED`: AI优化（前端）
- `AI优化`: AI优化（飞书显示）
- `TEMPLATE`: 模板生成
- `模板生成`: 模板生成（飞书显示）

---

## 🎯 核心优势

### 1. 双轨并行

- 前端和飞书独立工作流
- 互不干扰，各自优化
- 统一的数据模型

### 2. AI优化集成

- 智能提示词选择
- 支持多级优化
- 保留原始输入

### 3. 多模板系统

- 4种内置模板
- 无限扩展能力
- 模板元数据记录

### 4. 完整的数据追溯

- 记录所有输入参数
- 提示词来源追踪
- 模板类型记录
- 生成质量分析

---

## 📚 相关文档

1. **AI优化功能设计**: `AI优化提示词功能设计.md`
2. **结构化提示词模板方案**: `结构化提示词模板方案-实施指南.md`
3. **多模板系统架构**: `多模板系统架构-完整实施方案.md`
4. **飞书字段配置**: `FEISHU_FIELD_CONFIG.md`
5. **N8N节点配置**: `N8N_NODE_CONFIG.md`

---

## ✅ 导入步骤

1. 打开N8N界面
2. 点击右上角 "Import from File"
3. 选择 `n8n-workflow-complete.json`
4. 配置凭证（Feishu、DeerAPI、Header Auth）
5. 设置环境变量
6. 激活工作流
7. 测试Webhook触发器

---

## 🎉 完成验证

工作流创建完成后，请验证：

- [ ] 前端Webhook可以正常触发
- [ ] 飞书Webhook可以正常触发
- [ ] AI优化节点正确选择提示词
- [ ] 模板类型正确记录到飞书
- [ ] 产品描述等字段正确保存
- [ ] AI图片生成正常
- [ ] 飞书记录正确更新
- [ ] 前端回调正常接收

---

**文档结束**

如有问题，请参考相关文档或联系技术支持。
