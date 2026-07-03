/**
 * Home tab screen
 */

import React from 'react';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/atoms/Text';
import { Button } from '../../components/atoms/Button';
import { Card } from '../../components/atoms/Card';
import { Icon } from '../../components/atoms/Icon';
import { SkeletonInterviewCard, SkeletonQuestCard } from '../../components/atoms/Skeleton';
import { HeaderMetrics } from '../../components/molecules/HeaderMetrics';
import { InterviewCard } from '../../components/molecules/InterviewCard';
import { QuestCard } from '../../components/molecules/QuestCard';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useInterviews } from '../../hooks/useInterviews';
import { useGamificationState } from '../../hooks/useGamificationState';
import { useVIPStatus } from '../../hooks/useVIPStatus';
import { useSavedInterviews } from '../../hooks/useSavedInterviews';
import type { Quest } from '../../types/quest';

export default function HomeScreen() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const { data: interviews, isLoading: interviewsLoading } = useInterviews();
  const { data: gamification } = useGamificationState();
  const { isVIP } = useVIPStatus();
  const { toggleFavorite, isFavorite } = useSavedInterviews();

  // Featured interviews (top rated, limit 5)
  const featuredInterviews = React.useMemo(() => {
    if (!interviews) return [];
    return [...interviews]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, [interviews]);

  // Mock daily quest for preview (in real app, fetch from API)
  const todayQuest: Quest = {
    id: 'daily-1',
    title: 'Complete Your First Interview',
    description: 'Practice with any interview to get started',
    type: 'complete_interview',
    target: 1,
    progress: 0,
    reward: 50,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  // Learning status based on today's activity
  const hasCompletedToday = gamification?.streak && gamification.streak > 0;
  const statusMessage = hasCompletedToday
    ? '🎉 Great job today! Keep your streak going!'
    : '👋 Start your daily practice';

  const handleInterviewPress = (interviewId: string) => {
    router.push(`/interview/${interviewId}`);
  };

  const handleFavoriteToggle = (interviewId: string) => {
    toggleFavorite(interviewId);
  };

  const handleStartInterview = () => {
    router.push('/(tabs)/explore');
  };

  const handleBrowseAll = () => {
    router.push('/(tabs)/explore');
  };

  const handleQuestPress = () => {
    router.push('/(tabs)/quests');
  };

  const handleGemsPress = () => {
    router.push('/(tabs)/shop');
  };

  const handleXPPress = () => {
    router.push('/(tabs)/profile');
  };

  const handleStreakPress = () => {
    router.push('/(tabs)/quests');
  };

  const handleVIPPress = () => {
    router.push('/vip-status');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Metrics */}
      {profile && gamification && (
        <HeaderMetrics
          gems={gamification.gems}
          xp={gamification.xp}
          level={gamification.level}
          streak={gamification.streak}
          isVIP={isVIP}
          onGemsPress={handleGemsPress}
          onXPPress={handleXPPress}
          onStreakPress={handleStreakPress}
          onVIPPress={handleVIPPress}
        />
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View className="px-4 pt-6 pb-4">
          <Text variant="heading" className="text-2xl mb-2">
            Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
          </Text>
          <Text variant="body" className="text-gray-600">
            {statusMessage}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <View className="flex-row gap-3">
            <Button
              onPress={handleStartInterview}
              variant="primary"
              className="flex-1"
            >
              <View className="flex-row items-center justify-center">
                <Icon name="Play" size={18} className="text-white mr-2" />
                <Text variant="body" className="text-white font-semibold">
                  Start Interview
                </Text>
              </View>
            </Button>
            <Button
              onPress={handleBrowseAll}
              variant="outline"
              className="flex-1"
            >
              <View className="flex-row items-center justify-center">
                <Icon name="Compass" size={18} className="text-blue-600 mr-2" />
                <Text variant="body" className="text-blue-600 font-semibold">
                  Browse All
                </Text>
              </View>
            </Button>
          </View>
        </View>

        {/* Daily Quest Preview */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="heading" className="text-lg">
              Daily Quest
            </Text>
            <Pressable onPress={handleQuestPress}>
              <Text variant="body" className="text-blue-600 font-medium">
                View All
              </Text>
            </Pressable>
          </View>
          {!gamification ? (
            <SkeletonQuestCard />
          ) : (
            <QuestCard quest={todayQuest} onPress={handleQuestPress} />
          )}
        </View>

        {/* Featured Interviews */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text variant="heading" className="text-lg">
              Featured Interviews
            </Text>
            <Pressable onPress={handleBrowseAll}>
              <Text variant="body" className="text-blue-600 font-medium">
                See All
              </Text>
            </Pressable>
          </View>

          {interviewsLoading ? (
            <FlatList
              data={[1, 2, 3]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={() => (
                <View style={{ width: 320, marginRight: 12 }}>
                  <SkeletonInterviewCard />
                </View>
              )}
              keyExtractor={(item) => `skeleton-${item}`}
            />
          ) : featuredInterviews.length > 0 ? (
            <FlatList
              data={featuredInterviews}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <View style={{ width: 320, marginRight: 12 }}>
                  <InterviewCard
                    interview={item}
                    isFavorite={isFavorite(item.id)}
                    onPress={() => handleInterviewPress(item.id)}
                    onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View className="px-4">
              <Card>
                <View className="items-center py-8">
                  <Icon name="FileText" size={48} className="text-gray-400 mb-3" />
                  <Text variant="body" className="text-gray-500 text-center">
                    No interviews available yet
                  </Text>
                </View>
              </Card>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
