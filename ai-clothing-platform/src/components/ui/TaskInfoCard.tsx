/**
 * TaskInfoCard - 任务信息卡片组件
 */

interface TaskInfoCardProps {
  prompt?: string;
  taskId: string;
}

export function TaskInfoCard({ prompt, taskId }: TaskInfoCardProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="text-sm text-muted-foreground mb-1">任务信息</div>
      <div className="font-medium">
        {prompt ? (
          <span className="line-clamp-2">{prompt}</span>
        ) : (
          <span className="text-muted-foreground">无提示词</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        任务ID: {taskId.slice(0, 8)}...
      </div>
    </div>
  );
}
