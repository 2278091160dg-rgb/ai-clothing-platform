# AI优化提示词功能设计 v2.0

## 核心原则：并列选择，而非强制流程

用户可以自由选择使用哪种提示词来生成图片：
- **选项A**：直接使用原始提示词（用户输入）
- **选项B**：使用AI优化后的提示词

这不是前后关系，而是并列关系。

---

## 1. 业务场景分析

### 场景1：专业用户（不需要AI优化）
```
用户：专业设计师
需求：已经有明确的提示词描述
操作：直接输入提示词 → 选择"使用原始提示词" → 生成

示例：
提示词：A red evening gown with silk material, floor-length,
        with delicate lace trim on the neckline, elegant drape

选择：☑ 使用原始提示词
      ☐ 使用AI优化提示词

结果：直接使用用户输入的提示词调用生图模型
```

### 场景2：普通用户（需要AI优化）
```
用户：普通用户
需求：只有简单描述，希望AI帮助优化
操作：输入简单描述 → 点击"AI优化" → 预览优化结果 → 选择"使用优化版" → 生成

示例：
原始：一件漂亮的裙子
优化：An elegant red silk evening gown featuring a classic A-line
        silhouette, with delicate lace trim along the neckline and a
        flowing floor-length design

选择：☐ 使用原始提示词
      ☑ 使用AI优化提示词

结果：使用优化后的提示词调用生图模型
```

### 场景3：对比用户（想看两种效果）
```
用户：对比测试用户
需求：想看原始和优化两种效果
操作：输入提示词 → AI优化 → 生成两份（原始版 + 优化版）

示例：
勾选：☑ 同时生成两种效果

结果：
- 任务1：使用原始提示词生成
- 任务2：使用优化提示词生成
```

---

## 2. 数据库设计

### 2.1 Task模型字段

```prisma
model Task {
  id                String        @id @default(uuid())

  // 提示词相关字段
  prompt            String?       // 最终使用的提示词
  originalPrompt    String?       // 用户输入的原始提示词
  optimizedPrompt   String?       // AI优化后的提示词（如果进行了优化）
  promptSource      PromptSource  @default(USER) // 最终使用的提示词来源

  // 优化相关
  promptOptimizationEnabled Boolean  @default(false) // 用户是否选择了AI优化
  promptOptimizationId    String?                        // 优化任务ID
  promptOptimizedAt       DateTime?                      // 优化时间

  // ... 其他字段
}

enum PromptSource {
  USER           // 最终使用用户原始提示词
  AI_OPTIMIZED   // 最终使用AI优化后的提示词
  FEISHU         // 飞书表格输入的提示词
}
```

### 2.2 关键区别

| 字段 | 旧设计（前后关系） | 新设计（并列关系） |
|------|------------------|------------------|
| `prompt` | 保存优化后的提示词 | 保存最终选择使用的提示词 |
| `originalPrompt` | 用户输入 | 用户输入 |
| `optimizedPrompt` | 优化结果 | 优化结果（可选） |
| `promptSource` | USER/AI/FEISHU | USER（用原始）/ AI_OPTIMIZED（用优化）/ FEISHU |
| `promptOptimizationEnabled` | 无 | 用户是否选择了AI优化（boolean） |

---

## 3. 前端设计（紧凑型，保持一屏）

### 3.1 提示词输入组件（并列选择设计）

