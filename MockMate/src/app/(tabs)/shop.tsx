/**
 * Shop tab screen
 */

import React, { useState } from 'react';
import { View, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/atoms/Text';
import { Icon } from '../../components/atoms/Icon';
import { Button } from '../../components/atoms/Button';
import { ShopCard } from '../../components/molecules/ShopCard';
import { useGamificationState } from '../../hooks/useGamificationState';
import { useVIPStatus } from '../../hooks/useVIPStatus';
import type { PowerUp, VIPPlan } from '../../types/shop';

// Mock power-ups (in production, fetch from API)
const POWER_UPS: PowerUp[] = [
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Protect your streak for one day if you miss practice',
    gemCost: 100,
    duration: '1 day',
  },
  {
    id: 'double_xp',
    name: 'Double XP',
    description: 'Earn 2x XP on all interviews for 24 hours',
    gemCost: 150,
    duration: '24 hours',
  },
];

// Mock VIP plan (in production, fetch from RevenueCat)
const VIP_PLAN: VIPPlan = {
  id: 'vip_yearly',
  name: 'MockMate VIP',
  description: 'Unlock all premium features and exclusive content',
  price: 49.99,
  billingPeriod: 'year',
  trialDays: 7,
  features: [
    'Unlimited premium interviews',
    'AI-powered feedback & coaching',
    'Advanced analytics dashboard',
    'Priority support',
    'Ad-free experience',
  ],
};

export default function ShopScreen() {
  const router = useRouter();
  const { data: gamification } = useGamificationState();
  const { isVIP } = useVIPStatus();

  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);

  const currentGems = gamification?.gems || 0;

  const handlePowerUpPress = (powerUp: PowerUp) => {
    // Check if already owned
    if (activePowerUps.includes(powerUp.id)) {
      return;
    }

    // Check if user has enough gems
    if (currentGems < powerUp.gemCost) {
      setShowErrorModal(true);
      return;
    }

    setSelectedPowerUp(powerUp);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPowerUp) return;

    // In production: POST to /api/gamification/award with negative gem delta
    // For now, just simulate the purchase
    setActivePowerUps([...activePowerUps, selectedPowerUp.id]);
    setShowConfirmModal(false);
    setSelectedPowerUp(null);

    // Show success feedback (could be a toast notification)
    // For now, the card will update to show "Active" badge
  };

  const handleGoToQuests = () => {
    setShowErrorModal(false);
    router.push('/(tabs)/quests');
  };

  const handleUpgradeToVIP = () => {
    router.push('/vip');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="heading" className="text-2xl">
            Shop
          </Text>
          <View className="flex-row items-center bg-blue-50 rounded-full px-3 py-2">
            <Icon name="Gem" size={18} className="text-blue-500 mr-2" />
            <Text variant="body" className="text-blue-700 font-bold">
              {currentGems.toLocaleString()}
            </Text>
          </View>
        </View>
        <Text variant="body" className="text-gray-600">
          Enhance your practice with power-ups and premium features
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* VIP Section (only for non-VIP users) */}
        {!isVIP && (
          <View className="px-4 pt-6 pb-4">
            <Text variant="heading" className="text-lg mb-3">
              Premium Membership
            </Text>
            <ShopCard
              item={VIP_PLAN}
              onPress={handleUpgradeToVIP}
            />
          </View>
        )}

        {/* Daily Deal Section */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="heading" className="text-lg">
              Daily Deal
            </Text>
            <View className="bg-red-100 rounded-full px-3 py-1">
              <Text variant="caption" className="text-red-600 font-bold">
                50% OFF
              </Text>
            </View>
          </View>
          
          <ShopCard
            item={{
              ...POWER_UPS[0],
              gemCost: Math.floor(POWER_UPS[0].gemCost / 2),
            }}
            currentGems={currentGems}
            isOwned={activePowerUps.includes(POWER_UPS[0].id)}
            onPress={() => handlePowerUpPress({
              ...POWER_UPS[0],
              gemCost: Math.floor(POWER_UPS[0].gemCost / 2),
            })}
          />
        </View>

        {/* Power-Ups Section */}
        <View className="px-4 pb-6">
          <Text variant="heading" className="text-lg mb-3">
            Power-Ups
          </Text>
          {POWER_UPS.map((powerUp) => (
            <ShopCard
              key={powerUp.id}
              item={powerUp}
              currentGems={currentGems}
              isOwned={activePowerUps.includes(powerUp.id)}
              onPress={() => handlePowerUpPress(powerUp)}
            />
          ))}
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>

      {/* Purchase Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={() => setShowConfirmModal(false)}
        >
          <Pressable className="bg-white rounded-3xl p-6 mx-6 w-11/12">
            <Text variant="heading" className="text-xl mb-3 text-center">
              Confirm Purchase
            </Text>

            <Text variant="body" className="text-gray-600 text-center mb-4">
              {selectedPowerUp?.name}
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text variant="body" className="text-gray-600">
                  Cost
                </Text>
                <View className="flex-row items-center">
                  <Icon name="Gem" size={16} className="text-blue-500 mr-1" />
                  <Text variant="body" className="text-gray-900 font-bold">
                    {selectedPowerUp?.gemCost}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text variant="body" className="text-gray-600">
                  Your Balance
                </Text>
                <View className="flex-row items-center">
                  <Icon name="Gem" size={16} className="text-blue-500 mr-1" />
                  <Text variant="body" className="text-gray-900 font-bold">
                    {currentGems}
                  </Text>
                </View>
              </View>
              <View className="border-t border-gray-200 my-2" />
              <View className="flex-row items-center justify-between">
                <Text variant="body" className="text-gray-600 font-medium">
                  After Purchase
                </Text>
                <View className="flex-row items-center">
                  <Icon name="Gem" size={16} className="text-green-500 mr-1" />
                  <Text variant="body" className="text-green-600 font-bold">
                    {currentGems - (selectedPowerUp?.gemCost || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Button
                onPress={() => setShowConfirmModal(false)}
                variant="outline"
                className="flex-1"
              >
                <Text variant="body" className="text-gray-700 font-semibold">
                  Cancel
                </Text>
              </Button>
              <Button
                onPress={handleConfirmPurchase}
                variant="primary"
                className="flex-1"
              >
                <Text variant="body" className="text-white font-semibold">
                  Purchase
                </Text>
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Insufficient Gems Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center"
          onPress={() => setShowErrorModal(false)}
        >
          <Pressable className="bg-white rounded-3xl p-6 mx-6 w-11/12">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Icon name="AlertCircle" size={32} className="text-red-500" />
              </View>
              <Text variant="heading" className="text-xl mb-2 text-center">
                Not Enough Gems
              </Text>
              <Text variant="body" className="text-gray-600 text-center">
                Complete daily quests to earn more gems
              </Text>
            </View>

            <View className="bg-blue-50 rounded-xl p-4 mb-4 flex-row items-center justify-between">
              <Text variant="body" className="text-blue-900">
                Your Balance
              </Text>
              <View className="flex-row items-center">
                <Icon name="Gem" size={18} className="text-blue-500 mr-2" />
                <Text variant="heading" className="text-blue-600">
                  {currentGems}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Button
                onPress={() => setShowErrorModal(false)}
                variant="outline"
                className="flex-1"
              >
                <Text variant="body" className="text-gray-700 font-semibold">
                  Cancel
                </Text>
              </Button>
              <Button
                onPress={handleGoToQuests}
                variant="primary"
                className="flex-1"
              >
                <Text variant="body" className="text-white font-semibold">
                  Earn Gems
                </Text>
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
