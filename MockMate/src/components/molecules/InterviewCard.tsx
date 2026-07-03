import React from 'react';
import { View, Pressable } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import type { Interview, Difficulty } from '../../types/interview';

interface InterviewCardProps {
  interview: Interview;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
}

const difficultyColors: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

const industryIcons: Record<string, string> = {
  technology: 'Code',
  healthcare: 'Heart',
  finance: 'DollarSign',
  education: 'GraduationCap',
  retail: 'ShoppingBag',
  manufacturing: 'Factory',
  consulting: 'Briefcase',
  marketing: 'TrendingUp',
};

export function InterviewCard({
  interview,
  isFavorite = false,
  onPress,
  onFavoriteToggle,
}: InterviewCardProps) {
  const industryIcon = industryIcons[interview.industry.toLowerCase()] || 'Briefcase';

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card className="mb-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Icon name={industryIcon} size={20} className="text-blue-600" />
            </View>
            <View className="flex-1">
              <Text variant="heading" className="text-base mb-1">
                {interview.title}
              </Text>
              <Text variant="caption" className="text-gray-500">
                {interview.industry}
              </Text>
            </View>
          </View>

          {onFavoriteToggle && (
            <Pressable
              onPress={onFavoriteToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={isFavorite ? 'Heart' : 'Heart'}
                size={20}
                className={isFavorite ? 'text-red-500' : 'text-gray-400'}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Badge
              text={interview.difficulty}
              variant={difficultyColors[interview.difficulty]}
            />
            {interview.isVIPOnly && (
              <Badge text="VIP" variant="primary" />
            )}
          </View>

          <View className="flex-row items-center">
            <Icon name="Star" size={14} className="text-yellow-500 mr-1" fill="currentColor" />
            <Text variant="caption" className="text-gray-700">
              {interview.rating.toFixed(1)}
            </Text>
            <Text variant="caption" className="text-gray-400 ml-1">
              ({interview.reviewCount})
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-200">
          <View className="flex-row items-center mr-4">
            <Icon name="FileText" size={14} className="text-gray-500 mr-1" />
            <Text variant="caption" className="text-gray-600">
              {interview.questions.length} questions
            </Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="Clock" size={14} className="text-gray-500 mr-1" />
            <Text variant="caption" className="text-gray-600">
              {interview.estimatedDuration} min
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
