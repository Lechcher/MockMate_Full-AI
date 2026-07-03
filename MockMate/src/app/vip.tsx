import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Zap, Target, TrendingUp } from 'lucide-react-native';
import Purchases, { PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import { useAuth } from '../hooks/useAuth';
import { sanityClient } from '../lib/sanity';

const VIP_BENEFITS = [
  {
    icon: Crown,
    title: 'Unlimited Interviews',
    description: 'Practice as much as you want, no limits',
  },
  {
    icon: Sparkles,
    title: 'Advanced AI Feedback',
    description: 'Get detailed insights and improvement tips',
  },
  {
    icon: Zap,
    title: 'Priority Support',
    description: 'Fast response from our support team',
  },
  {
    icon: Target,
    title: 'Custom Interview Builder',
    description: 'Create your own tailored interview scenarios',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Track your progress with detailed stats',
  },
];

type BillingCycle = 'monthly' | 'yearly';

export default function VIPScreen() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<BillingCycle>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch offerings from RevenueCat on mount
  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        setOfferings(offerings);
      } else {
        Alert.alert(
          'No Plans Available',
          'Unable to load subscription plans. Please try again later.'
        );
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription plans. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPackage = (): PurchasesPackage | null => {
    if (!offerings?.current) return null;
    
    return selectedPlan === 'yearly' 
      ? offerings.current.annual 
      : offerings.current.monthly;
  };

  const formatPrice = (pkg: PurchasesPackage | null | undefined): string => {
    if (!pkg) return 'Loading...';
    return pkg.product.priceString;
  };

  const calculateSavings = (): string | null => {
    if (!offerings?.current?.annual || !offerings?.current?.monthly) return null;
    
    const monthlyPrice = offerings.current.monthly.product.price;
    const yearlyPrice = offerings.current.annual.product.price;
    const yearlyMonthlyEquivalent = yearlyPrice / 12;
    const savingsPercent = Math.round(((monthlyPrice - yearlyMonthlyEquivalent) / monthlyPrice) * 100);
    
    return savingsPercent > 0 ? `Save ${savingsPercent}%` : null;
  };

  const updateUserVIPStatus = async (isVIP: boolean) => {
    if (!user?.id) return;

    try {
      await sanityClient
        .patch(user.id)
        .set({ isVIP, vipUpdatedAt: new Date().toISOString() })
        .commit();
    } catch (error) {
      console.error('Error updating VIP status in Sanity:', error);
      // Non-critical error - user still has VIP via RevenueCat
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);

    try {
      const selectedPackage = getSelectedPackage();
      
      if (!selectedPackage) {
        throw new Error('No package selected');
      }

      // Purchase the package
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      // Check if user now has VIP entitlement
      const isVIP = typeof customerInfo.entitlements.active['vip'] !== 'undefined';
      
      if (isVIP) {
        // Update VIP status in Sanity
        await updateUserVIPStatus(true);
        
        Alert.alert(
          'Success!',
          'Welcome to VIP! You now have access to all premium features.',
          [
            {
              text: 'Start Practicing',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        throw new Error('Purchase completed but VIP entitlement not found');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Handle user cancellation gracefully
      if (error.userCancelled) {
        // User cancelled, no need to show error
        return;
      }
      
      Alert.alert(
        'Purchase Failed',
        error.message || 'Something went wrong. Please try again or contact support.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsProcessing(true);

    try {
      const customerInfo = await Purchases.restorePurchases();
      
      // Check if user has VIP entitlement after restore
      const isVIP = typeof customerInfo.entitlements.active['vip'] !== 'undefined';
      
      if (isVIP) {
        await updateUserVIPStatus(true);
        
        Alert.alert(
          'Restore Complete',
          'Your VIP subscription has been restored successfully!'
        );
        
        // Refresh offerings in case anything changed
        await fetchOfferings();
      } else {
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any previous purchases to restore.'
        );
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        error.message || 'Unable to restore purchases. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const yearlyPackage = offerings?.current?.annual;
  const monthlyPackage = offerings?.current?.monthly;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Upgrade to VIP',
          headerBackTitle: 'Back',
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading plans...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="bg-gradient-to-b from-amber-50 to-white px-6 py-8 items-center border-b border-gray-200">
            <View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-4">
              <Crown size={40} color="#f59e0b" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Unlock VIP Access
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Get unlimited interviews and premium features
            </Text>
          </View>

          {/* Benefits */}
          <View className="px-4 pt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              What's Included
            </Text>
            {VIP_BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <View
                  key={index}
                  className="flex-row items-start gap-3 mb-4 bg-white p-4 rounded-xl border border-gray-200"
                >
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                    <Icon size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Pricing Plans */}
          <View className="px-4 pt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Choose Your Plan
            </Text>

            {/* Yearly Plan */}
            {yearlyPackage && (
              <Pressable
                className={`p-4 rounded-xl border-2 mb-3 ${
                  selectedPlan === 'yearly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedPlan === 'yearly'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'yearly' && (
                        <Check size={16} color="white" />
                      )}
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-gray-900">
                        Yearly Plan
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Billed annually
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-bold text-gray-900">
                      {formatPrice(yearlyPackage)}
                    </Text>
                    {calculateSavings() && (
                      <Text className="text-sm text-green-600 font-medium">
                        {calculateSavings()}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            )}

            {/* Monthly Plan */}
            {monthlyPackage && (
              <Pressable
                className={`p-4 rounded-xl border-2 ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedPlan === 'monthly'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'monthly' && (
                        <Check size={16} color="white" />
                      )}
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-gray-900">
                        Monthly Plan
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Billed monthly
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xl font-bold text-gray-900">
                    {formatPrice(monthlyPackage)}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Subscribe Button */}
          <View className="px-4 pt-6 pb-4">
            <Pressable
              className={`py-4 rounded-lg items-center ${
                isProcessing || !offerings
                  ? 'bg-gray-300'
                  : 'bg-blue-500 active:bg-blue-600'
              }`}
              onPress={handleSubscribe}
              disabled={isProcessing || !offerings}
            >
              <Text className="text-white font-semibold text-base">
                {isProcessing ? 'Processing...' : 'Subscribe Now'}
              </Text>
            </Pressable>
          </View>

          {/* Restore Purchases */}
          <View className="px-4 pb-4">
            <Pressable
              className="py-3 items-center"
              onPress={handleRestorePurchases}
              disabled={isProcessing}
            >
              <Text className="text-blue-600 font-medium">
                Restore Purchases
              </Text>
            </Pressable>
          </View>

          {/* Terms */}
          <View className="px-4 pb-8">
            <Text className="text-xs text-gray-500 text-center leading-5">
              Subscription automatically renews unless auto-renew is turned off at
              least 24 hours before the end of the current period.{'\n\n'}
              <Text className="text-blue-600">Terms of Service</Text>
              {' • '}
              <Text className="text-blue-600">Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
