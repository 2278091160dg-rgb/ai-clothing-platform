/**
 * DownloadButton - 下载按钮组件
 */

import { Download } from 'lucide-react';

interface DownloadButtonProps {
  onDownload: () => void;
}

export function DownloadButton({ onDownload }: DownloadButtonProps) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onDownload();
      }}
      className="w-9 h-9 bg-primary/90 hover:bg-primary text-white backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
      title="下载图片"
    >
      <Download size={16} />
    </button>
  );
}
