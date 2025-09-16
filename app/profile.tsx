import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { LogOutIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { initials, imageSource, userName, email } = React.useMemo(() => {
    const userName = user?.fullName || user?.username || 'Unknown';
    const email = user?.emailAddresses?.[0]?.emailAddress || '';
    const initials = (user?.fullName || email || 'U')
      .split(' ')
      .map((name) => name[0])
      .join('');
    const imageSource = user?.imageUrl ? { uri: user.imageUrl } : undefined;
    return { initials, imageSource, userName, email };
  }, [user?.fullName, user?.username, user?.emailAddresses, user?.imageUrl]);

  async function onSignOut() {
    await signOut();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
      <View className="py-safe flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm items-center gap-4">
          <Avatar alt={`${userName}'s avatar`} className="size-24">
            <AvatarImage source={imageSource} />
            <AvatarFallback>
              <Text className="text-2xl font-medium">{initials}</Text>
            </AvatarFallback>
          </Avatar>
          {!!email && <Text className="text-base text-muted-foreground">{email}</Text>}
          <Button className="mt-2 w-full" onPress={onSignOut}>
            <Icon as={LogOutIcon} className="size-4" />
            <Text>Sign Out</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
