/**
 * Daily Quests tab screen
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, Modal, Pressable } from 'react-native';
import { Text } from '../../components/atoms/Text';
import { Icon } from '../../components/atoms/Icon';
import { Card } from '../../components/atoms/Card';
import { QuestCard } from '../../components/molecules/QuestCard';
import { useGamificationState } from '../../hooks/useGamificationState';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { Quest } from '../../types/quest';

// Mock daily quests generator (in production, fetch from API)
const generateDailyQuests = (date: Date): Quest[] => {
  const dateStr = date.toISOString().split('T')[0];
  
  return [
    {
      id: `quest-${dateStr}-1`,
      title: 'Complete Your First Interview',
      description: 'Practice with any interview today',
      type: 'complete_interview',
      target: 1,
      progress: 0,
      reward: 50,
      expiresAt: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `quest-${dateStr}-2`,
      title: 'Maintain Your Streak',
      description: 'Keep your daily practice streak going',
      type: 'daily_streak',
      target: 1,
      progress: 0,
      reward: 30,
      expiresAt: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `quest-${dateStr}-3`,
      title: 'Practice for 30 Minutes',
      description: 'Spend at least 30 minutes practicing today',
      type: 'practice_hours',
      target: 30,
      progress: 0,
      reward: 75,
      expiresAt: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export default function QuestsScreen() {
  const { data: gamification } = useGamificationState();
  const { data: profile } = useUserProfile();
  
  const [quests, setQuests] = useState<Quest[]>(() => generateDailyQuests(new Date()));
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);

  // Calculate time until midnight (daily reset)
  const timeUntilReset = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, []);

  // Check for daily reset
  useEffect(() => {
    const checkReset = () => {
      const now = new Date();
      const lastReset = new Date(quests[0]?.expiresAt);
      lastReset.setHours(lastReset.getHours() - 24);
      
      // If it's past midnight since last reset, regenerate quests
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setQuests(generateDailyQuests(new Date()));
      }
    };

    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [quests]);

  // Calculate total gems earned (in production, fetch from API)
  const totalGemsEarned = useMemo(() => {
    return profile ? gamification?.gems || 0 : 0;
  }, [profile, gamification]);

  const handleQuestComplete = (quest: Quest) => {
    if (quest.progress >= quest.target) {
      setCompletedQuest(quest);
      setShowCelebration(true);
      
      // Award gems (in production, POST to /api/gamification/award)
      // For now, just show celebration
      setTimeout(() => {
        setShowCelebration(false);
        setCompletedQuest(null);
      }, 3000);
    }
  };

  const completedCount = quests.filter(q => q.progress >= q.target).length;
  const totalRewards = quests.reduce((sum, q) => sum + q.reward, 0);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
        <Text variant="heading" className="text-2xl mb-2">
          Daily Quests
        </Text>
        <Text variant="body" className="text-gray-600 mb-4">
          Complete quests to earn gems and boost your progress
        </Text>

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-3">
          <Card className="flex-1">
            <View className="items-center py-2">
              <View className="flex-row items-center mb-1">
                <Icon name="CheckCircle" size={16} className="text-green-500 mr-1" />
                <Text variant="heading" className="text-xl">
                  {completedCount}/{quests.length}
                </Text>
              </View>
              <Text variant="caption" className="text-gray-500">
                Completed
              </Text>
            </View>
          </Card>
          
          <Card className="flex-1">
            <View className="items-center py-2">
              <View className="flex-row items-center mb-1">
                <Icon name="Gem" size={16} className="text-blue-500 mr-1" />
                <Text variant="heading" className="text-xl">
                  {totalRewards}
                </Text>
              </View>
              <Text variant="caption" className="text-gray-500">
                Available
              </Text>
            </View>
          </Card>

          <Card className="flex-1">
            <View className="items-center py-2">
              <View className="flex-row items-center mb-1">
                <Icon name="Clock" size={16} className="text-orange-500 mr-1" />
                <Text variant="heading" className="text-lg">
                  {timeUntilReset}
                </Text>
              </View>
              <Text variant="caption" className="text-gray-500">
                Until Reset
              </Text>
            </View>
          </Card>
        </View>

        {/* Total Earned */}
        <View className="bg-blue-50 rounded-lg p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Icon name="TrendingUp" size={18} className="text-blue-600 mr-2" />
            <Text variant="body" className="text-blue-900 font-medium">
              Total Gems Earned
            </Text>
          </View>
          <Text variant="heading" className="text-blue-600">
            {totalGemsEarned.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Quests List */}
      <FlatList
        data={quests}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <QuestCard 
            quest={item} 
            onPress={() => handleQuestComplete(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Card>
            <View className="items-center py-12">
              <Icon name="CheckCircle" size={64} className="text-gray-300 mb-4" />
              <Text variant="heading" className="text-xl mb-2">
                All Done!
              </Text>
              <Text variant="body" className="text-gray-500 text-center">
                You've completed all quests for today.{'\n'}Come back tomorrow for new challenges!
              </Text>
            </View>
          </Card>
        }
      />

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCelebration(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={() => setShowCelebration(false)}
        >
          <View className="bg-white rounded-3xl p-8 mx-6 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Icon name="PartyPopper" size={40} className="text-green-600" />
            </View>
            
            <Text variant="heading" className="text-2xl mb-2 text-center">
              Quest Complete!
            </Text>
            
            <Text variant="body" className="text-gray-600 text-center mb-4">
              {completedQuest?.title}
            </Text>

            <View className="bg-blue-50 rounded-xl p-4 w-full items-center mb-4">
              <View className="flex-row items-center">
                <Icon name="Gem" size={24} className="text-blue-500 mr-2" />
                <Text variant="heading" className="text-3xl text-blue-600">
                  +{completedQuest?.reward}
                </Text>
              </View>
              <Text variant="caption" className="text-blue-700 mt-1">
                Gems earned
              </Text>
            </View>

            <Pressable
              onPress={() => setShowCelebration(false)}
              className="bg-blue-600 rounded-xl px-8 py-3 w-full"
            >
              <Text variant="body" className="text-white font-semibold text-center">
                Awesome!
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
