/**
 * Badge Component (Stub)
 * 徽章组件 - 简化实现
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
      variant === 'default' && 'border-transparent bg-primary text-primary-foreground',
      variant === 'outline' && 'border-gray-300 text-gray-700',
      variant === 'destructive' && 'border-transparent bg-red-500 text-white',
      className
    )}
    {...props}
  />
));
Badge.displayName = 'Badge';

export { Badge };
