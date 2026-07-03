/**
 * useVIPStatus hook
 * 
 * Provides VIP subscription status from RevenueCat.
 * Automatically syncs with RevenueCat backend and checks entitlements.
 * 
 * @example
 * ```tsx
 * import { useVIPStatus } from '@/hooks/useVIPStatus';
 * 
 * function InterviewDetailScreen({ interview }: Props) {
 *   const { isVIP, isLoading } = useVIPStatus();
 * 
 *   if (interview.isPremium && !isVIP) {
 *     return <Button onPress={navigateToVIP}>Upgrade to VIP</Button>;
 *   }
 * 
 *   return <Button onPress={startInterview}>Start Interview</Button>;
 * }
 * ```
 * 
 * @returns {Object} VIP status and metadata
 * @returns {boolean} isVIP - Whether user has active VIP subscription
 * @returns {Date | null} expiryDate - Subscription expiry date
 * @returns {Object | null} customerInfo - Full RevenueCat customer info
 * @returns {boolean} isLoading - Loading state
 * @returns {() => Promise<void>} refresh - Manually refresh VIP status
 */

import { useVIPContext } from '../lib/revenuecat/VIPContext';

export function useVIPStatus() {
  const { isVIP, expiryDate, customerInfo, isLoading, refresh } = useVIPContext();

  return {
    isVIP,
    expiryDate,
    customerInfo,
    isLoading,
    refresh,
  };
}
