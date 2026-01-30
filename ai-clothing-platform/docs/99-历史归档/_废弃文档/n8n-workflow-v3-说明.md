# 📄 N8N工作流 - 多模式版本

## 📅 版本：v3.0

## 📅 更新日期：2026-01-29

---

## 🎯 更新内容

### 新增功能

- ✅ 支持模式参数解析
- ✅ 模式分发路由
- ✅ 4个模式的提示词构建

### 文件位置

`docs/n8n-workflow-v3-multi-mode.json`

---

## 🔧 核心节点变更

### 1. Webhook接收节点（已有）

**节点ID**: `webhook-frontend-trigger`

**接收参数**:

```json
{
  "mode": "scene|tryon|wear|combine",
  "taskId": "string",
  "userId": "string"
  // ... 其他参数
}
```

---

### 2. 解析前端参数节点（修改）

**节点ID**: `parse-frontend-params`

**JavaScript代码**:

```javascript
// 解析mode参数
const mode = $json.mode;

// 验证mode
if (!mode || !['scene', 'tryon', 'wear', 'combine'].includes(mode)) {
  throw new Error(`Invalid mode: ${mode}`);
}

// 返回解析后的数据
return {
  ...$json,
  _mode: mode,
  _parsed: true,
  _timestamp: new Date().toISOString(),
};
```

---

### 3. 模式分发节点（新增）

**节点ID**: `mode-dispatcher`

**类型**: Switch

**路由规则**:

```
场景生图 (scene) → 输出0 → 场景生图分支
虚拟试衣 (tryon) → 输出1 → 虚拟试衣分支
智能穿戴 (wear) → 输出2 → 智能穿戴分支
自由搭配 (combine) → 输出3 → 自由搭配分支
```

---

### 4. 场景生图分支（修改）

**节点ID**: `build-scene-prompt`

**JavaScript代码**:

```javascript
// 场景生图提示词构建
const productImage = $json.productImageUrl || '';
const sceneImage = $json.sceneImageUrl || '';
const prompt = $json.prompt || '';

// 构建提示词
const finalPrompt = `# Product Photography - Scene Generation

## Product
- **Product Image**: ${productImage}
- **Prompt**: ${prompt}

${sceneImage ? `- **Scene Image**: ${sceneImage}` : ''}

## Instructions
Create a professional product photograph with the product in an ideal scene.

---

Professional product photography, ${prompt}, high quality, 8k resolution.`;

return {
  ...$json,
  finalPrompt: finalPrompt,
  _branch: 'scene',
  _processed: true,
};
```

---

### 5. 虚拟试衣分支（新增）

**节点ID**: `build-tryon-prompt`

**JavaScript代码**:

```javascript
// 虚拟试衣提示词构建
const clothingImage = $json.clothingImageUrl || '';
const referenceImage = $json.tryonReferenceImageUrl || '';
const modelDescription = $json.modelDescription || '年轻亚洲女性模特';
const sceneDescription = $json.sceneDescription || 'studio背景';
const tryonMode = $json.tryonMode || 'single';

// 构建提示词
const finalPrompt = `# Virtual Try-On Task

## Product
- **Clothing Image**: ${clothingImage}

${
  referenceImage
    ? `
## Reference
- **Reference Image**: ${referenceImage}
`
    : ''
}

## Model
- **Description**: ${modelDescription}

${
  sceneDescription
    ? `
## Scene
- **Environment**: ${sceneDescription}
`
    : ''
}

## Instructions
1. Maintain all original design elements
2. Adapt clothing to figure naturally
3. Realistic fabric draping

---

Professional virtual try-on photography, ${clothingImage}, ${modelDescription}, ${sceneDescription}, realistic fabric draping, natural fit, maintain original design, photo-realistic, 8k quality.`;

return {
  ...$json,
  finalPrompt: finalPrompt,
  _branch: 'tryon',
  _processed: true,
};
```

---

### 6. 智能穿戴分支（新增）

**节点ID**: `build-wear-prompt`

**JavaScript代码**:

```javascript
// 智能穿戴提示词构建
const productImage = $json.wearProductImageUrl || '';
const productDescription = $json.wearProductDescription || 'product';
const referenceImage = $json.wearReferenceImageUrl || '';
const productType = $json.productType || 'shoes';

// 位置映射
const positionMap = {
  shoes: 'on feet',
  bag: 'on shoulder or in hand',
  watch: 'on wrist',
  jewelry: 'on body',
  hat: 'on head',
  scarf: 'around neck',
};

// 构建提示词
const finalPrompt = `# Smart Product Wearing Task

## Product
- **Product Image**: ${productImage}
- **Product**: ${productDescription}
- **Type**: ${productType}
- **Position**: ${positionMap[productType]}

## Reference
- **Reference**: ${referenceImage}

## Instructions
1. Place product on ${positionMap[productType]}
2. Natural size and proportion
3. Seamless integration

---

Professional product photography, ${productType} ${productDescription}, ${positionMap[productType]}, natural integration, photo-realistic, 8k quality.`;

return {
  ...$json,
  finalPrompt: finalPrompt,
  _branch: 'wear',
  _processed: true,
};
```

---

### 7. 自由搭配分支（新增）

**节点ID**: `build-combine-prompt`

**JavaScript代码**:

