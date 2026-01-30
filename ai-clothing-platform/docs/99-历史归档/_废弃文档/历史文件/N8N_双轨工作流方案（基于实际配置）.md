# N8N 双轨工作流方案（基于实际配置重新设计）

## 🎯 核心原则

根据你的实际配置和需求，重新设计工作流：

### ✅ 不需要ENV配置

- 使用已有的 **DeerAPI account** 凭证
- 使用已有的 **Feishu Credentials** 凭证

### ✅ 使用正确的模型

- 模型：**Gemini-3-Pro-Image**
- 不是FLUX！

### ✅ 支持双图输入

- 第一张图：产品图（必需）
- 第二张图：场景图（可选）
- 符合DeerAPI的要求

### ✅ 参数不写死

- 分辨率：可选
- 尺寸比例：可选
- 数量：可选

---

## 📋 飞书多维表格字段配置（最终版）

根据你的截图提示词，飞书表格需要的字段：

### 必填字段

| 字段名       | 类型     | 说明             | 示例                              |
| ------------ | -------- | ---------------- | --------------------------------- |
| **提示词**   | 多行文本 | AI生成提示词     | "你是一位资深电商视觉设计专家..." |
| **商品图片** | 附件     | 第一张图：产品图 | [图片]                            |
| **生成结果** | 附件     | AI生成的结果     | [图片数组]                        |
| **状态**     | 单选     | 任务状态         | Idle / Processing / Completed     |

### 可选字段

| 字段名       | 类型 | 说明               | 示例                    |
| ------------ | ---- | ------------------ | ----------------------- |
| **场景图**   | 附件 | 第二张图：参考场景 | [图片]                  |
| **AI模型**   | 单选 | 模型选择           | Gemini-3-Pro-Image      |
| **尺寸比例** | 单选 | 图片比例           | 1:1 / 3:4 / 16:9 / 9:16 |
| **生成数量** | 数字 | 生成几张图         | 4                       |

### ⚠️ 重要说明

**如果飞书表格中不提供可选字段**：

- AI模型 → 使用默认值：Gemini-3-Pro-Image
- 尺寸比例 → 使用默认值：3:4
- 生成数量 → 使用默认值：4
- 场景图 → 如果不填，只使用商品图

**如果飞书表格中提供可选字段**：

- 从字段读取用户选择的值
- 如果字段为空，使用默认值

---

## 🔧 N8N工作流设计

### 方案选择

根据你的需求，有两种方案：

### 方案A：分离工作流（推荐）✅

**创建2个独立工作流**：

#### 工作流1：前端触发流程

```
前端 → 后端API → N8N工作流1
                    ↓
            DeerAPI生成
                    ↓
            回调后端
                    ↓
            同步到飞书（后端处理）
```

**节点**：

1. Webhook触发器（接收前端请求）
2. 解析参数
3. 判断比例（1:1, 3:4, 16:9, 9:16）
4. 设置尺寸
5. DeerAPI生成（使用Gemini-3-Pro-Image）
6. 格式化结果
7. 回调后端

**特点**：

- ✅ 简单直接
- ✅ 前端参数动态传入
- ✅ 结果回调后端

#### 工作流2：飞书触发流程

```
飞书多维表格 → 飞书机器人 → N8N工作流2
                            ↓
                    读取记录数据
                            ↓
                    DeerAPI生成
                            ↓
                    更新飞书记录
```

**节点**：

1. 飞书触发器（监听表格变更）
2. 读取记录数据（从飞书多维表格）
3. 提取参数：
   - 提示词：`{{ $json.data.records[0].fields['提示词'][0].text }}`
   - 商品图片：`{{ $json.data.records[0].fields['商品图片'] }}`
   - 场景图：`{{ $json.data.records[0].fields['场景图'] }}`（可选）
4. DeerAPI生成（使用Gemini-3-Pro-Image）
5. 格式化结果为飞书格式
6. 更新飞书记录

**特点**：

- ✅ 直接从飞书读取
- ✅ 结果写回飞书
- ✅ 使用Feishu Credentials凭证

---

### 方案B：统一工作流

**创建1个工作流处理2种来源**：

```
统一Webhook
    ↓
识别来源（IF判断）
    ├─ 前端路径
    │   ↓
    │   解析前端参数
    │   ↓
    │   DeerAPI生成
    │   ↓
    │   回调后端
    │
    └─ 飞书路径
        ↓
        解析飞书数据
        ↓
        DeerAPI生成
        ↓
        更新飞书记录
```

**优点**：一个工作流维护
**缺点**：逻辑复杂，调试困难

---

## 🎯 我的推荐：方案A（分离工作流）

### 理由：

1. **你已有的配置符合方案A**
   - 你已经有DeerAPI凭证
   - 你已经有Feishu Credentials凭证
   - 每个工作流使用对应的凭证

2. **职责清晰**
   - 工作流1：专门处理前端请求
   - 工作流2：专门处理飞书请求
   - 互不干扰

3. **易于维护**
   - 每个工作流简单明了
   - 出问题容易排查
   - 可以独立优化

---

## 📝 详细配置

### 工作流1：前端触发（已有）

这个你已经有了，只需要确认：

- ✅ DeerAPI凭证正确
- ✅ 模型改为：Gemini-3-Pro-Image
- ✅ 支持场景图参数（可选）

