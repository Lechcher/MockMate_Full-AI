import React from 'react';
import { View, Pressable } from 'react-native';
import { Icon } from '../atoms/Icon';
import { Text } from '../atoms/Text';
import { StreakBadge } from './StreakBadge';

interface HeaderMetricsProps {
  gems: number;
  xp: number;
  level: number;
  streak: number;
  isVIP?: boolean;
  onGemsPress?: () => void;
  onXPPress?: () => void;
  onStreakPress?: () => void;
  onVIPPress?: () => void;
}

export function HeaderMetrics({
  gems,
  xp,
  level,
  streak,
  isVIP = false,
  onGemsPress,
  onXPPress,
  onStreakPress,
  onVIPPress,
}: HeaderMetricsProps) {
  // Calculate XP progress for current level (assuming 1000 XP per level)
  const xpForCurrentLevel = xp % 1000;
  const xpProgressPercentage = (xpForCurrentLevel / 1000) * 100;

  return (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center justify-between">
        {/* Left side: Gems */}
        <Pressable
          onPress={onGemsPress}
          className="flex-row items-center bg-blue-50 rounded-full px-3 py-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="Gem" size={18} className="text-blue-500 mr-2" />
          <Text variant="body" className="text-blue-700 font-bold">
            {gems.toLocaleString()}
          </Text>
        </Pressable>

        {/* Center: XP and Level */}
        <Pressable
          onPress={onXPPress}
          className="flex-1 mx-3"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View className="flex-row items-center justify-center mb-1">
            <Icon name="Star" size={14} className="text-purple-500 mr-1" />
            <Text variant="caption" className="text-gray-600">
              Level {level}
            </Text>
            <Text variant="caption" className="text-gray-400 mx-1">
              •
            </Text>
            <Text variant="caption" className="text-gray-600">
              {xpForCurrentLevel}/1000 XP
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${xpProgressPercentage}%` }}
            />
          </View>
        </Pressable>

        {/* Right side: Streak or VIP */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onStreakPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <StreakBadge streak={streak} size="small" showLabel={false} />
          </Pressable>

          {isVIP && (
            <Pressable
              onPress={onVIPPress}
              className="bg-yellow-100 rounded-full px-3 py-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="Crown" size={18} className="text-yellow-600" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
