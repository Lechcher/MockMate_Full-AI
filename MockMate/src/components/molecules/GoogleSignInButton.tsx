import React from 'react';
import { View } from 'react-native';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Text } from '../atoms/Text';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({ 
  onPress, 
  isLoading = false, 
  disabled = false 
}: GoogleSignInButtonProps) {
  return (
    <Button
      onPress={onPress}
      variant="google"
      disabled={disabled || isLoading}
      className="w-full"
    >
      <View className="flex-row items-center justify-center">
        {!isLoading && (
          <View className="mr-3">
            <Icon name="Chrome" size={20} className="text-white" />
          </View>
        )}
        <Text variant="body" className="text-white font-semibold">
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </View>
    </Button>
  );
}
