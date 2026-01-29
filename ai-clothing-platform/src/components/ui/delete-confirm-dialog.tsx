/**
 * Delete Confirm Dialog
 * 删除确认对话框 - 二次确认删除操作，支持选择删除范围
 */

import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTriangle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui';
import { Label } from '@/components/ui/label';

export type DeleteScope = 'both' | 'local';

interface DeleteConfirmDialogProps {
  open: boolean;
  task: {
    id: string;
    prompt?: string;
    feishuRecordId?: string;
    hasFeishuRecord: boolean;
  };
  onConfirm: (scope: DeleteScope) => void;
  onDismiss: () => void;
}

export function DeleteConfirmDialog({
  open,
  task,
  onConfirm,
  onDismiss,
}: DeleteConfirmDialogProps) {
  const [scope, setScope] = useState<DeleteScope>('both');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm(scope);
    } else {
      setConfirmed(true);
      // 3秒后自动恢复，防止误操作
      setTimeout(() => setConfirmed(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>确认删除任务？</DialogTitle>
          <DialogDescription>
            此操作无法撤销，请谨慎操作
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 任务信息 */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">任务信息</div>
            <div className="font-medium">
              {task.prompt ? (
                <span className="line-clamp-2">{task.prompt}</span>
              ) : (
                <span className="text-muted-foreground">无提示词</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              任务ID: {task.id.slice(0, 8)}...
            </div>
          </div>

          {/* 警告提示 */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {confirmed
                ? '请再次确认删除操作！'
                : '删除后无法恢复，请谨慎操作'}
            </AlertDescription>
          </Alert>

          {/* 飞书记录状态 */}
          {task.hasFeishuRecord && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                此任务已关联飞书记录
              </AlertDescription>
            </Alert>
          )}

          {/* 删除范围选择 */}
          <div className="space-y-3">
            <Label>删除范围</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as DeleteScope)}>
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="both" id="both" />
                <div className="flex-1">
                  <Label htmlFor="both" className="cursor-pointer font-medium">
                    同时删除本地和飞书记录
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.hasFeishuRecord
                      ? '将同时删除本地任务和飞书多维表格中的记录'
                      : '删除本地任务（如果存在飞书记录，也将同步删除）'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="local" id="local" />
                <div className="flex-1">
                  <Label htmlFor="local" className="cursor-pointer font-medium">
                    仅删除本地记录
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.hasFeishuRecord
                      ? '保留飞书多维表格中的记录，仅删除本地任务'
                      : '仅删除本地任务'}
                  </p>
                </div>
              </div>
            </RadioGroup>

            {scope === 'local' && task.hasFeishuRecord && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  选择"仅删除本地记录"后，飞书记录仍会保留，可能导致数据不一致
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* 确认按钮状态 */}
          {confirmed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                请再次确认：您确定要删除此任务吗？
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className={confirmed ? 'animate-pulse' : ''}
          >
            {confirmed ? '确认删除' : '删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Batch Delete Confirm Dialog
 * 批量删除确认对话框
 */
interface BatchDeleteConfirmDialogProps {
  open: boolean;
  tasks: Array<{
    id: string;
    prompt?: string;
    feishuRecordId?: string;
  }>;
  onConfirm: (scope: DeleteScope) => void;
  onDismiss: () => void;
}

export function BatchDeleteConfirmDialog({
  open,
  tasks,
  onConfirm,
  onDismiss,
}: BatchDeleteConfirmDialogProps) {
  const [scope, setScope] = useState<DeleteScope>('both');
  const [confirmed, setConfirmed] = useState(false);

  const hasFeishuRecords = tasks.some(t => t.feishuRecordId);

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm(scope);
    } else {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>确认批量删除 {tasks.length} 个任务？</DialogTitle>
          <DialogDescription>
            此操作无法撤销，请谨慎操作
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 任务列表预览 */}
          <div className="max-h-60 overflow-y-auto p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              将删除以下任务：
            </div>
            <div className="space-y-1">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="text-sm p-2 bg-background rounded">
                  {task.prompt || '无提示词'}
                  {task.feishuRecordId && (
                    <span className="ml-2 text-xs text-blue-600">
                      (已关联飞书)
                    </span>
                  )}
                </div>
              ))}
              {tasks.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  还有 {tasks.length - 5} 个任务...
                </div>
              )}
            </div>
          </div>

          {/* 警告 */}
          <Alert variant={hasFeishuRecords ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {hasFeishuRecords
                ? `其中有 ${tasks.filter(t => t.feishuRecordId).length} 个任务已关联飞书记录`
                : '请确认删除操作'}
            </AlertDescription>
          </Alert>

          {/* 删除范围选择 */}
          <div className="space-y-3">
            <Label>删除范围</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as DeleteScope)}>
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="both" id="batch-both" />
                <div className="flex-1">
                  <Label htmlFor="batch-both" className="cursor-pointer font-medium">
                    同时删除本地和飞书记录
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    删除所有本地任务和对应的飞书记录
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="local" id="batch-local" />
                <div className="flex-1">
                  <Label htmlFor="batch-local" className="cursor-pointer font-medium">
                    仅删除本地记录
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    保留所有飞书记录，仅删除本地任务
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 二次确认 */}
          {confirmed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                请再次确认：您确定要批量删除这 {tasks.length} 个任务吗？
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className={confirmed ? 'animate-pulse' : ''}
          >
            {confirmed ? '确认删除' : `删除 ${tasks.length} 个任务`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
