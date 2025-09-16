import { SquareCard } from '@/components/items/square-card';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as React from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Placeholder, type OutfitSlot } from '@/components/items/outfit-placeholder';

export function CurrentOutfit() {
  const data = useQuery(api.items.getCurrentWithUrls, {});
  const order: OutfitSlot[] = ['accessories', 'tops', 'bottoms', 'shoes'];

  return (
    <View className="w-1/2 px-4 py-4">
      {order.map((slot, index) => {
        const item = (data as any)?.[slot] as { url?: string } | null | undefined;
        const hasImage = !!item?.url;
        const rotation = index % 2 === 0 ? '3deg' : '-3deg';
        return (
          <Pressable
            key={slot}
            onPress={() => router.push(`/items/select/${slot}`)}
            className={`relative w-4/5 ${index % 2 === 0 ? 'self-start' : 'self-end'} ${index > 0 ? '-mt-3' : ''}`}
            style={{ zIndex: order.length - index, transform: [{ rotate: rotation }] }}>
            <SquareCard>
              {hasImage ? (
                <Image
                  source={{ uri: item!.url as string }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Placeholder slot={slot} />
              )}
            </SquareCard>
          </Pressable>
        );
      })}
    </View>
  );
}
