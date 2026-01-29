/**
 * Alert Component (Stub)
 * 警告提示组件 - 简化实现
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' | 'warning' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-lg border p-4',
      variant === 'destructive' && 'border-red-500 bg-red-50 text-red-900',
      variant === 'warning' && 'border-yellow-500 bg-yellow-50 text-yellow-900',
      variant === 'default' && 'border-gray-300 bg-gray-50 text-gray-900',
      className
    )}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Loader2,
};
