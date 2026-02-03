/**
 * DeleteWarning - 删除警告组件
 */

import { Alert, AlertDescription, AlertTriangle } from '@/components/ui/alert';

interface DeleteWarningProps {
  confirmed?: boolean;
  hasFeishuRecord?: boolean;
  taskCount?: number;
}

export function DeleteWarning({ confirmed, hasFeishuRecord, taskCount }: DeleteWarningProps) {
  if (confirmed) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {taskCount
            ? `请再次确认：您确定要批量删除这 ${taskCount} 个任务吗？`
            : '请再次确认：您确定要删除此任务吗？'}
        </AlertDescription>
      </Alert>
    );
  }

  if (hasFeishuRecord) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>此任务已关联飞书记录</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>删除后无法恢复，请谨慎操作</AlertDescription>
    </Alert>
  );
}
