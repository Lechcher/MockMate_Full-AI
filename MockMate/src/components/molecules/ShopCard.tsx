import React from 'react';
import { View, Pressable } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import type { PowerUp, VIPPlan } from '../../types/shop';

interface ShopCardProps {
  item: PowerUp | VIPPlan;
  onPress?: () => void;
  isOwned?: boolean;
  currentGems?: number;
}

function isPowerUp(item: PowerUp | VIPPlan): item is PowerUp {
  return 'gemCost' in item;
}

export function ShopCard({ item, onPress, isOwned = false, currentGems = 0 }: ShopCardProps) {
  const isPowerUpItem = isPowerUp(item);
  const canAfford = isPowerUpItem ? currentGems >= item.gemCost : true;

  const getIcon = () => {
    if (!isPowerUpItem) return 'Crown';
    if (item.id === 'streak_freeze') return 'Snowflake';
    if (item.id === 'double_xp') return 'Zap';
    return 'Star';
  };

  const getIconColor = () => {
    if (!isPowerUpItem) return 'text-yellow-600';
    if (item.id === 'streak_freeze') return 'text-blue-600';
    if (item.id === 'double_xp') return 'text-purple-600';
    return 'text-blue-600';
  };

  const getBgColor = () => {
    if (!isPowerUpItem) return 'bg-yellow-100';
    if (item.id === 'streak_freeze') return 'bg-blue-100';
    if (item.id === 'double_xp') return 'bg-purple-100';
    return 'bg-blue-100';
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress || isOwned || !canAfford}>
      <Card className={`mb-4 ${!canAfford && isPowerUpItem ? 'opacity-50' : ''}`}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-3 ${getBgColor()}`}>
              <Icon name={getIcon()} size={28} className={getIconColor()} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text variant="heading" className="text-base mr-2">
                  {item.name}
                </Text>
                {!isPowerUpItem && (
                  <Badge text="Premium" variant="warning" />
                )}
                {isOwned && (
                  <Badge text="Active" variant="success" />
                )}
              </View>
              <Text variant="caption" className="text-gray-500">
                {item.description}
              </Text>
            </View>
          </View>
        </View>

        {isPowerUpItem ? (
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
            <View className="flex-row items-center">
              <Icon name="Gem" size={18} className="text-blue-500 mr-2" />
              <Text variant="body" className="text-gray-700 font-bold">
                {item.gemCost} gems
              </Text>
            </View>
            {!canAfford && (
              <Text variant="caption" className="text-red-500">
                Not enough gems
              </Text>
            )}
          </View>
        ) : (
          <View className="pt-3 border-t border-gray-200">
            <View className="flex-row items-baseline mb-2">
              <Text variant="heading" className="text-2xl text-gray-900 mr-2">
                ${item.price}
              </Text>
              <Text variant="caption" className="text-gray-500">
                / {item.billingPeriod}
              </Text>
            </View>
            {item.trialDays && (
              <View className="bg-green-50 rounded-lg px-3 py-2">
                <Text variant="caption" className="text-green-700 font-medium">
                  {item.trialDays} days free trial
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}
