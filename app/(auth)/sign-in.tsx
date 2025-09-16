import { SocialConnections } from '@/components/auth/social-connections';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

export default function SignInScreen() {
  return (
    <View className="py-safe flex-1">
      <View className="flex-1 items-center justify-center px-6">
        <Text variant="h1">Outfits</Text>
        <Text variant="lead" className="mt-2 text-center">
          Keep track of your clothes
        </Text>
        <View className="mt-6 flex-row items-center gap-2" accessibilityLabel="playful-emojis">
          <Text className="text-2xl" style={{ transform: [{ rotate: '-5deg' }] }}>
            👕
          </Text>
          <Text className="text-2xl" style={{ transform: [{ rotate: '5deg' }] }}>
            👖
          </Text>
          <Text className="text-2xl" style={{ transform: [{ rotate: '-5deg' }] }}>
            🧦
          </Text>
          <Text className="text-2xl" style={{ transform: [{ rotate: '5deg' }] }}>
            🧢
          </Text>
        </View>
      </View>
      <View className="border-t border-border bg-background px-4 py-4">
        <SocialConnections />
      </View>
    </View>
  );
}
