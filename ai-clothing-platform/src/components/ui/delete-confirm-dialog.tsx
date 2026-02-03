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
} from '@/components/ui';
import type { DeleteScope } from './DeleteScopeSelector';
import { DeleteScopeSelector } from './DeleteScopeSelector';
import { TaskInfoCard } from './TaskInfoCard';
import { DeleteWarning } from './DeleteWarning';

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
      setTimeout(() => setConfirmed(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>确认删除任务？</DialogTitle>
          <DialogDescription>此操作无法撤销，请谨慎操作</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <TaskInfoCard prompt={task.prompt} taskId={task.id} />

          <DeleteWarning confirmed={confirmed} hasFeishuRecord={task.hasFeishuRecord} />

          <DeleteScopeSelector
            value={scope}
            onChange={setScope}
            hasFeishuRecord={task.hasFeishuRecord}
            showLocalWarning={scope === 'local'}
          />

          {confirmed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>请再次确认：您确定要删除此任务吗？</AlertDescription>
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
          <DialogDescription>此操作无法撤销，请谨慎操作</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">将删除以下任务：</div>
            <div className="space-y-1">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="text-sm p-2 bg-background rounded">
                  {task.prompt || '无提示词'}
                  {task.feishuRecordId && (
                    <span className="ml-2 text-xs text-blue-600">(已关联飞书)</span>
                  )}
                </div>
              ))}
              {tasks.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  还有 {tasks.length - 5 } 个任务...
                </div>
              )}
            </div>
          </div>

          <Alert variant={hasFeishuRecords ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {hasFeishuRecords
                ? `其中有 ${tasks.filter(t => t.feishuRecordId).length} 个任务已关联飞书记录`
                : '请确认删除操作'}
            </AlertDescription>
          </Alert>

          <DeleteScopeSelector value={scope} onChange={setScope} />

          <DeleteWarning confirmed={confirmed} taskCount={tasks.length} />
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
