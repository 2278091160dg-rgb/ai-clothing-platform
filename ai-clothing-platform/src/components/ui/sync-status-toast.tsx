/**
 * Sync Status Toast
 * 同步状态提示组件 - 显示飞书同步状态
 */

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertCircle, AlertTriangle, CheckCircle, Loader2 } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

interface SyncState {
  status: SyncStatus;
  error?: string;
  feishuRecordId?: string;
}

interface SyncStatusToastProps {
  syncState: SyncState;
  onRetry?: () => void;
}

/**
 * Hook to display sync status toast notifications
 */
export function useSyncStatusToast() {
  const { toast } = useToast();

  const showSyncStatus = (syncState: SyncState & { onRetry?: () => void }) => {
    switch (syncState.status) {
      case 'syncing':
        toast({
          title: '正在同步到飞书...',
          description: '请稍候，正在创建飞书记录',
          duration: Infinity,
        });
        break;

      case 'synced':
        toast({
          title: '✅ 已同步到飞书',
          description: syncState.feishuRecordId ? `飞书记录已创建` : '数据已同步到飞书多维表格',
          duration: 3000,
        });
        break;

      case 'failed':
        toast({
          title: '⚠️ 飞书同步失败',
          description: syncState.error || '请稍后重试',
          variant: 'destructive',
          duration: 5000,
          action: syncState.onRetry ? (
            <Button
              size="sm"
              variant="outline"
              onClick={syncState.onRetry}
              className="bg-background hover:bg-accent"
            >
              重试
            </Button>
          ) : undefined,
        });
        break;

      default:
        break;
    }
  };

  return { showSyncStatus };
}

/**
 * Inline sync status alert component
 */
export function SyncStatusAlert({ syncState, onRetry }: SyncStatusToastProps) {
  const getSyncIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSyncTitle = () => {
    switch (syncState.status) {
      case 'pending':
        return '等待同步到飞书';
      case 'syncing':
        return '正在同步到飞书...';
      case 'synced':
        return '已同步到飞书';
      case 'failed':
        return '飞书同步失败';
    }
  };

  const getSyncDescription = () => {
    switch (syncState.status) {
      case 'pending':
        return '任务创建后，将自动同步到飞书多维表格';
      case 'syncing':
        return '正在创建飞书记录，请稍候...';
      case 'synced':
        return syncState.feishuRecordId
          ? `飞书记录ID: ${syncState.feishuRecordId.slice(0, 8)}...`
          : '数据已同步到飞书多维表格';
      case 'failed':
        return syncState.error || '未知错误，请稍后重试';
    }
  };

  const getAlertVariant = (): 'default' | 'destructive' | 'warning' => {
    switch (syncState.status) {
      case 'syncing':
        return 'default';
      case 'synced':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="relative">
      {syncState.status === 'syncing' && (
        <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
      )}

      <div className="flex items-start gap-3 relative">
        <div className="mt-0.5">{getSyncIcon()}</div>

        <div className="flex-1 space-y-1">
          <div className="font-medium">{getSyncTitle()}</div>
          <div className="text-sm text-muted-foreground">{getSyncDescription()}</div>

          {syncState.status === 'failed' && syncState.error && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:text-foreground">
                查看错误详情
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                {syncState.error}
              </pre>
            </details>
          )}
        </div>

        {syncState.status === 'failed' && onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            重试
          </Button>
        )}
      </div>
    </Alert>
  );
}

/**
 * Compact sync status badge component
 */
export function SyncStatusBadge({ syncState }: { syncState: SyncState }) {
  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (syncState.status) {
      case 'pending':
        return 'secondary';
      case 'syncing':
        return 'outline';
      case 'synced':
        return 'default';
      case 'failed':
        return 'destructive';
    }
  };

  const getBadgeText = () => {
    switch (syncState.status) {
      case 'pending':
        return '等待同步';
      case 'syncing':
        return '同步中';
      case 'synced':
        return '已同步';
      case 'failed':
        return '同步失败';
    }
  };

  const getBadgeIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'synced':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
        getBadgeVariant()
      )}
    >
      {getBadgeIcon()}
      <span>{getBadgeText()}</span>
    </div>
  );
}
