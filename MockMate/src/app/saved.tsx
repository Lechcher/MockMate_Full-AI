import { View, Text, Pressable, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { useSavedInterviews } from '../hooks/useSavedInterviews';
import { InterviewCard } from '../components/molecules/InterviewCard';

export default function SavedScreen() {
  const { data: savedInterviews, isLoading } = useSavedInterviews();

  const handleInterviewPress = (interviewId: string) => {
    router.push({
      pathname: '/interview/[id]',
      params: { id: interviewId },
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Saved Interviews',
          headerBackTitle: 'Back',
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      ) : savedInterviews && savedInterviews.length > 0 ? (
        <FlatList
          data={savedInterviews}
          renderItem={({ item }) => (
            <InterviewCard
              interview={item}
              onPress={() => handleInterviewPress(item._id)}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerClassName="p-4"
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Bookmark size={40} color="#9ca3af" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            No Saved Interviews
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            Tap the bookmark icon on any interview to save it for later
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
