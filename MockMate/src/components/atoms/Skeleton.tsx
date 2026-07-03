import { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  className,
  ...props 
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );

    return { opacity };
  });

  return (
    <View
      className={className}
      style={{ width, height, overflow: 'hidden' }}
      {...props}
    >
      <Animated.View
        className="bg-gray-300 dark:bg-gray-700"
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3">
      <Skeleton width="60%" height={20} className="mb-2" />
      <Skeleton width="40%" height={16} className="mb-3" />
      <View className="flex-row items-center gap-2 mb-3">
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={16} className="mb-2" />
      <Skeleton width="80%" height={16} />
    </View>
  );
}

export function SkeletonInterviewCard() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Skeleton width="70%" height={20} className="mb-2" />
          <Skeleton width="40%" height={14} />
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
      <View className="flex-row items-center gap-2 mb-3">
        <Skeleton width={70} height={20} borderRadius={10} />
        <Skeleton width={70} height={20} borderRadius={10} />
      </View>
      <View className="flex-row items-center justify-between">
        <Skeleton width={100} height={16} />
        <Skeleton width={60} height={16} />
      </View>
    </View>
  );
}

export function SkeletonQuestCard() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center gap-3 mb-3">
        <Skeleton width={48} height={48} borderRadius={24} />
        <View className="flex-1">
          <Skeleton width="80%" height={18} className="mb-2" />
          <Skeleton width="50%" height={14} />
        </View>
      </View>
      <Skeleton width="100%" height={8} borderRadius={4} className="mb-2" />
      <View className="flex-row items-center justify-between">
        <Skeleton width={60} height={14} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}
