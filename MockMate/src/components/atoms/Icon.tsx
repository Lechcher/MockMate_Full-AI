/**
 * Icon wrapper for Lucide icons
 */

import React from 'react';
import { icons, LucideIcon } from 'lucide-react-native';

interface IconProps {
  name: keyof typeof icons;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Icon({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
}: IconProps) {
  const LucideIcon = icons[name] as LucideIcon;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react-native`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
