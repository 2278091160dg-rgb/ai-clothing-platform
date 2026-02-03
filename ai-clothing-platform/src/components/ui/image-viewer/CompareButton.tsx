/**
 * CompareButton - 对比按钮组件
 */

import { Layers } from 'lucide-react';

interface CompareButtonProps {
  isComparing: boolean;
  onCompareStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onCompareEnd: (e: React.MouseEvent | React.TouchEvent) => void;
  hasMultipleSources?: boolean;
  compareSource?: 'product' | 'scene';
  compact?: boolean;
}

export function CompareButton({
  isComparing,
  onCompareStart,
  onCompareEnd,
  hasMultipleSources = false,
  compareSource = 'product',
  compact = false,
}: CompareButtonProps) {
  const buttonClass = compact
    ? 'px-4 py-2 rounded-lg text-sm font-medium'
    : 'px-3 py-1.5 rounded-md text-xs font-medium';

  const activeClass = isComparing
    ? 'bg-emerald-500 text-white shadow-lg'
    : 'bg-white/10 hover:bg-white/20 active:scale-95';

  const title = `按住对比${hasMultipleSources ? (compareSource === 'product' ? 'A' : 'B') : ''}`;

  return (
    <button
      onMouseDown={e => {
        e.stopPropagation();
        onCompareStart(e);
      }}
      onMouseUp={e => {
        e.stopPropagation();
        onCompareEnd(e);
      }}
      onMouseLeave={e => {
        e.stopPropagation();
        onCompareEnd(e);
      }}
      onTouchStart={e => {
        e.stopPropagation();
        onCompareStart(e);
      }}
      onTouchEnd={e => {
        e.stopPropagation();
        onCompareEnd(e);
      }}
      className={`${buttonClass} ${activeClass} transition-all duration-200 flex items-center gap-2`}
      title={title}
    >
      <Layers size={compact ? 14 : 12} />
      {isComparing ? '松开' : '对比'}
    </button>
  );
}
