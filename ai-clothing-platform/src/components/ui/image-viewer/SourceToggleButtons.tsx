/**
 * SourceToggleButtons - 素材切换按钮组件
 */

import { ImageIcon, Layers } from 'lucide-react';

interface SourceToggleButtonsProps {
  compareSource: 'product' | 'scene';
  onSourceChange: (source: 'product' | 'scene') => void;
  compact?: boolean;
}

export function SourceToggleButtons({
  compareSource,
  onSourceChange,
  compact = false,
}: SourceToggleButtonsProps) {
  const containerClass = compact
    ? 'flex gap-1 bg-white/5 rounded-md p-0.5 border border-white/10'
    : 'flex gap-1 bg-white/5 rounded-md p-0.5 border border-white/10';

  const buttonClass = compact
    ? 'w-7 h-7 rounded flex items-center justify-center transition-all'
    : 'px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1';

  const activeClass = compact
    ? 'bg-blue-500 text-white'
    : 'bg-blue-500 text-white shadow-sm';

  const inactiveClass = 'text-white/60 hover:text-white hover:bg-white/10';

  const iconSize = compact ? 12 : 10;

  return (
    <div className={containerClass}>
      <button
        onClick={e => {
          e.stopPropagation();
          onSourceChange('product');
        }}
        className={`${buttonClass} ${compareSource === 'product' ? activeClass : inactiveClass}`}
        title="素材A"
      >
        <ImageIcon size={iconSize} />
        {!compact && <span>A</span>}
      </button>
      <button
        onClick={e => {
          e.stopPropagation();
          onSourceChange('scene');
        }}
        className={`${buttonClass} ${compareSource === 'scene' ? activeClass : inactiveClass}`}
        title="素材B"
      >
        <Layers size={iconSize} />
        {!compact && <span>B</span>}
      </button>
    </div>
  );
}
