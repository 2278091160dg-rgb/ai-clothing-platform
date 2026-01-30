# N8N工作流兼容性验证报告

## 验证日期

2026-01-29

## 工作流文件

- `n8n-workflow-frontend-v3.json` - 前端触发工作流
- `n8n-workflow-feishu-v3.json` - 飞书触发工作流

---

## 1. 输入参数验证

### 1.1 前端工作流输入参数

**当前支持的参数**:

```json
{
  "taskId": "string",
  "userId": "string",
  "productImageUrl": "string",
  "sceneImageUrl": "string (可选)",
  "prompt": "string",
  "aiModel": "string",
  "aspectRatio": "string",
  "imageCount": "number",
  "quality": "string",
  "callbackUrl": "string",
  "deerApiKey": "string (可选)"
}
```

### 1.2 新增字段支持

**需要新增的字段**（用于提示词优化和同步）:

```json
{
  // 原有字段
  "taskId": "string",
  "userId": "string",
  "productImageUrl": "string",
  "sceneImageUrl": "string",
  "prompt": "string",
  "aiModel": "string",
  "aspectRatio": "string",
  "imageCount": "number",
  "quality": "string",
  "callbackUrl": "string",
  "deerApiKey": "string",

  // 新增字段（向后兼容，可选）
  "originalPrompt": "string (可选)", // 原始提示词
  "optimizedPrompt": "string (可选)", // AI优化后的提示词
  "promptSource": "string (可选)", // 提示词来源
  "feishuRecordId": "string (可选)" // 飞书记录ID
}
```

**验证结果**: ✅ **兼容**

- 新增字段都是可选的
- N8N工作流会忽略未知参数
- 现有参数无需修改

---

## 2. 回调格式验证

### 2.1 当前回调格式

**N8N → 前端回调**:

```json
{
  "taskId": "string",
  "status": "completed",
  "resultImageUrls": "string[]",
  "progress": 100
}
```

**前端 API 期望格式**:

```typescript
{
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultImageUrls?: string[];
  resultImageTokens?: string[];
  error?: string;
  progress?: number;
}
```

### 2.2 验证结果

| 字段              | N8N发送 | API期望 | 兼容性 | 说明     |
| ----------------- | ------- | ------- | ------ | -------- |
| taskId            | ✅      | ✅      | ✅     | 完全兼容 |
| status            | ✅      | ✅      | ✅     | 值匹配   |
| resultImageUrls   | ✅      | ✅      | ✅     | 完全兼容 |
| resultImageTokens | ❌      | ✅      | ⚠️     | 需要添加 |
| error             | ❌      | ✅      | ⚠️     | 需要添加 |
| progress          | ✅      | ✅      | ✅     | 完全兼容 |

**验证结果**: ⚠️ **部分兼容，需要小修改**

---

## 3. 修改建议

### 3.1 N8N工作流修改（最小改动）

**修改回调节点配置**:

当前配置（line 409）:

```json
"jsonBody": "={
  \"taskId\": \"{{ $('解析请求参数').item.json.taskId }}\",
  \"status\": \"completed\",
  \"resultImageUrls\": \"{{ $json.resultImageUrls }}\",
  \"progress\": 100
}"
```

**建议修改为**:

```json
"jsonBody": "={
  \"taskId\": \"{{ $('解析请求参数').item.json.taskId }}\",
  \"status\": \"{{ $json.status }}\",
  \"resultImageUrls\": \"{{ $json.resultImageUrls }}\",
  \"resultImageTokens\": \"{{ $json.resultImageTokens }}\",
  \"progress\": {{ $json.progress }},
  \"error\": \"{{ $json.error }}\"
}"
```

**改动说明**:

1. ✅ 添加 `resultImageTokens` 字段
2. ✅ 添加 `error` 字段
3. ✅ 使用动态 `status` 而不是硬编码 `completed`
4. ✅ 使用动态 `progress` 而不是硬编码 `100`

### 3.2 替代方案：无需修改N8N

如果不想修改N8N工作流，可以在前端API层做适配：

**前端 API 适配层** (`src/app/api/webhooks/n8n/callback/route.ts`):

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();

  // 适配N8N回调格式
  const adaptedBody = {
    ...body,
    // 添加缺失的字段
    resultImageTokens: body.resultImageTokens || [],
    error: body.error || null,
  };

  await n8nService.handleCallback(adaptedBody);

  return NextResponse.json({ success: true });
}
```

**推荐**: 使用适配层方案，无需修改N8N工作流

---

## 4. 输入参数扩展

### 4.1 新增参数支持

前端需要传递给N8N的额外参数：

```typescript
// src/lib/services/n8n.service.ts

