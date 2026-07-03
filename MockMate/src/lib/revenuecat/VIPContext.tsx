/**
 * VIP Context using RevenueCat
 * 
 * Provides VIP status and expiry date from RevenueCat customer info
 */

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases';

interface VIPContextValue {
  isVIP: boolean;
  expiryDate?: string;
  customerInfo?: CustomerInfo;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const VIPContext = createContext<VIPContextValue | undefined>(undefined);

interface VIPProviderProps {
  children: ReactNode;
}

export function VIPProvider({ children }: VIPProviderProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerInfo = async () => {
    try {
      setIsLoading(true);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error fetching customer info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerInfo();

    // Listen for purchase updates
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => {
      listener.remove();
    };
  }, []);

  const isVIP = customerInfo?.entitlements.active['vip'] !== undefined;
  const vipEntitlement: PurchasesEntitlementInfo | undefined =
    customerInfo?.entitlements.active['vip'];
  const expiryDate = vipEntitlement?.expirationDate || undefined;

  const value: VIPContextValue = {
    isVIP,
    expiryDate,
    customerInfo,
    isLoading,
    refresh: fetchCustomerInfo,
  };

  return <VIPContext.Provider value={value}>{children}</VIPContext.Provider>;
}

export function useVIPContext() {
  const context = useContext(VIPContext);
  if (context === undefined) {
    throw new Error('useVIPContext must be used within a VIPProvider');
  }
  return context;
}
