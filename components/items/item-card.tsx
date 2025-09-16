import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';
import type { Doc } from '@/convex/_generated/dataModel';
import * as React from 'react';
import { Image, Pressable, View } from 'react-native';
import { AlertDialog } from '@/components/ui/alert-dialog';

type ItemDoc = Doc<'items'>;
export type ItemWithUrl = ItemDoc & { url?: string | null };

export function ItemCard({
  item,
  selected,
  onPress,
}: {
  item: ItemWithUrl;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="mr-3" accessibilityRole="button">
      <Card className={`w-72 overflow-hidden p-0 ${selected ? 'border-primary' : ''}`}>
        <AspectRatio ratio={1}>
          <View className="flex-1 items-center justify-center bg-muted">
            {item.url ? (
              <Image
                source={{ uri: item.url }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View className="items-center justify-center">
                <Text className="text-xs text-muted-foreground">{item.brand || 'No photo'}</Text>
              </View>
            )}
          </View>
        </AspectRatio>
      </Card>
      {/* Actions moved to context area below the swiper */}
      <AlertDialog open={false} onOpenChange={() => {}} />
    </Pressable>
  );
}