async triggerGeneration(request: GenerationRequest): Promise<void> {
  const payload = {
    // 现有参数
    taskId: request.taskId,
    userId: request.userId,
    productImageUrl: request.productImageUrl,
    sceneImageUrl: request.sceneImageUrl,
    prompt: request.prompt,  // 最终使用的提示词
    aiModel: request.aiModel,
    aspectRatio: request.aspectRatio,
    imageCount: request.imageCount,
    quality: request.quality,
    deerApiKey: request.deerApiKey,
    callbackUrl: request.callbackUrl,

    // 新增参数（可选）
    ...(request.originalPrompt && {
      originalPrompt: request.originalPrompt
    }),
    ...(request.optimizedPrompt && {
      optimizedPrompt: request.optimizedPrompt
    }),
    ...(request.promptSource && {
      promptSource: request.promptSource
    }),
    ...(request.feishuRecordId && {
      feishuRecordId: request.feishuRecordId
    }),
  };

  // ... 发送到N8N
}
```

**验证结果**: ✅ **向后兼容**

- 所有新增参数都是可选的
- N8N会自动忽略未知参数
- 不会影响现有功能

---

## 5. 测试验证清单

### 5.1 输入参数测试

- [ ] 基础参数测试（taskId, userId, prompt等）
- [ ] 新增参数测试（originalPrompt, optimizedPrompt等）
- [ ] 可选参数缺失测试
- [ ] 参数类型验证

### 5.2 回调格式测试

- [ ] 成功回调（status = completed）
- [ ] 失败回调（status = failed）
- [ ] 进度回调（status = processing）
- [ ] 错误信息传递（error字段）

### 5.3 端到端测试

- [ ] 前端创建任务 → N8N处理 → 回调更新
- [ ] 飞书记录ID传递 → N8N处理 → 正确返回
- [ ] AI优化提示词 → N8N使用优化版 → 成功生成

---

## 6. 兼容性结论

### 6.1 修改方案

| 方案                   | N8N改动 | 前端改动 | 复杂度 | 推荐度     |
| ---------------------- | ------- | -------- | ------ | ---------- |
| **方案A**: 修改N8N回调 | ⚠️ 小   | 无       | 低     | ⭐⭐⭐     |
| **方案B**: 前端适配    | ✅ 无   | ⚠️ 小    | 低     | ⭐⭐⭐⭐⭐ |

### 6.2 推荐：方案B（前端适配）

**理由**:

1. ✅ 无需修改N8N工作流
2. ✅ 风险最小
3. ✅ 实现简单
4. ✅ 向后兼容

**实施步骤**:

1. 在前端API层添加参数适配
2. 支持新增的可选参数
3. 测试端到端流程

---

## 7. 具体实施代码

### 7.1 N8N服务更新

```typescript
// src/lib/services/n8n.service.ts

interface GenerationRequest {
  taskId: string;
  userId: string;
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string;  // 最终使用的提示词

  // 新增：提示词优化相关
  originalPrompt?: string;
  optimizedPrompt?: string;
  promptSource?: 'USER' | 'AI_OPTIMIZED' | 'FEISHU';

  // 新增：飞书同步
  feishuRecordId?: string;

  // 现有字段
  aiModel: string;
  aspectRatio: string;
  imageCount: number;
  quality: string;
  deerApiKey?: string;
  callbackUrl?: string;
}

async triggerGeneration(request: GenerationRequest): Promise<void> {
  const callbackUrl = request.callbackUrl ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n/callback`;

  const payload = {
    // 基础参数
    taskId: request.taskId,
    userId: request.userId,
    productImageUrl: request.productImageUrl,
    sceneImageUrl: request.sceneImageUrl,
    prompt: request.prompt,
    aiModel: request.aiModel,
    aspectRatio: request.aspectRatio,
    imageCount: request.imageCount,
    quality: request.quality,
    deerApiKey: request.deerApiKey || '',
    callbackUrl,

    // 扩展参数（可选）
    ...(request.originalPrompt && { originalPrompt: request.originalPrompt }),
    ...(request.optimizedPrompt && { optimizedPrompt: request.optimizedPrompt }),
    ...(request.promptSource && { promptSource: request.promptSource }),
    ...(request.feishuRecordId && { feishuRecordId: request.feishuRecordId }),
  };

  // 发送到N8N
  await fetch(this.config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

### 7.2 回调适配层

```typescript
// src/app/api/webhooks/n8n/callback/route.ts

export async function POST(req: NextRequest) {
  try {
    // 初始化应用
    initializeApp();

    // 验证API Key
    const apiKey = req.headers.get('x-n8n-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // 适配N8N回调格式（补全缺失字段）
    const adaptedBody = {
      taskId: body.taskId,
      status: body.status,
      progress: body.progress ?? 0,
      // N8N可能不发送这些字段，提供默认值
      resultImageUrls: body.resultImageUrls,
      resultImageTokens: body.resultImageTokens ?? null,
      error: body.error ?? null,
    };

    // 验证必填字段
    if (!adaptedBody.taskId || !adaptedBody.status) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, status' },
        { status: 400 }
      );
    }

    console.log('[Webhook] Received n8n callback:', {
      taskId: adaptedBody.taskId,
      status: adaptedBody.status,
      progress: adaptedBody.progress,
    });

    const n8nService = getN8nService();
    await n8nService.handleCallback(adaptedBody);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Failed to handle n8n callback:', error);
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 });
  }
}
```

---

## 8. 总结

### 8.1 兼容性评估

| 方面     | 状态        | 说明               |
| -------- | ----------- | ------------------ |
| 输入参数 | ✅ 完全兼容 | 新增字段都是可选的 |
| 输出格式 | ⚠️ 需适配   | 使用适配层处理     |
| 回调处理 | ✅ 可用     | 现有格式基本兼容   |
| 整体评估 | ✅ 可用     | 无需修改N8N工作流  |

### 8.2 建议行动

1. ✅ **立即执行**：在前端添加回调适配层
2. ✅ **第二优先级**：更新N8N服务以支持新增参数
3. ⏸️ **可选执行**：修改N8N工作流回调格式（如果需要更完整的错误处理）

### 8.3 风险评估

| 风险        | 概率 | 影响 | 缓解措施              |
| ----------- | ---- | ---- | --------------------- |
| N8N格式变更 | 低   | 中   | 使用适配层，与N8N解耦 |
| 参数缺失    | 低   | 低   | 提供默认值            |
| 类型不匹配  | 低   | 低   | 类型转换和验证        |
| 回调失败    | 中   | 中   | 重试机制 + 错误日志   |

---

## 9. 下一步

- [x] 验证N8N工作流输入参数
- [x] 验证N8N工作流回调格式
- [x] 创建前端适配层
- [ ] 测试端到端流程
- [ ] 验证飞书同步集成
