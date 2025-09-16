import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Id } from '@/convex/_generated/dataModel';
import { Image, Pressable, View, FlatList, Dimensions } from 'react-native';
import * as React from 'react';

export type WardrobeItem = {
  _id: Id<'items'>;
  brand?: string;
  url?: string | null;
  color?: string | null;
  season?: string | null;
};

export function WardrobeGrid({
  items,
  onPressItem,
}: {
  items: WardrobeItem[];
  onPressItem?: (id: Id<'items'>) => void;
}) {
  const numColumns = 2;
  const gap = 12;
  const horizontalPadding = 16;
  const width = Dimensions.get('window').width;
  const cardSize = (width - horizontalPadding * 2 - gap) / numColumns;

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it._id}
      numColumns={numColumns}
      columnWrapperStyle={{ gap }}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 8,
        paddingBottom: 8,
        gap,
      }}
      renderItem={({ item, index }) => {
        const rotation = index % 2 === 0 ? '-2deg' : '2deg';
        return (
          <Pressable
            onPress={() => onPressItem?.(item._id)}
            className="active:opacity-90"
            style={{ width: cardSize, transform: [{ rotate: rotation }] }}>
            <Card className="overflow-hidden p-0">
              <View
                style={{ width: cardSize, height: cardSize }}
                className="items-center justify-center bg-muted">
                {item.url ? (
                  <Image
                    source={{ uri: item.url }}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View className="items-center justify-center p-3">
                    <Text className="text-xs text-muted-foreground">
                      {item.brand || 'No photo'}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}
