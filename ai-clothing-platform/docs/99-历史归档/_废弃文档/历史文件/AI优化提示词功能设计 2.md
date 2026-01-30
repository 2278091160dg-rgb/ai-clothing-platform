# AI优化提示词功能设计

## 需求概述

用户输入自然语言提示词后，可以点击"AI优化提示词"按钮，调用GEMINI文本模型对提示词进行优化，然后使用优化后的提示词调用生图模型。

---

## 1. 数据库设计

### 1.1 新增字段

```prisma
model Task {
  id                String        @id @default(uuid())

  // 现有字段
  prompt            String?

  // 新增提示词相关字段
  originalPrompt    String?       // 用户输入的原始提示词
  optimizedPrompt   String?       // AI优化后的提示词
  promptSource      PromptSource  @default(USER)
  promptOptimizedAt DateTime?     // 提示词优化时间
  promptOptimizationId String?    // 优化任务ID（用于追溯）

  // 提示词优化历史（可选，用于版本管理）
  promptHistory     Json?         // 保存提示词修改历史
}

enum PromptSource {
  USER           // 用户直接输入
  AI_OPTIMIZED   // AI优化后
  FEISHU         // 飞书表格输入
  MERGED         // 合并后的提示词
}
```

---

## 2. 前端设计

### 2.1 紧凑型UI布局（保持左侧栏一屏）

```typescript
// src/components/PromptOptimizer.tsx

interface PromptOptimizerProps {
  value: string;
  onChange: (value: string) => void;
  onOptimized: (optimized: string) => void;
}

export function PromptOptimizer({ value, onChange, onOptimized }: PromptOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [optimizedValue, setOptimizedValue] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!value.trim()) {
      toast.error('请先输入提示词');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(value);
      setOptimizedValue(result.optimizedPrompt);
      setShowDiff(true);
    } catch (error) {
      toast.error('优化失败：' + error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimized = () => {
    if (optimizedValue) {
      onOptimized(optimizedValue);
      setShowDiff(false);
      toast.success('已应用优化后的提示词');
    }
  };

  const handleDiscard = () => {
    setOptimizedValue(null);
    setShowDiff(false);
  };

  return (
    <div className="space-y-3">
      {/* 输入区域 - 紧凑设计 */}
      <div className="space-y-2">
        <Label htmlFor="prompt">提示词</Label>
        <Textarea
          id="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="描述你想要生成的服装效果..."
          className="min-h-[80px] resize-none"
          rows={3}
        />

        {/* 字符计数和状态 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{value.length} / 500</span>
          {value.length > 0 && value.length < 10 && (
            <span className="text-yellow-500">提示词过短</span>
          )}
        </div>
      </div>

      {/* 操作按钮行 - 紧凑排列 */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleOptimize}
          disabled={!value.trim() || isOptimizing}
          size="sm"
          variant="secondary"
          className="flex-1"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              优化中...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              AI优化提示词
            </>
          )}
        </Button>

        {value && (
          <Button
            onClick={() => onChange('')}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 优化结果预览 - 折叠式显示 */}
      {showDiff && optimizedValue && (
        <Collapsible open={showDiff} onOpenChange={setShowDiff}>
          <CollapsibleContent className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm">优化结果</Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleApplyOptimized}
                  size="sm"
                  className="h-7"
                >
                  <Check className="h-3 w-3 mr-1" />
                  应用
                </Button>
                <Button
                  onClick={handleDiscard}
                  size="sm"
                  variant="ghost"
                  className="h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  放弃
                </Button>
              </div>
            </div>

            {/* 对比显示 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted rounded">
                <div className="font-medium text-muted-foreground mb-1">原文</div>
                <div className="line-clamp-4">{value}</div>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                <div className="font-medium text-green-700 dark:text-green-400 mb-1">优化后</div>
                <div className="line-clamp-4">{optimizedValue}</div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
```

### 2.2 可折叠的高级选项

