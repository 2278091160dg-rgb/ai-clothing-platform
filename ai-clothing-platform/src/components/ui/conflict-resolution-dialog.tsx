/**
 * Conflict Resolution Dialog
 * 冲突解决对话框 - 当检测到数据冲突时显示
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertTriangle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
} from '@/components/ui';

interface ConflictInfo {
  taskId: string;
  conflicts: string[];
  localVersion: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  remoteChanges?: Record<string, any>;
}

interface ConflictResolutionDialogProps {
  open: boolean;
  conflict: ConflictInfo;
  onResolve: (strategy: 'use_local' | 'use_remote' | 'merge') => void;
  onDismiss: () => void;
}

export function ConflictResolutionDialog({
  open,
  conflict,
  onResolve,
  onDismiss,
}: ConflictResolutionDialogProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<'use_local' | 'use_remote' | 'merge'>(
    'use_local'
  );

  const formatModifierLabel = (modifier: string) => {
    if (modifier === 'web') return '🌐 Web前端用户';
    if (modifier === 'feishu') return '📊 飞书表格用户';
    if (modifier === 'api') return '🤖 系统自动';
    return modifier;
  };

  const formatFieldName = (fieldName: string) => {
    const fieldNames: Record<string, string> = {
      prompt: '提示词',
      status: '状态',
      progress: '进度',
      originalPrompt: '原始提示词',
      optimizedPrompt: '优化后提示词',
    };
    return fieldNames[fieldName] || fieldName;
  };

  const handleResolve = () => {
    onResolve(selectedStrategy);
  };

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>⚠️ 检测到数据冲突</DialogTitle>
          <DialogDescription>其他用户也在修改此任务，请选择处理方式</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 冲突警告 */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>版本冲突</AlertTitle>
            <AlertDescription className="space-y-1">
              <div>
                <strong>最后修改者：</strong>
                {formatModifierLabel(conflict.lastModifiedBy)}
              </div>
              <div>
                <strong>修改时间：</strong>
                {new Date(conflict.lastModifiedAt).toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div>
                <strong>冲突字段：</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {conflict.conflicts.map(field => (
                    <Badge key={field} variant="outline">
                      {formatFieldName(field)}
                    </Badge>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* 冲突字段对比 */}
          {conflict.remoteChanges && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">字段对比</h4>

              {Object.entries(conflict.remoteChanges).map(([field, remoteValue]) => (
                <div key={field} className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      您的版本 (v{conflict.localVersion})
                    </div>
                    <div className="text-sm font-mono line-clamp-3">
                      {/* 这里应该显示本地值，需要传入 */}
                      <span className="text-muted-foreground">本地值...</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200">
                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-1">对方版本</div>
                    <div className="text-sm font-mono line-clamp-3">
                      {typeof remoteValue === 'string'
                        ? remoteValue
                        : JSON.stringify(remoteValue, null, 2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 解决方案选择 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">选择解决方案</h4>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedStrategy('use_local')}
                className={cn(
                  'w-full p-4 text-left rounded-lg border-2 transition-all',
                  'hover:bg-accent',
                  selectedStrategy === 'use_local' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">保留我的修改</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      使用您的修改覆盖对方的修改
                    </div>
                  </div>
                  {selectedStrategy === 'use_local' && (
                    <div className="h-5 w-5 rounded-full bg-primary border-2 border-primary-foreground flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedStrategy('use_remote')}
                className={cn(
                  'w-full p-4 text-left rounded-lg border-2 transition-all',
                  'hover:bg-accent',
                  selectedStrategy === 'use_remote'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">使用对方的修改</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      使用对方的修改覆盖您的修改
                    </div>
                  </div>
                  {selectedStrategy === 'use_remote' && (
                    <div className="h-5 w-5 rounded-full bg-primary border-2 border-primary-foreground flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedStrategy('merge')}
                className={cn(
                  'w-full p-4 text-left rounded-lg border-2 transition-all',
                  'hover:bg-accent',
                  selectedStrategy === 'merge' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">手动合并</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      查看详情后手动选择每个字段的值
                    </div>
                  </div>
                  {selectedStrategy === 'merge' && (
                    <div className="h-5 w-5 rounded-full bg-primary border-2 border-primary-foreground flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            取消
          </Button>
          <Button onClick={handleResolve}>确认解决</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
