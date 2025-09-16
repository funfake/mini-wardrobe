import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { Link, router, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { CurrentOutfit } from '@/components/items/current-outfit';
import { Icon } from '@/components/ui/icon';
import { Camera, Grip, Shuffle } from 'lucide-react-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const SCREEN_OPTIONS = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row items-center justify-between px-4 py-4 web:mx-2">
      <Text className="font-bold" variant="h3">
        Outfits
      </Text>
      <UserMenu />
    </View>
  ),
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();
  const randomize = useMutation(api.items.randomizeCurrent);

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="py-safe flex-1" /* pb-safe ensures safe area bottom padding */>
        <View className="flex-1 items-center justify-center">
          <CurrentOutfit />
        </View>
        <View className="border-t border-border bg-background px-4 py-4">
          <View className="flex-row items-center gap-3">
            <Link href="/items/wardrobe" asChild>
              <Button variant="outline">
                <Icon as={Grip} size={16} />
                {/* <Text>View all</Text> */}
              </Button>
            </Link>
            <Button variant="outline" onPress={() => void randomize({})}>
              <Icon as={Shuffle} size={16} />
            </Button>
            <Link href="/items/add" asChild>
              <Button className="flex-1">
                <Icon as={Camera} size={16} />
                <Text>Add item</Text>
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}