```typescript
// src/components/AdvancedOptions.tsx

export function AdvancedOptions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <span>高级选项</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pt-3">
        {/* AI模型选择 */}
        <div className="space-y-1">
          <Label>AI模型</Label>
          <Select defaultValue="FLUX.1">
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FLUX.1">FLUX.1</SelectItem>
              <SelectItem value="Gemini-3-Pro-Image">Gemini 3 Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 尺寸比例 */}
        <div className="space-y-1">
          <Label>尺寸比例</Label>
          <div className="grid grid-cols-4 gap-1">
            {['1:1', '3:4', '4:3', '16:9'].map(ratio => (
              <Button
                key={ratio}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                {ratio}
              </Button>
            ))}
          </div>
        </div>

        {/* 生成张数 */}
        <div className="space-y-1">
          <Label>生成张数</Label>
          <Slider
            min={1}
            max={4}
            step={1}
            defaultValue={[4]}
            className="flex-1"
          />
        </div>

        {/* 清晰度 */}
        <div className="space-y-1">
          <Label>清晰度</Label>
          <div className="flex gap-1">
            {['standard', 'high', 'ultra'].map(quality => (
              <Button
                key={quality}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs capitalize"
              >
                {quality}
              </Button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### 2.3 左侧栏完整布局

```typescript
// src/app/page.tsx - 左侧栏布局

