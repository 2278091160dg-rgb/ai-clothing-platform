/**
 * Radio Group Component (Stub)
 * 单选按钮组组件 - 简化实现
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

const RadioGroupContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
}>({
  value: '',
  onChange: () => {},
});

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onValueChange: (value: string) => void;
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <RadioGroupContext.Provider value={{ value, onChange: onValueChange }}>
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  </RadioGroupContext.Provider>
));
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { value: string; id: string }
>(({ className, value, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);

  return (
    <input
      ref={ref}
      type="radio"
      id={id}
      value={value}
      checked={context.value === value}
      onChange={e => context.onChange(e.target.value)}
      className={cn('h-4 w-4 text-primary', className)}
      {...props}
    />
  );
});
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
