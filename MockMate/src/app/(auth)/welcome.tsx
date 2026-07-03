/**
 * Welcome screen - Google OAuth login
 */

import React, { useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/atoms/Text';
import { Button } from '../../components/atoms/Button';
import { Icon } from '../../components/atoms/Icon';
import { useAuth } from '../../hooks/useAuth';

export default function WelcomeScreen() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await login();
      // Navigation is handled by RequireAuth component
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('user_cancelled') || err.message?.includes('a0.session.user_cancelled')) {
        setError('Login cancelled. Please try again.');
      } else if (err.message?.includes('network')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* Logo placeholder */}
      <View className="items-center mb-12">
        <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-4">
          <Icon name="MessageSquare" size={48} color="white" />
        </View>
        
        <Text variant="heading" className="text-center mb-2">
          MockMate
        </Text>
        
        <Text variant="body" color="text-gray-600" className="text-center">
          AI Mock Interview Practice
        </Text>
      </View>

      {/* Main content */}
      <View className="w-full max-w-sm">
        <Text variant="subheading" className="text-center mb-2">
          Welcome
        </Text>
        
        <Text variant="body" color="text-gray-600" className="text-center mb-8">
          Practice interviews with AI-powered feedback
        </Text>

        {/* Google Sign In Button */}
        <Button
          variant="google"
          onPress={handleGoogleLogin}
          disabled={isLoading}
          loading={isLoading}
          className="w-full mb-4"
        >
          {!isLoading && (
            <View className="flex-row items-center">
              <Icon name="Chrome" size={20} color="#4285F4" className="mr-2" />
              <Text className="text-gray-900 font-semibold">
                Continue with Google
              </Text>
            </View>
          )}
        </Button>

        {/* Error message */}
        {error && (
          <View className="bg-red-50 rounded-xl p-4 mb-4">
            <Text variant="caption" color="text-red-800" className="text-center">
              {error}
            </Text>
          </View>
        )}

        {/* Loading state */}
        {isLoading && (
          <View className="items-center mt-4">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text variant="caption" color="text-gray-600" className="mt-2">
              Signing in...
            </Text>
          </View>
        )}

        {/* Terms */}
        <Text variant="caption" color="text-gray-500" className="text-center mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