export function Sidebar() {
  return (
    <aside className="w-80 h-screen overflow-y-auto border-r p-4 space-y-4">
      {/* 标题 - 紧凑 */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h1 className="font-semibold">AI服装生成</h1>
      </div>

      {/* 图片上传区 - 紧凑 */}
      <div className="space-y-2">
        <Label>上传商品图片</Label>
        <ImageUploader />
      </div>

      {/* 提示词优化器 - 紧凑 */}
      <PromptOptimizer />

      {/* 分隔线 */}
      <Separator />

      {/* 高级选项 - 可折叠 */}
      <AdvancedOptions />

      {/* 生成按钮 - 固定在底部 */}
      <div className="sticky bottom-0 pt-4 bg-background">
        <Button size="lg" className="w-full">
          <Wand2 className="h-5 w-5 mr-2" />
          生成服装
        </Button>
      </div>
    </aside>
  );
}
```

---

## 3. 后端实现

### 3.1 提示词优化API

```typescript
// src/app/api/optimize-prompt/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getGenerativeModel } from '@ai-sdk/google';

/**
 * POST /api/optimize-prompt
 * 调用GEMINI文本模型优化提示词
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    // 调用GEMINI文本模型
    const model = getGenerativeModel({
      model: 'gemini-2.5-pro',
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const optimizationPrompt = `
你是一个专业的AI服装设计提示词优化专家。请根据以下要求优化用户的提示词：

用户提示词：${prompt}

优化要求：
1. 保持用户的核心意图
2. 添加细节描述（材质、风格、光影、构图等）
3. 使用专业的服装设计术语
4. 优化后的提示词应该更具体、更有表现力
5. 控制在100字以内

请只返回优化后的提示词，不要解释。
`;

    const result = await model.generate(optimizationPrompt);
    const optimizedPrompt = result.text.trim();

    return NextResponse.json({
      original: prompt,
      optimized: optimizedPrompt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('提示词优化失败:', error);
    return NextResponse.json({ error: '优化失败', message: error.message }, { status: 500 });
  }
}
```

### 3.2 优化历史保存

```typescript
// src/lib/services/prompt-optimization.service.ts

export class PromptOptimizationService {
  /**
   * 保存优化历史
   */
  async saveOptimizationHistory(params: {
    taskId: string;
    originalPrompt: string;
    optimizedPrompt: string;
    model: string;
  }): Promise<void> {
    const { prisma } = await import('@/lib/prisma');

    // 保存到任务记录
    await prisma.task.update({
      where: { id: params.taskId },
      data: {
        originalPrompt: params.originalPrompt,
        optimizedPrompt: params.optimizedPrompt,
        promptSource: 'AI_OPTIMIZED',
        promptOptimizedAt: new Date(),
        promptOptimizationId: `${params.taskId}_${Date.now()}`,
      },
    });

    // 保存到历史记录表（可选）
    await prisma.promptOptimizationHistory.create({
      data: {
        taskId: params.taskId,
        originalPrompt: params.originalPrompt,
        optimizedPrompt: params.optimizedPrompt,
        model: params.model,
        timestamp: new Date(),
      },
    });
  }

  /**
   * 获取优化历史
   */
  async getOptimizationHistory(taskId: string) {
    const { prisma } = await import('@/lib/prisma');

    return await prisma.promptOptimizationHistory.findMany({
      where: { taskId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
  }
}
```

---

## 4. 飞书表格设计

### 4.1 新增字段

| 字段名       | 类型 | 说明                 | 是否可编辑 | 默认值 |
| ------------ | ---- | -------------------- | ---------- | ------ |
| 提示词       | 文本 | 当前使用的提示词     | 可编辑     | -      |
| 原始提示词   | 文本 | 用户输入的原始提示词 | 可编辑     | -      |
| 优化后提示词 | 文本 | AI优化后的提示词     | 只读       | -      |
| 提示词来源   | 单选 | 用户/AI优化/飞书     | 只读       | 用户   |
| AI优化按钮   | 按钮 | 点击调用AI优化       | 可点击     | -      |

### 4.2 飞书自动化配置

```javascript
// 飞书表格自动化 - AI优化按钮

{
  "trigger": {
    "type": "button_click",
    "field": "AI优化按钮"
  },
  "actions": [
    {
      "type": "api_call",
      "method": "POST",
      "url": "https://your-app.com/api/feishu/optimize-prompt",
      "body": {
        "record_id": "{{record_id}}",
        "prompt": "{{提示词}}"
      }
    },
    {
      "type": "update_record",
      "field": "优化后提示词",
      "value": "{{response.optimized}}"
    },
    {
      "type": "update_record",
      "field": "提示词来源",
      "value": "AI优化"
    }
  ]
}
```

### 4.3 飞书表格字段联动

```javascript
// 飞书表格字段联动规则

// 场景1：用户编辑"提示词"字段
{
  "trigger": {
    "type": "field_update",
    "field": "提示词"
  },
  "actions": [
    {
      "type": "conditional",
      "condition": {
        "field": "提示词来源",
        "operator": "equals",
        "value": "AI优化"
      },
      "then": [
        {
          "type": "update_record",
          "field": "提示词来源",
          "value": "用户"
        },
        {
          "type": "update_record",
          "field": "原始提示词",
          "value": "{{提示词}}"
        }
      ]
    }
  ]
}

// 场景2：AI优化完成后
{
  "trigger": {
    "type": "field_update",
    "field": "优化后提示词"
  },
  "actions": [
    {
      "type": "update_record",
      "field": "提示词",
      "value": "{{优化后提示词}}"
    },
    {
      "type": "notification",
      "message": "提示词已优化，已自动应用到提示词字段"
    }
  ]
}
```

---

## 5. N8N工作流适配

### 5.1 工作流输入调整

```json
{
  "taskId": "xxx",
  "userId": "xxx",
  "productImageUrl": "...",
  "prompt": "使用优化后的提示词", // 使用 optimizedPrompt 而不是 originalPrompt
  "aiModel": "FLUX.1",
  "originalPrompt": "原始提示词（仅用于日志）",
  "promptSource": "AI_OPTIMIZED"
}
```

### 5.2 N8N节点配置

```javascript
// N8N工作流 - 提示词处理节点

// 节点1：确定使用哪个提示词
{
  "name": "Determine Prompt",
  "type": "code",
  "code": `
    // 使用优先级：优化后 > 原始
    const prompt = $json.optimizedPrompt || $json.originalPrompt || $json.prompt;

    return {
      json: {
        ...$json,
        finalPrompt: prompt,
        promptUsed: $json.optimizedPrompt ? 'optimized' : 'original'
      }
    };
  `
}

// 节点2：调用生图API
{
  "name": "Generate Image",
  "type": "httpRequest",
  "parameters": {
    "url": "https://api.example.com/generate",
    "method": "POST",
    "body": {
      "prompt": "={{$json.finalPrompt}}",
      "model": "={{$json.aiModel}}"
    }
  }
}
```

---

## 6. 业务逻辑设计

### 6.1 Web端流程

```
用户输入提示词
    ↓
[可选] 点击"AI优化"
    ↓
调用GEMINI文本模型
    ↓
显示优化结果（对比）
    ↓
用户选择：应用/放弃
    ↓
    ├─ 应用 → 使用 optimizedPrompt
    └─ 放弃 → 使用 originalPrompt
    ↓
点击"生成"
    ↓
创建任务（保存 originalPrompt 和 optimizedPrompt）
    ↓
触发N8N工作流（使用选中的提示词）
```

### 6.2 飞书端流程

```
用户在"提示词"字段输入
    ↓
[可选] 点击"AI优化按钮"
    ↓
触发飞书自动化
    ↓
调用优化API
    ↓
更新"优化后提示词"字段
    ↓
自动更新"提示词"字段为优化后的值
    ↓
触发N8N工作流
```

### 6.3 统一处理逻辑

```typescript
// src/lib/services/task-creation.service.ts

export class TaskCreationService {
  async createTask(params: CreateTaskParams) {
    // 确定最终使用的提示词
    const finalPrompt = this.determineFinalPrompt(params);

    // 创建任务
    const task = await taskRepo.create({
      ...params,
      originalPrompt: params.originalPrompt || params.prompt,
      optimizedPrompt: params.optimizedPrompt,
      prompt: finalPrompt,
      promptSource: params.optimizedPrompt ? 'AI_OPTIMIZED' : 'USER',
    });

    // 触发N8N工作流
    await n8nService.triggerGeneration({
      ...params,
      prompt: finalPrompt, // 使用最终的提示词
      originalPrompt: params.originalPrompt || params.prompt,
    });

    return task;
  }

  private determineFinalPrompt(params: CreateTaskParams): string {
    // 优先级：优化后 > 用户最新输入 > 原始
    if (params.optimizedPrompt && params.useOptimized) {
      return params.optimizedPrompt;
    }
    return params.prompt || params.originalPrompt;
  }
}
```

---

## 7. 前端优化：一键生成模式

```typescript
// src/components/QuickGenerate.tsx

export function QuickGenerate() {
  const [autoOptimize, setAutoOptimize] = useState(true);

  const handleGenerate = async () => {
    if (autoOptimize && prompt) {
      // 自动优化 + 生成
      const optimized = await optimizePrompt(prompt);
      await createTask({
        prompt,
        optimizedPrompt: optimized,
        useOptimized: true,
      });
    } else {
      // 直接生成
      await createTask({ prompt });
    }
  };

  return (
    <div className="space-y-3">
      <PromptOptimizer />

      {/* 快速选项 */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="auto-optimize"
          checked={autoOptimize}
          onCheckedChange={setAutoOptimize}
        />
        <Label htmlFor="auto-optimize" className="text-sm">
          自动优化提示词后再生成
        </Label>
      </div>

      <Button onClick={handleGenerate} className="w-full" size="lg">
        {autoOptimize ? (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            AI优化并生成
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5 mr-2" />
            直接生成
          </>
        )}
      </Button>
    </div>
  );
}
```

---

## 8. 飞书表格用户体验设计

### 8.1 智能提示

在飞书表格的"提示词"字段添加动态提示：

```
当用户开始输入提示词时：
┌─────────────────────────────────────────┐
│ 💡 提示：                               │
│ - 描述服装的风格（如：休闲、正式）       │
│ - 提供材质信息（如：棉质、丝绸）         │
│ - 添加场景描述（如：办公室、海滩）       │
│                                         │
│ [点击使用AI优化]                         │
└─────────────────────────────────────────┘
```

### 8.2 一键优化按钮

在飞书表格中添加"AI优化"按钮：

```
┌────────────────────────────────────────────────────┐
│ 提示词          │ AI优化    │ 优化后提示词          │
├─────────────────┼───────────┼──────────────────────┤
│ 一件漂亮的裙子   │ [✨优化]  │ 一件优雅的红色丝绸晚  │
│                 │          │ 礼裙，采用A字版型，   │
│                 │          │ 配以精致的蕾丝装饰...  │
└─────────────────┴───────────┴──────────────────────┘
```

---

## 9. 实施步骤

### 阶段1：数据库和API（第1周）

- [ ] 添加数据库字段
- [ ] 实现优化API
- [ ] 更新任务创建逻辑

### 阶段2：前端UI（第1周）

- [ ] 实现PromptOptimizer组件
- [ ] 添加对比显示
- [ ] 优化左侧栏布局

### 阶段3：飞书集成（第2周）

- [ ] 添加飞书表格字段
- [ ] 配置自动化规则
- [ ] 测试双向同步

### 阶段4：N8N适配（第2周）

- [ ] 更新工作流输入
- [ ] 添加提示词选择逻辑
- [ ] 测试完整流程

---

## 10. 关键代码文件清单

| 文件                                                                                               | 说明           |
| -------------------------------------------------------------------------------------------------- | -------------- |
| [src/components/PromptOptimizer.tsx](src/components/PromptOptimizer.tsx)                           | 提示词优化组件 |
| [src/app/api/optimize-prompt/route.ts](src/app/api/optimize-prompt/route.ts)                       | 优化API        |
| [src/lib/services/prompt-optimization.service.ts](src/lib/services/prompt-optimization.service.ts) | 优化服务       |
| [prisma/schema.prisma](prisma/schema.prisma)                                                       | 数据库模型     |

---

## 总结

**AI优化提示词功能**实现了：

1. **前端**：紧凑型UI，保持左侧栏一屏显示
2. **后端**：调用GEMINI文本模型优化
3. **数据库**：保存原始和优化后的提示词
4. **飞书**：新增字段支持AI优化
5. **业务逻辑**：统一处理，优化后的提示词优先

**用户体验**：

- Web用户：可预览对比，选择是否应用
- 飞书用户：一键优化，自动应用
- 最终都使用优化后的提示词调用生图模型
