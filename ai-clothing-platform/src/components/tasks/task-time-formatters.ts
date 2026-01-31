/**
 * Task Time Formatters
 * 任务时间格式化工具
 */

/**
 * 格式化任务时间 - 显示具体时间
 */
export function formatTaskTime(date: Date): string {
  const now = new Date();
  const taskDate = new Date(date);
  const diffMs = now.getTime() - taskDate.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  // 如果是今天，显示具体时间
  if (taskDate.toDateString() === now.toDateString()) {
    return `今天 ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 如果是昨天
  if (diffDays === 1) {
    return `昨天 ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 如果是前天
  if (diffDays === 2) {
    return `前天 ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 如果在7天内
  if (diffDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[taskDate.getDay()];
    return `${weekday} ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 超过7天，显示完整日期
  return taskDate.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