```typescript
// src/components/PromptInputWithOptimization.tsx

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: (useOptimized: boolean) => void;
}

export function PromptInputWithOptimization({
  value,
  onChange,
  onGenerate,
}: PromptInputProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<'original' | 'optimized'>('original');

  // 处理AI优化
  const handleOptimize = async () => {
    if (!value.trim()) {
      toast.error('请先输入提示词');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(value);
      setOptimizedResult(result.optimizedPrompt);
      toast.success('提示词优化完成！');
    } catch (error) {
      toast.error('优化失败：' + error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // 处理生成
  const handleGenerate = () => {
    if (!value.trim()) {
      toast.error('请输入提示词');
      return;
    }

    const useOptimized = selectedPrompt === 'optimized' && !!optimizedResult;
    onGenerate(useOptimized);
  };

  return (
    <div className="space-y-3">
      {/* 输入区域 */}
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

        {/* 字符计数和提示 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{value.length} / 500</span>
          {value.length > 0 && value.length < 10 && (
            <span className="text-yellow-500">提示词过短</span>
          )}
          {value.length >= 10 && (
            <span className="text-green-500">✓ 提示词长度合适</span>
          )}
        </div>
      </div>

      {/* AI优化按钮行 */}
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
              <Sparkles className="h-4 w-4 mr-2" />
              AI优化提示词
            </>
          )}
        </Button>

        {optimizedResult && (
          <Button
            onClick={() => {
              setOptimizedResult(null);
              setSelectedPrompt('original');
            }}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 提示词选择区域（优化后显示） */}
      {optimizedResult && (
        <Collapsible open={true}>
          <CollapsibleContent className="space-y-2 pt-2 border-t">
            <Label className="text-sm">选择使用的提示词</Label>

            <RadioGroup
              value={selectedPrompt}
              onValueChange={(v) => setSelectedPrompt(v as 'original' | 'optimized')}
              className="space-y-2"
            >
              {/* 原始提示词选项 */}
              <div
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  selectedPrompt === 'original'
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-border hover:bg-muted"
                )}
                onClick={() => setSelectedPrompt('original')}
              >
                <RadioGroupItem value="original" id="original" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="original" className="font-medium cursor-pointer">
                      原始提示词
                    </Label>
                    <Badge variant="outline" className="text-xs">用户输入</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {value}
                  </p>
                </div>
              </div>

              {/* 优化后提示词选项 */}
              <div
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  selectedPrompt === 'optimized'
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-border hover:bg-muted"
                )}
                onClick={() => setSelectedPrompt('optimized')}
              >
                <RadioGroupItem value="optimized" id="optimized" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="optimized" className="font-medium cursor-pointer">
                      AI优化后
                    </Label>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI优化
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {optimizedResult}
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* 对比按钮 */}
            <Button
              size="sm"
              variant="link"
              className="h-8 p-0"
              onClick={() => setShowDiffModal(true)}
            >
              <GitCompareArrows className="h-4 w-4 mr-1" />
              查看详细对比
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 生成按钮 */}
      <Button
        onClick={handleGenerate}
        disabled={!value.trim()}
        size="lg"
        className="w-full"
      >
        <Wand2 className="h-5 w-5 mr-2" />
        生成服装
        {selectedPrompt === 'optimized' && optimizedResult && (
          <Badge variant="secondary" className="ml-2">
            使用AI优化版
          </Badge>
        )}
      </Button>
    </div>
  );
}
```

### 3.2 对比模态框（详细对比）

```typescript
// src/components/PromptComparisonModal.tsx

interface PromptComparisonModalProps {
  original: string;
  optimized: string;
  open: boolean;
  onClose: () => void;
  onSelect: (type: 'original' | 'optimized') => void;
}

export function PromptComparisonModal({
  original,
  optimized,
  open,
  onClose,
  onSelect,
}: PromptComparisonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>提示词对比</DialogTitle>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* 原始提示词 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">原始</Badge>
              <span className="text-sm text-muted-foreground">用户输入</span>
            </div>
            <div className="p-4 bg-muted rounded-lg min-h-[200px]">
              <p className="text-sm whitespace-pre-wrap">{original}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSelect('original')}
            >
              使用原始版本
            </Button>
          </div>

          {/* 优化后提示词 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">
                <Sparkles className="h-3 w-3 mr-1" />
                优化后
              </Badge>
              <span className="text-sm text-muted-foreground">AI优化</span>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg min-h-[200px]">
              <p className="text-sm whitespace-pre-wrap">{optimized}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => onSelect('optimized')}
            >
              使用优化版本
            </Button>
          </div>
        </div>

        {/* 差异高亮 */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <p className="text-sm font-medium mb-2">💡 优化说明</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 添加了材质描述（silk丝绸）</li>
            <li>• 添加了版型描述（A-line剪裁）</li>
            <li>• 添加了长度信息（floor-length及地长）</li>
            <li>• 添加了装饰细节（lace trim蕾丝边）</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.3 紧凑型布局（保持一屏）

```typescript
// src/app/page.tsx - 完整左侧栏布局

