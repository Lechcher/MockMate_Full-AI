/**
 * Button component with Uniwind variants
 */

import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from 'tailwind-merge';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'google';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  hapticFeedback?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  children,
  className,
  hapticFeedback = true,
}: ButtonProps) {
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const baseStyles = 'rounded-xl items-center justify-center flex-row';

  const variantStyles = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-blue-600 bg-transparent active:bg-blue-50',
    google: 'bg-white border-2 border-gray-300 active:bg-gray-50',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    outline: 'text-blue-600',
    google: 'text-gray-900',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyles = disabled || loading ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#1F2937'} />
      ) : (
        <Text
          className={cn(
            'font-semibold',
            textVariantStyles[variant],
            textSizeStyles[size]
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
