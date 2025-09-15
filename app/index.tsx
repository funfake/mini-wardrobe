import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';

const SCREEN_OPTIONS = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row items-center justify-between px-4 py-4 web:mx-2">
      <Text className="font-bold" variant="h3">
        My Wardrobe
      </Text>
      <UserMenu />
    </View>
  ),
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <Link href="/items/add" asChild>
          <Button>
            <Text>Add item</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