export function Sidebar() {
  const [prompt, setPrompt] = useState('');
  const [useOptimized, setUseOptimized] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <aside className="w-80 h-screen overflow-y-auto border-r p-4 flex flex-col">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5" />
        <h1 className="font-semibold">AI服装生成</h1>
      </div>

      {/* 主要内容区 */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* 图片上传 */}
        <div className="space-y-2">
          <Label>上传商品图片</Label>
          <ImageUploader />
        </div>

        {/* 提示词输入（带AI优化） */}
        <PromptInputWithOptimization
          value={prompt}
          onChange={setPrompt}
          onGenerate={(optimized) => {
            setUseOptimized(optimized);
            handleCreateTask(prompt, optimized);
          }}
        />

        {/* 分隔线 */}
        <Separator />

        {/* 高级选项（可折叠） */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>高级选项</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                advancedOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-3">
            <AdvancedOptions />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 底部状态 */}
      <div className="pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>提示词来源：</span>
          <Badge variant={useOptimized ? "default" : "secondary"}>
            {useOptimized ? "AI优化版" : "原始版"}
          </Badge>
        </div>
      </div>
    </aside>
  );
}
```

---

## 4. 飞书表格设计（并列选择）

### 4.1 字段配置

| 字段名 | 类型 | 说明 | 是否可编辑 |
|--------|------|------|-----------|
| 提示词 | 文本 | 用户输入的提示词 | 可编辑 |
| AI优化按钮 | 按钮 | 点击调用AI优化 | 可点击 |
| 优化后提示词 | 文本 | AI优化的结果 | 只读 |
| 使用哪个版本 | 单选 | 原始/优化后 | 可选择 |
| 最终提示词 | 公式 | 根据选择自动计算 | 只读 |

### 4.2 飞书表格界面

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         飞书多维表格                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  提示词      │ AI优化 │ 优化后提示词 │ 使用版本 │ 最终提示 │ 状态 │
├─────────────────────────────────────────────────────────────────────────┤
│ 一件漂亮的   │[✨优化]│ An elegant   │ ⦿ 原始  │ 一件漂亮 │ 待处 │
│ 裙子        │        │ red silk... │ ◉ 优化后│ 的裙子   │ 理   │
├─────────────────────────────────────────────────────────────────────────┤
│ 商务西装，   │[✨优化]│ A profession │ ◉ 原始  │ 商务西装 │ 处理 │
│ 黑色，修身  │        │ al business  │ ⦿ 优化后│ ，黑色， │ 中   │
│             │        │ suit...      │          │ 修身     │      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 飞书自动化配置

```javascript
// 点击"AI优化"按钮
{
  "trigger": {
    "type": "button_click",
    "field": "AI优化按钮"
  },
  "actions": [
    {
      "type": "api_call",
      "method": "POST",
      "url": "/api/feishu/optimize-prompt",
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
      "type": "notification",
      "message": "提示词已优化，请在"使用版本"字段选择使用哪个版本"
    }
  ]
}

// "使用版本"字段变更时
{
  "trigger": {
    "type": "field_update",
    "field": "使用版本"
  },
  "actions": [
    {
      "type": "conditional",
      "condition": {
        "field": "使用版本",
        "operator": "equals",
        "value": "原始"
      },
      "then": [
        {
          "type": "update_record",
          "field": "最终提示词",
          "value": "{{提示词}}"
        }
      ],
      "else": [
        {
          "type": "update_record",
          "field": "最终提示词",
          "value": "{{优化后提示词}}"
        }
      ]
    }
  ]
}
```

### 4.4 飞书公式字段

```javascript
// "最终提示词"字段的公式
IF(
  {使用版本} = "优化后",
  {优化后提示词},
  {提示词}
)
```

---

## 5. 后端处理逻辑

### 5.1 任务创建服务

```typescript
// src/lib/services/task-creation.service.ts

export class TaskCreationService {
  async createTask(params: {
    prompt: string;              // 用户输入
    optimizedPrompt?: string;     // AI优化结果（可选）
    useOptimized: boolean;        // 用户选择使用哪个
    // ... 其他参数
  }) {
    // 确定最终使用的提示词
    const finalPrompt = params.useOptimized && params.optimizedPrompt
      ? params.optimizedPrompt
      : params.prompt;

    // 确定提示词来源
    const promptSource = params.useOptimized && params.optimizedPrompt
      ? 'AI_OPTIMIZED'
      : 'USER';

    // 创建任务
    const task = await taskRepo.create({
      prompt: finalPrompt,           // 最终使用的提示词
      originalPrompt: params.prompt,  // 用户输入
      optimizedPrompt: params.optimizedPrompt, // AI优化结果（如果有）
      promptSource: promptSource,     // 来源标识
      promptOptimizationEnabled: params.optimizedPrompt ? true : false,
      // ... 其他字段
    });

    // 触发N8N工作流（使用最终提示词）
    await n8nService.triggerGeneration({
      taskId: task.id,
      prompt: finalPrompt,
      originalPrompt: params.prompt,
      optimizedPrompt: params.optimizedPrompt,
      promptSource,
      // ... 其他参数
    });

    return task;
  }
}
```

### 5.2 API端点

```typescript
// POST /api/tasks

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    prompt,              // 必填：用户输入
    optimizedPrompt,     // 可选：AI优化后的提示词
    useOptimized,        // 必填：是否使用优化版
    // ... 其他参数
  } = body;

  // 创建任务
  const task = await taskCreationService.createTask({
    prompt,
    optimizedPrompt,
    useOptimized: useOptimized || false,
    // ...
  });

  return NextResponse.json({ success: true, task });
}
```

---

## 6. 用户体验流程

### Web端流程

```
┌─────────────────────────────────────────────────────────────┐
│                    Web前端操作流程                          │
└─────────────────────────────────────────────────────────────┘

