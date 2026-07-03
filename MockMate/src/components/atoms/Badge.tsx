/**
 * Badge component with color variants
 */

import React from 'react';
import { View, Text } from 'react-native';
import { cn } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  const baseStyles = 'rounded-full items-center justify-center';

  const variantStyles = {
    default: 'bg-gray-200',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
    premium: 'bg-gradient-to-r from-purple-500 to-pink-500',
  };

  const textVariantStyles = {
    default: 'text-gray-900',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    premium: 'text-white',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
      <Text className={cn('font-semibold', textVariantStyles[variant], textSizeStyles[size])}>
        {children}
      </Text>
    </View>
  );
}
