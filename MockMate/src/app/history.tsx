import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Clock, TrendingUp, Calendar } from 'lucide-react-native';

// Mock interview history - will be fetched from Sanity in production
const MOCK_HISTORY = [
  {
    id: '1',
    title: 'Software Engineer Technical',
    date: '2026-07-02',
    score: 85,
    rating: 'Excellent',
    duration: '25 min',
  },
  {
    id: '2',
    title: 'Product Manager Behavioral',
    date: '2026-07-01',
    score: 78,
    rating: 'Good',
    duration: '30 min',
  },
  {
    id: '3',
    title: 'Data Analyst Case Study',
    date: '2026-06-28',
    score: 92,
    rating: 'Excellent',
    duration: '35 min',
  },
  {
    id: '4',
    title: 'Marketing Manager Leadership',
    date: '2026-06-25',
    score: 70,
    rating: 'Fair',
    duration: '20 min',
  },
];

type FilterType = 'all' | 'week' | 'month';

export default function HistoryScreen() {
  const [filter, setFilter] = useState<FilterType>('all');

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    return 'text-amber-600 bg-amber-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filterData = (data: typeof MOCK_HISTORY) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'week':
        return data.filter(item => new Date(item.date) >= oneWeekAgo);
      case 'month':
        return data.filter(item => new Date(item.date) >= oneMonthAgo);
      default:
        return data;
    }
  };

  const filteredHistory = filterData(MOCK_HISTORY);

  const handleInterviewPress = (interviewId: string) => {
    // Navigate to results screen to view past interview details
    router.push({
      pathname: '/interview/results',
      params: { id: interviewId },
    });
  };

  const renderInterviewCard = ({ item }: { item: typeof MOCK_HISTORY[0] }) => (
    <Pressable
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3 active:bg-gray-50"
      onPress={() => handleInterviewPress(item.id)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {item.title}
          </Text>
          <View className="flex-row items-center gap-2">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600">
              {formatDate(item.date)}
            </Text>
            <Text className="text-gray-400">•</Text>
            <Clock size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600">{item.duration}</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${getScoreColor(item.score)}`}>
          <Text className={`text-base font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
            {item.score}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1 mt-2">
        <TrendingUp size={16} color="#3b82f6" />
        <Text className="text-sm text-gray-600">{item.rating}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Interview History',
          headerBackTitle: 'Back',
        }}
      />

      {/* Filter Tabs */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row gap-2">
          <Pressable
            className={`flex-1 py-2 rounded-lg items-center ${
              filter === 'all' ? 'bg-blue-500' : 'bg-gray-100'
            }`}
            onPress={() => setFilter('all')}
          >
            <Text
              className={`font-medium ${
                filter === 'all' ? 'text-white' : 'text-gray-700'
              }`}
            >
              All Time
            </Text>
          </Pressable>

          <Pressable
            className={`flex-1 py-2 rounded-lg items-center ${
              filter === 'week' ? 'bg-blue-500' : 'bg-gray-100'
            }`}
            onPress={() => setFilter('week')}
          >
            <Text
              className={`font-medium ${
                filter === 'week' ? 'text-white' : 'text-gray-700'
              }`}
            >
              This Week
            </Text>
          </Pressable>

          <Pressable
            className={`flex-1 py-2 rounded-lg items-center ${
              filter === 'month' ? 'bg-blue-500' : 'bg-gray-100'
            }`}
            onPress={() => setFilter('month')}
          >
            <Text
              className={`font-medium ${
                filter === 'month' ? 'text-white' : 'text-gray-700'
              }`}
            >
              This Month
            </Text>
          </Pressable>
        </View>
      </View>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderInterviewCard}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Clock size={40} color="#9ca3af" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            No Interview History
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            Complete your first interview to see your history here
          </Text>
          <Pressable
            className="px-6 py-3 bg-blue-500 rounded-lg active:bg-blue-600"
            onPress={() => router.push('/(tabs)')}
          >
            <Text className="text-white font-semibold">
              Browse Interviews
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
