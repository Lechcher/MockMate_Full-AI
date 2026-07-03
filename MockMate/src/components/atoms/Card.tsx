/**
 * Card component with shadow
 */

import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from 'tailwind-merge';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  children,
  className,
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-4';

  const variantStyles = {
    default: 'shadow-sm',
    elevated: 'shadow-lg',
    outlined: 'border-2 border-gray-200',
  };

  return (
    <View
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </View>
  );
}
