# API 接口文档

## 版本：v1.0

本文档定义了双轨工作流相关的所有 API 端点。

---

## 基础信息

### Base URL
```
开发环境: http://localhost:3000
生产环境: https://your-app.vercel.app
```

### 认证
```
Header: x-api-key: <your-api-key>
```

### 响应格式
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  timestamp: string
}
```

---

## 1. 任务管理 API

### 1.1 创建任务

**端点**: `POST /api/tasks`

**描述**: 创建新的AI服装生成任务，支持AI优化提示词

**请求体**:
```typescript
{
  // 必填
  prompt: string;              // 提示词（最终使用的）

  // 可选 - 提示词优化
  originalPrompt?: string;     // 用户输入的原始提示词
  optimizedPrompt?: string;    // AI优化后的提示词
  useOptimized?: boolean;       // 是否使用优化版（默认：false）

  // 可选 - 图片输入
  productImageUrl?: string;     // 商品图片URL
  sceneImageUrl?: string;       // 场景图片URL

  // 可选 - 生成配置
  aiModel?: string;             // AI模型（默认：FLUX.1）
  aspectRatio?: string;         // 尺寸比例（默认：1:1）
  imageCount?: number;          // 生成张数（默认：4）
  quality?: string;             // 清晰度（默认：high）

  // 可选 - 回调
  callbackUrl?: string;         // 自定义回调URL
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    task: {
      id: string;               // 任务ID
      userId: string;
      prompt: string;
      originalPrompt?: string;
      optimizedPrompt?: string;
      promptSource: 'USER' | 'AI_OPTIMIZED' | 'FEISHU';
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      version: number;          // 版本号
      syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
      createdAt: string;
      updatedAt: string;
    },
    syncStatus: 'PENDING',      // 与飞书同步状态
    message: string;            // 提示信息
  }
}
```

**错误响应**:
```typescript
// 400 - 参数错误
{
  success: false,
  error: 'Missing required field: prompt'
}

// 500 - 服务器错误
{
  success: false,
  error: 'Failed to create task'
}
```

---

### 1.2 获取任务详情

**端点**: `GET /api/tasks/:id`

**描述**: 获取任务详情，包括同步状态和冲突信息

**路径参数**:
- `id`: 任务ID

**查询参数**:
- `include`: 额外包含的信息（可选）
  - `feishu`: 包含飞书记录信息
  - `history`: 包含修改历史

**响应**:
```typescript
{
  success: true,
  data: {
    task: {
      id: string;
      userId: string;
      prompt: string;
      originalPrompt?: string;
      optimizedPrompt?: string;
      promptSource: 'USER' | 'AI_OPTIMIZED' | 'FEISHU';
      aiModel: string;
      aspectRatio: string;
      imageCount: number;
      quality: string;

      // 状态信息
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      progress: number;
      errorMessage?: string;

      // 结果信息
      resultImageUrls?: string[];
      resultImageTokens?: string[];

      // 并发控制
      version: number;
      lastModifiedBy: 'web' | 'feishu' | 'api';
      lastModifiedAt: string;
      conflictDetected: boolean;

      // 同步状态
      syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
      syncError?: string;
      lastSyncAt?: string;

      // 飞书关联
      feishuRecordId?: string;
      feishuAppToken?: string;
      feishuTableId?: string;

      // 时间信息
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
    },

    // 额外信息（如果查询参数 include=feishu）
    feishuRecord?: {
      recordId: string;
      fields: Record<string, any>;
      createdTime: string;
      lastModifiedTime: string;
    },

    // 元数据
    _meta: {
      version: number;
      lastModifiedBy: string;
      canEdit: boolean;
      conflictDetected: boolean;
      syncStatus: string;
    }
  }
}
```

---

### 1.3 更新任务（带版本控制）

**端点**: `PATCH /api/tasks/:id`

**描述**: 更新任务信息，使用乐观锁检测冲突

**请求体**:
```typescript
{
  version: number;              // 必填：当前版本号（乐观锁）

  // 可更新的字段
  prompt?: string;
  originalPrompt?: string;
  optimizedPrompt?: string;
  promptSource?: 'USER' | 'AI_OPTIMIZED' | 'FEISHU';
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;

  // 状态更新
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  errorMessage?: string;

  // 同步状态
  syncStatus?: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
}
```

**响应**:
```typescript
// 200 - 成功
{
  success: true,
  data: {
    task: Task,
    message: 'Task updated successfully'
  }
}

