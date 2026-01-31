/**
 * ResultPanel - 结果展示面板
 *
 * 拆分后的结构：
 * - hooks/use-result-panel.ts: 状态和逻辑
 * - ResultPanelComponents.tsx: 子组件
 */

import { WelcomeShowcase } from '@/components/workspace/WelcomeShowcase';
import { useResultPanel } from '@/hooks/use-result-panel';
import { ResultDisplay, ResultStatusBar } from './ResultPanelComponents';
import type { ImageModel, TaskData } from '@/lib/types';

interface ResultPanelProps {
  tasks: TaskData[];
  imageModel: ImageModel;
  isPolling?: boolean;
  isGenerating?: boolean;
  onReset?: () => void;
}

export function ResultPanel({
  tasks,
  imageModel,
  isPolling = false,
  isGenerating = false,
  onReset,
}: ResultPanelProps) {
  const { resultUrl, productImage, hasResult, handleDownload } = useResultPanel(
    tasks,
    isGenerating
  );

  // 视图 A: 结果展示
  if (hasResult && resultUrl) {
    return (
      <>
        <ResultDisplay
          resultUrl={resultUrl}
          productImage={productImage}
          onDownload={handleDownload}
          onReset={onReset}
        />
        {/* 底部状态栏 */}
        <ResultStatusBar imageModel={imageModel} isPolling={isPolling} />
      </>
    );
  }

  // 视图 C: 欢迎/初始页 (兜底显示)
  console.log('[ResultPanel] 渲染欢迎页 (兜底)');
  return <WelcomeShowcase />;
}