### 工作流2：飞书触发（新建）

#### 节点1：飞书触发器

**类型**：Feishu Trigger
**配置**：

```
触发条件：记录变更
表格：你的多维表格
监听字段：生成主图按钮
```

#### 节点2：读取记录数据

**类型**：Feishu Bitable - Get Record
**配置**：

```
凭证：Feishu Credentials account
App Token：{{ $env.FEISHU_BITABLE_APP_TOKEN }}  // 或直接填写
Table ID：{{ $env.FEISHU_BITABLE_TABLE_ID }}    // 或直接填写
Record ID：{{ $json.trigger.record_id }}
```

**或者不使用ENV，直接在节点中填写**：

```
App Token：app_你的Token（直接填写）
Table ID：tbl_你的ID（直接填写）
```

#### 节点3：提取参数

**类型**：Set
**配置**：

```javascript
{
  "prompt": "={{ $json.data.records[0].fields['提示词'][0].text }}",
  "productImage": "={{ $json.data.records[0].fields['商品图片'][0] }}",
  "sceneImage": "={{ $json.data.records[0].fields['场景图'] && $json.data.records[0].fields['场景图'][0] }}",
  "aiModel": "={{ $json.data.records[0].fields['AI模型'] || 'Gemini-3-Pro-Image' }}",
  "aspectRatio": "={{ $json.data.records[0].fields['尺寸比例'] || '3:4' }}",
  "imageCount": "={{ $json.data.records[0].fields['生成数量'] || 4 }}"
}
```

#### 节点4：DeerAPI生成

**类型**：HTTP Request
**配置**：

```
Method: POST
URL: https://api.deerapi.com/v1/ai/generate
凭证：DeerAPI account

Body:
{
  "model": "{{ $json.aiModel }}",
  "prompt": "{{ $json.prompt }} 注意：第一张图片是产品图，第二张图片是场景图。请使用第一张图片（产品图）和第二张图片（场景图）进行生成。",
  "image": "{{ $json.productImage }}",
  "image2": "{{ $json.sceneImage }}",  // 可选
  "resolution": "1K",
  "aspect_ratio": "{{ $json.aspectRatio }}",
  "num_images": {{ $json.imageCount }}
}
```

**注意**：

- 使用你的 **DeerAPI account** 凭证
- 模型使用 **Gemini-3-Pro-Image**
- 提示词加上你截图中的说明
- 支持双图输入

#### 节点5：格式化结果

**类型**：Set
**配置**：

```javascript
{
  "resultImages": "={{ $json.data.images }}",
  "status": "Completed"
}
```

#### 节点6：更新飞书记录

**类型**：Feishu Bitable - Update Record
**配置**：

```
凭证：Feishu Credentials account
App Token：app_你的Token
Table ID：tbl_你的ID
Record ID：{{ $('提取参数').item.json.recordId }}

Fields:
{
  "生成结果": "{{ $json.resultImages }}",
  "状态": "Completed"
}
```

---

## ⚠️ 关于ENV的澄清

### 不需要ENV的情况（推荐）：

**DeerAPI凭证**：

```
直接在节点中配置：
1. 选择凭证类型：DeerAPI
2. 选择已有凭证：DeerAPI account
3. 不需要ENV
```

**Feishu凭证**：

```
直接在节点中配置：
1. 选择凭证类型：Feishu Credentials API
2. 选择已有凭证：Feishu Credentials account
3. 不需要ENV
```

**App Token和Table ID**：

```
两种方式：

方式1：直接在节点填写（推荐）
App Token：app_abc123（直接输入）
Table ID：tbl_xyz789（直接输入）

方式2：使用ENV（可选）
App Token：{{ $env.FEISHU_BITABLE_APP_TOKEN }}
Table ID：{{ $env.FEISHU_BITABLE_TABLE_ID }}
```

### 什么时候需要ENV？

- ❌ DeerAPI凭证：不需要，用凭证方式
- ❌ Feishu凭证：不需要，用凭证方式
- ⚠️ App Token/Table ID：可选，可以直接填写或使用ENV

---

## 🎯 总结：推荐的方案

### ✅ 使用方案A：分离工作流

**工作流1（前端）**：

- 你已经配置好了
- 确认使用DeerAPI account凭证
- 确认模型改为Gemini-3-Pro-Image

**工作流2（飞书）**：

- 新建一个飞书专用工作流
- 使用Feishu Credentials account凭证
- 使用DeerAPI account凭证
- 从飞书表格读取 → 生成 → 写回飞书

### ✅ 不需要ENV配置

- 凭证在N8N凭证管理中配置
- App Token和Table ID可以直接填写在节点中

### ✅ 飞书表格字段（简化版）

**最少需要**：

1. 提示词（必填）
2. 商品图片（必填）
3. 生成结果（自动写入）
4. 状态（自动更新）

**可选字段**：

1. 场景图（可选）
2. AI模型（可选，默认Gemini-3-Pro-Image）
3. 尺寸比例（可选，默认3:4）
4. 生成数量（可选，默认4）

---

## 🤔 请确认

1. **方案A（分离工作流）是否可行？**
2. **飞书表格字段配置是否符合？**
3. **是否需要我创建完整的飞书触发工作流JSON？**
4. **App Token和Table ID是否直接填写在节点中（不用ENV）？**

请确认后，我将为你创建完整的工作流JSON文件！