// 409 - 版本冲突
{
  success: false,
  error: 'Version conflict',
  conflict: {
    taskId: string;
    currentVersion: number;
    expectedVersion: number;
    conflicts: string[];          // 冲突的字段列表
    lastModifiedBy: string;
    lastModifiedAt: string;
    remoteChanges: Record<string, any>;  // 对方的修改
  }
}
```

---

### 1.4 删除任务

**端点**: `DELETE /api/tasks/:id`

**描述**: 删除任务，支持选择是否同步删除飞书记录

**查询参数**:
- `scope`: 删除范围（可选）
  - `both`: 同时删除本地和飞书记录（默认）
  - `local`: 仅删除本地记录

**请求体**（可选）:
```typescript
{
  scope?: 'both' | 'local';     // 删除范围
  version?: number;             // 当前版本号（乐观锁）
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    deleted: boolean,
    taskId: string,
    feishuRecordDeleted: boolean,
    message: string
  }
}
```

---

### 1.5 查询任务列表

**端点**: `GET /api/tasks`

**查询参数**:
```
?page=1                      // 页码（默认：1）
?limit=20                    // 每页数量（默认：20）
?status=COMPLETED            // 状态筛选
?syncStatus=SYNCED            // 同步状态筛选
?promptSource=AI_OPTIMIZED    // 提示词来源筛选
?sortBy=createdAt             // 排序字段
?order=desc                  // 排序方向
```

**响应**:
```typescript
{
  success: true,
  data: {
    tasks: Task[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
}
```

---

## 2. 双向关联查询 API

### 2.1 查询任务与飞书记录关联

**端点**: `GET /api/tasks/link`

**查询参数**:
```
?taskId=xxx              // 通过任务ID查询飞书记录
?feishuRecordId=xxx      // 通过飞书记录ID查询任务
```

**响应**:
```typescript
// 通过 taskId 查询
{
  success: true,
  data: {
    task: {
      id: string;
      prompt: string;
      status: string;
      feishuRecordId: string;
      createdAt: string;
    },
    feishuRecord: {
      recordId: string;
      fields: Record<string, any>;
      createdTime: string;
      lastModifiedTime: string;
    },
    linked: boolean,        // 是否已关联
    message: string
  }
}

// 通过 feishuRecordId 查询
{
  success: true,
  data: {
    task: {
      id: string;
      status: string;
      feishuRecordId: string;
      createdAt: string;
      completedAt?: string;
    },
    feishuRecord: {
      recordId: string;
      fields: Record<string, any>;
      createdTime: string;
    },
    linked: boolean,
    message: string
  }
}
```

---

### 2.2 手动关联任务与飞书记录

**端点**: `POST /api/tasks/link`

**描述**: 手动关联本地任务与飞书记录

**请求体**:
```typescript
{
  taskId: string;            // 本地任务ID
  feishuRecordId: string;     // 飞书记录ID
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    task: {
      id: string;
      feishuRecordId: string;
    },
    message: 'Task linked to Feishu record successfully'
  }
}
```

---

## 3. 冲突解决 API

### 3.1 解决版本冲突

**端点**: `POST /api/tasks/:id/resolve-conflict`

**描述**: 解决版本冲突，选择使用哪个版本的数据

**请求体**:
```typescript
{
  strategy: 'use_local' | 'use_remote' | 'merge';
  expectedVersion: number;     // 期望的版本号

  // merge 策略时的字段选择
  fieldSelection?: {
    [fieldName: string]: 'local' | 'remote';
  };
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    task: Task,
    message: string
  }
}
```

---

## 4. 同步管理 API

### 4.1 获取同步状态

**端点**: `GET /api/sync/status/:taskId`

**描述**: 获取任务与飞书的同步状态

**响应**:
```typescript
{
  success: true,
  data: {
    taskId: string;
    syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
    lastSyncAt?: string;
    syncError?: string;
    feishuRecordId?: string;
    retryCount: number;
    maxRetries: number;
  }
}
```

---

### 4.2 手动触发同步

**端点**: `POST /api/sync/trigger/:taskId`

**描述**: 手动触发任务与飞书的同步

**请求体**（可选）:
```typescript
{
  force?: boolean;   // 强制同步（忽略错误）
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    taskId: string;
    syncStatus: 'SYNCING';
    message: string
  }
}
```

---

### 4.3 批量同步状态

**端点**: `GET /api/sync/batch`

**查询参数**:
```
?taskIds=xxx,yyy,zzz     // 任务ID列表（逗号分隔）
```

**响应**:
```typescript
{
  success: true,
  data: {
    results: [
      {
        taskId: string;
        syncStatus: 'SYNCED' | 'FAILED';
        error?: string;
      }
    ],
    summary: {
      total: number;
      synced: number;
      failed: number;
    }
  }
}
```

---

## 5. AI优化提示词 API

### 5.1 优化提示词

**端点**: `POST /api/optimize-prompt`

**描述**: 使用AI优化用户输入的提示词

**请求体**:
```typescript
{
  prompt: string;           // 原始提示词
  context?: {               // 可选上下文
    productName?: string;    // 商品名称
    category?: string;       // 类别
    style?: string;          // 风格偏好
  };
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    original: string;        // 原始提示词
    optimized: string;       // 优化后的提示词
    changes: string[];       // 修改说明
    timestamp: string;
    model: string;           // 使用的AI模型
  }
}
```

---

### 5.2 批量优化提示词

**端点**: `POST /api/optimize-prompt/batch`

**描述**: 批量优化多个提示词

**请求体**:
```typescript
{
  prompts: {
    [id: string]: string;    // id为提示词标识符
  };
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    results: [
      {
        id: string;
        original: string;
        optimized: string;
        success: boolean;
        error?: string;
      }
    ],
    summary: {
      total: number;
      optimized: number;
      failed: number;
    }
  }
}
```

---

## 6. 监控和状态 API

### 6.1 获取断路器状态

**端点**: `GET /api/monitoring/circuit-breaker`

**描述**: 获取飞书同步服务的断路器状态

**响应**:
```typescript
{
  success: true,
  data: {
    service: 'feishu-sync',
    state: 'closed' | 'open' | 'half_open';
    failureCount: number;
    lastFailureTime?: string;
    nextRetryTime?: string;
    timestamp: string
  }
}
```

---

### 6.2 获取活跃用户

**端点**: `GET /api/monitoring/active-users`

**查询参数**:
```
?taskId=xxx      // 可选：指定任务的活跃用户
```

**响应**:
```typescript
{
  success: true,
  data: {
    users: [
      {
        id: string;
        name: string;
        type: 'web' | 'feishu';
        currentTask: string;
        activity: string;
        lastSeen: string;
      }
    ],
    count: number
  }
}
```

---

## 7. Webhook API

### 7.1 N8N回调

**端点**: `POST /api/webhooks/n8n/callback`

**请求头**:
```
x-n8n-api-key: <api-key>
```

**请求体**:
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

**响应**:
```typescript
{
  success: true
}
```

---

## 错误码

| 错误码 | 说明 |
|-------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 版本冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

---

## 事件类型

系统通过事件总线发布以下事件，可以订阅监听：

### task.created
任务创建时触发
```typescript
{
  taskId: string;
  userId: string;
  data: {
    prompt: string;
    originalPrompt?: string;
    optimizedPrompt?: string;
    // ... 其他字段
  };
}
```

### task.completed
任务完成时触发
```typescript
{
  taskId: string;
  userId: string;
  resultImageUrls: string[];
  resultImageTokens: string[];
  duration: number;
}
```

### task.failed
任务失败时触发
```typescript
{
  taskId: string;
  userId: string;
  errorMessage: string;
}
```

### task.progress
任务进度更新时触发
```typescript
{
  taskId: string;
  userId: string;
  progress: number;
  status: string;
}
```

### task.conflict
检测到冲突时触发
```typescript
{
  taskId: string;
  conflict: ConflictInfo;
}
```

### sync.completed
同步完成时触发
```typescript
{
  taskId: string;
  syncStatus: 'SYNCED' | 'FAILED';
  error?: string;
}
```
