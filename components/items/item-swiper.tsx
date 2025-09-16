import { Text } from '@/components/ui/text';
import type { Doc } from '@/convex/_generated/dataModel';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { ItemCard, type ItemWithUrl } from '@/components/items/item-card';
import { useSelectionStore } from '@/lib/selection-store';

type ItemDoc = Doc<'items'>;

export type ItemSwiperProps = {
  category: NonNullable<ItemDoc['category']>;
  title?: string;
  items: ItemWithUrl[];
};

export function ItemSwiper({ category, title, items }: ItemSwiperProps) {
  const selectedId = useSelectionStore((s) => s.getSelected(category));
  const setSelected = useSelectionStore((s) => s.setSelected);
  return (
    <FlatList
      data={items}
      extraData={selectedId}
      keyExtractor={(it) => it._id}
      horizontal
      contentContainerStyle={{
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <ItemCard
          item={item}
          selected={selectedId === item._id}
          onPress={() => setSelected(category, item._id)}
        />
      )}
    />
  );
}