```javascript
// 自由搭配提示词构建
const materials = $json.materialImageUrls || [];
const combinationCount = $json.combinationCount || 4;
const modelType = $json.modelType || 'any';
const stylePreference = $json.stylePreference || 'casual';

// 构建提示词
const finalPrompt = `# Free Combination Generation Task

## Task
Create ${combinationCount} unique outfit combinations from ${materials.length} material items.

## Materials
${materials.map((m, i) => `- Item ${i + 1}: ${m}`).join('\n')}

## Style
- **Style**: ${stylePreference}
- **Model**: ${modelType}

## Instructions
1. Create ${combinationCount} distinct combinations
2. Maximize variety across looks
3. Each combination should be stylish

---

Professional fashion photography, ${combinationCount} outfit combinations, using ${materials.length} materials, ${stylePreference} style, ${modelType} model, high quality, 8k resolution.`;

return {
  ...$json,
  finalPrompt: finalPrompt,
  _branch: 'combine',
  _processed: true,
};
```

---

### 8. AI图片生成节点（修改）

**节点ID**: `ai-image-generation`

**更新内容**：

```javascript
// 使用构建好的finalPrompt
const prompt = $json.finalPrompt || $json.prompt || 'Product photography';

// 调用DeerAPI
const response = await fetch('https://api.deerapi.com/v1/generate', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${$json.deerApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: prompt,
    model: $json.aiModel || 'gemini-3-pro',
    aspect_ratio: $json.aspectRatio || '3:4',
    num_outputs: $json.imageCount || 4,
  }),
});

const result = await response.json();

return {
  ...$json,
  _generated: true,
  result: result,
};
```

---

## 📊 节点连接关系

```
Webhook触发器-前端
    ↓
解析前端参数
    ↓
模式分发 ←─NEW
    ├─→ 场景生图分支 → AI图片生成 → 创建飞书记录 → 回调前端
    ├─→ 虚拟试衣分支 → AI图片生成 → 创建飞书记录 → 回调前端
    ├─→ 智能穿戴分支 → AI图片生成 → 创建飞书记录 → 回调前端
    └─→ 自由搭配分支 → AI图片生成 → 创建飞书记录 → 回调前端
```

---

## 📋 导入说明

### 如何使用

1. 打开N8N界面
2. 点击右上角 "+" → "Import from File"
3. 选择 `n8n-workflow-v3-multi-mode.json`
4. 等待导入完成
5. 配置3个凭证：
   - Feishu Credentials
   - DeerAPI
   - HTTP Header Auth
6. 配置环境变量：
   ```
   FEISHU_APP_TOKEN=your_app_token
   FEISHU_TABLE_ID=your_table_id
   ```
7. 激活两个Webhook

### 与现有工作流的区别

| 项目       | 现有工作流  | 新工作流v3    |
| ---------- | ----------- | ------------- |
| mode参数   | ❌ 无       | ✅ 有         |
| 模式分发   | ❌ 无       | ✅ Switch节点 |
| 提示词构建 | ❌ 单一分支 | ✅ 4个分支    |
| 支持的功能 | 仅场景生图  | 4种功能       |

---

## ⚠️ 注意事项

1. **Webhook ID会变化**：导入后需要更新前端配置
2. **环境变量需要配置**：确保所有凭证都正确配置
3. **测试顺序**：
   - 先测试场景生图（已有功能）
   - 再测试虚拟试衣（新功能）
   - 最后测试智能穿戴和自由搭配

---

## 🔧 测试验证

### 场景生图测试

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "scene",
    "taskId": "test-001",
    "productImageUrl": "https://example.com/product.jpg",
    "prompt": "温馨卧室场景，柔和光线"
  }'
```

### 虚拟试衣测试

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "tryon",
    "taskId": "test-002",
    "clothingImageUrl": "https://example.com/dress.jpg",
    "clothingDescription": "红色连衣裙",
    "modelDescription": "年轻亚洲女性模特"
  }'
```

### 智能穿戴测试

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "wear",
    "taskId": "test-003",
    "wearProductImageUrl": "https://example.com/shoes.jpg",
    "wearProductDescription": "白色运动鞋",
    "wearReferenceImageUrl": "https://example.com/model.jpg",
    "productType": "shoes"
  }'
```

### 自由搭配测试

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "combine",
    "taskId": "test-004",
    "materialImageUrls": [
      "https://example.com/shirt1.jpg",
      "https://example.com/pants1.jpg",
      "https://example.com/shoes.jpg"
    ],
    "combinationCount": 4,
    "stylePreference": "casual"
  }'
```

---

## ✅ 验证清单

导入后请验证：

- [ ] JSON文件可以正常导入
- [ ] 节点数量正确（应该增加约4个节点）
- [ ] 模式分发Switch节点存在
- [ ] 4个提示词构建节点存在
- [ ] 场景生图分支正常工作
- [ ] 虚拟试衣分支正常工作
- [ ] 智能穿戴分支正常工作
- [ ] 自由搭配分支正常工作
- [ ] 所有分支最终都到DeerAPI

---

## 📞 支持

如有问题，请查看：

- `docs/n8n-workflow-complete-guide.md` - 详细使用指南
- `docs/分阶段实施计划-v3.md` - 开发计划
- `docs/开发Todolist-详细版.md` - 完整todolist
