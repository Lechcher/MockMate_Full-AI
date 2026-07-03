/**
 * Interview detail screen
 */

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Text } from '../../components/atoms/Text';
import { Icon } from '../../components/atoms/Icon';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Card } from '../../components/atoms/Card';
import { useInterviews } from '../../hooks/useInterviews';
import { useSavedInterviews } from '../../hooks/useSavedInterviews';
import { useVIPStatus } from '../../hooks/useVIPStatus';
import type { Difficulty } from '../../types/interview';

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

export default function InterviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: interviews, isLoading } = useInterviews();
  const { toggleFavorite, isFavorite } = useSavedInterviews();
  const { isVIP } = useVIPStatus();

  const interview = interviews?.find((i) => i.id === id);

  const handleFavoriteToggle = () => {
    if (interview) {
      toggleFavorite(interview.id);
    }
  };

  const handleStartInterview = () => {
    if (interview?.isVIPOnly && !isVIP) {
      router.push('/vip');
    } else {
      router.push({
        pathname: '/interview/mode',
        params: { id: interview?.id },
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View className="flex-1 bg-gray-50 items-center justify-center">
          <Text variant="body" className="text-gray-500">
            Loading interview details...
          </Text>
        </View>
      </>
    );
  }

  if (!interview) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View className="flex-1 bg-gray-50 items-center justify-center px-6">
          <Icon name="AlertCircle" size={64} className="text-gray-300 mb-4" />
          <Text variant="heading" className="text-xl mb-2">
            Interview Not Found
          </Text>
          <Text variant="body" className="text-gray-500 text-center mb-6">
            This interview doesn't exist or has been removed
          </Text>
          <Button onPress={() => router.back()} variant="primary">
            <Text variant="body" className="text-white font-semibold">
              Go Back
            </Text>
          </Button>
        </View>
      </>
    );
  }

  const industryIcon = industryIcons[interview.industry.toLowerCase()] || 'Briefcase';
  const isFavorited = isFavorite(interview.id);
  const canStart = !interview.isVIPOnly || isVIP;

  return (
    <>
      <Stack.Screen
        options={{
          title: interview.title,
          headerRight: () => (
            <Pressable
              onPress={handleFavoriteToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="Heart"
                size={24}
                className={isFavorited ? 'text-red-500' : 'text-gray-400'}
                fill={isFavorited ? 'currentColor' : 'none'}
              />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-gray-50">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View className="bg-white px-4 pt-6 pb-4">
            <View className="flex-row items-start mb-4">
              <View className="w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center mr-4">
                <Icon name={industryIcon} size={32} className="text-blue-600" />
              </View>
              <View className="flex-1">
                <Text variant="heading" className="text-2xl mb-2">
                  {interview.title}
                </Text>
                <View className="flex-row items-center gap-2 mb-2">
                  <Badge
                    text={interview.difficulty}
                    variant={difficultyColors[interview.difficulty]}
                  />
                  {interview.isVIPOnly && <Badge text="VIP" variant="warning" />}
                </View>
                <Text variant="body" className="text-gray-600">
                  {interview.industry}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View className="flex-row items-center mb-4">
              <Icon name="Star" size={20} className="text-yellow-500 mr-2" fill="currentColor" />
              <Text variant="heading" className="text-xl mr-2">
                {interview.rating.toFixed(1)}
              </Text>
              <Text variant="body" className="text-gray-500">
                ({interview.reviewCount} reviews)
              </Text>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-3">
              <Card className="flex-1 bg-gray-50">
                <View className="items-center py-3">
                  <Icon name="FileText" size={24} className="text-blue-600 mb-1" />
                  <Text variant="heading" className="text-lg">
                    {interview.questions.length}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    Questions
                  </Text>
                </View>
              </Card>
              <Card className="flex-1 bg-gray-50">
                <View className="items-center py-3">
                  <Icon name="Clock" size={24} className="text-purple-600 mb-1" />
                  <Text variant="heading" className="text-lg">
                    {interview.estimatedDuration}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    Minutes
                  </Text>
                </View>
              </Card>
              <Card className="flex-1 bg-gray-50">
                <View className="items-center py-3">
                  <Icon name="Target" size={24} className="text-green-600 mb-1" />
                  <Text variant="heading" className="text-lg capitalize">
                    {interview.difficulty}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    Level
                  </Text>
                </View>
              </Card>
            </View>
          </View>

          {/* Description Section */}
          <View className="bg-white mt-4 px-4 py-4">
            <Text variant="heading" className="text-lg mb-3">
              About This Interview
            </Text>
            <Text variant="body" className="text-gray-700 mb-4">
              {interview.description}
            </Text>

            <View className="bg-blue-50 rounded-lg p-3 flex-row items-start">
              <Icon name="Lightbulb" size={20} className="text-blue-600 mr-2 mt-0.5" />
              <View className="flex-1">
                <Text variant="body" className="text-blue-900 font-medium mb-1">
                  Focus Area
                </Text>
                <Text variant="body" className="text-blue-700">
                  {interview.focusArea}
                </Text>
              </View>
            </View>
          </View>

          {/* VIP Only Notice (for non-VIP users) */}
          {interview.isVIPOnly && !isVIP && (
            <View className="bg-white mt-4 px-4 py-4">
              <Card className="bg-yellow-50 border border-yellow-200">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                    <Icon name="Crown" size={20} className="text-yellow-600" />
                  </View>
                  <View className="flex-1">
                    <Text variant="heading" className="text-base mb-1">
                      VIP Exclusive
                    </Text>
                    <Text variant="body" className="text-gray-700">
                      Upgrade to VIP to access this premium interview and unlock all exclusive content.
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* Review Breakdown */}
          <View className="bg-white mt-4 px-4 py-4">
            <Text variant="heading" className="text-lg mb-3">
              Review Breakdown
            </Text>
            {[5, 4, 3, 2, 1].map((star) => {
              const percentage = Math.random() * 100; // Mock data
              return (
                <View key={star} className="flex-row items-center mb-2">
                  <Text variant="caption" className="text-gray-600 w-8">
                    {star}★
                  </Text>
                  <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                    <View
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text variant="caption" className="text-gray-600 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <Button
            onPress={handleStartInterview}
            variant="primary"
            className="w-full"
          >
            <View className="flex-row items-center justify-center">
              <Icon
                name={canStart ? 'Play' : 'Crown'}
                size={20}
                className="text-white mr-2"
              />
              <Text variant="body" className="text-white font-semibold text-lg">
                {canStart ? 'Start Interview' : 'Upgrade to Start'}
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </>
  );
}
