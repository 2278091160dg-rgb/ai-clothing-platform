/**
 * DeleteScopeSelector - 删除范围选择组件
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTriangle } from '@/components/ui/alert';

export type DeleteScope = 'both' | 'local';

interface DeleteScopeSelectorProps {
  value: DeleteScope;
  onChange: (scope: DeleteScope) => void;
  hasFeishuRecord?: boolean;
  showLocalWarning?: boolean;
}

export function DeleteScopeSelector({
  value,
  onChange,
  hasFeishuRecord = false,
  showLocalWarning = false,
}: DeleteScopeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>删除范围</Label>
      <RadioGroup value={value} onValueChange={v => onChange(v as DeleteScope)}>
        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
          <RadioGroupItem value="both" id="both" />
          <div className="flex-1">
            <Label htmlFor="both" className="cursor-pointer font-medium">
              同时删除本地和飞书记录
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              {hasFeishuRecord
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
              {hasFeishuRecord
                ? '保留飞书多维表格中的记录，仅删除本地任务'
                : '仅删除本地任务'}
            </p>
          </div>
        </div>
      </RadioGroup>

      {showLocalWarning && hasFeishuRecord && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            选择&ldquo;仅删除本地记录&rdquo;后，飞书记录仍会保留，可能导致数据不一致
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