场景A：不使用AI优化
┌─────────────────────────────────────────────────────────────┐
│ 1. 输入提示词："一件漂亮的裙子"                              │
│ 2. 跳过"AI优化"按钮                                          │
│ 3. 选择：⦿ 原始提示词  ◉ AI优化后                           │
│ 4. 点击"生成服装"                                            │
│ 5. 使用原始提示词："一件漂亮的裙子"                          │
└─────────────────────────────────────────────────────────────┘

场景B：使用AI优化
┌─────────────────────────────────────────────────────────────┐
│ 1. 输入提示词："一件漂亮的裙子"                              │
│ 2. 点击"AI优化提示词" → 显示优化结果                         │
│ 3. 选择：◉ 原始提示词  ⦿ AI优化后                           │
│ 4. 点击"生成服装"                                            │
│ 5. 使用优化后提示词："An elegant red silk evening gown..."   │
└─────────────────────────────────────────────────────────────┘
```

### 飞书端流程

```
┌─────────────────────────────────────────────────────────────┐
│                    飞书表格操作流程                          │
└─────────────────────────────────────────────────────────────┘

场景A：不使用AI优化
┌─────────────────────────────────────────────────────────────┐
│ 1. 在"提示词"字段输入："一件漂亮的裙子"                     │
│ 2. 不点击"AI优化"按钮                                        │
│ 3. 在"使用版本"字段选择："原始"                              │
│ 4. "最终提示词"字段自动显示："一件漂亮的裙子"                │
│ 5. 触发生成工作流 → 使用原始提示词                           │
└─────────────────────────────────────────────────────────────┘

场景B：使用AI优化
┌─────────────────────────────────────────────────────────────┐
│ 1. 在"提示词"字段输入："一件漂亮的裙子"                     │
│ 2. 点击"AI优化"按钮 → "优化后提示词"字段自动填充             │
│ 3. 在"使用版本"字段选择："优化后"                            │
│ 4. "最终提示词"字段自动显示：优化后的内容                    │
│ 5. 触发生成工作流 → 使用优化后的提示词                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 关键代码文件清单

| 文件 | 说明 |
|------|------|
| [src/components/PromptInputWithOptimization.tsx](src/components/PromptInputWithOptimization.tsx) | 提示词输入组件（并列选择） |
| [src/components/PromptComparisonModal.tsx](src/components/PromptComparisonModal.tsx) | 对比模态框 |
| [src/lib/services/task-creation.service.ts](src/lib/services/task-creation.service.ts) | 任务创建服务 |
| [prisma/schema.prisma](prisma/schema.prisma) | 数据库模型 |
| [docs/AI优化提示词功能设计_v2.md](docs/AI优化提示词功能设计_v2.md) | 本文档 |

---

## 总结

### 核心改变

| 方面 | 旧设计（前后关系） | 新设计（并列关系） |
|------|------------------|------------------|
| 业务逻辑 | 必须先优化再生成 | 可选择是否优化 |
| 用户选择 | 被动接受优化结果 | 主动选择使用哪个版本 |
| 飞书体验 | 强制优化流程 | 可选优化，保持原有工作流 |
| 提示词字段 | 保存优化后的 | 保存最终选择使用的 |

### 用户体验

- ✅ 专业用户：直接使用原始提示词，无需额外操作
- ✅ 普通用户：可选择AI优化，查看对比后决定
- ✅ 飞书用户：保持原有工作流，AI优化作为可选增强
- ✅ 所有用户：自由选择，不被强制流程束缚
