/**
 * SidebarTabHeader - 侧边栏 Tab 切换头部组件
 */

interface SidebarTabHeaderProps {
  activeTab: 'web' | 'table';
  webTaskCount: number;
  tableBatchCount: number;
  onTabChange: (tab: 'web' | 'table') => void;
}

export function SidebarTabHeader({
  activeTab,
  webTaskCount,
  tableBatchCount,
  onTabChange,
}: SidebarTabHeaderProps) {
  return (
    <div className="flex border-b border-border/30">
      <button
        onClick={() => onTabChange('web')}
        className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
          activeTab === 'web' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        网页端
        {activeTab === 'web' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        <span className="ml-2 text-xs opacity-60">({webTaskCount})</span>
      </button>
      <button
        onClick={() => onTabChange('table')}
        className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
          activeTab === 'table' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        表格端
        {activeTab === 'table' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        <span className="ml-2 text-xs opacity-60">({tableBatchCount})</span>
      </button>
    </div>
  );
}
