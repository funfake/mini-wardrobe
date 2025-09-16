import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ItemSwiper } from '@/components/items/item-swiper';
import { ItemCardSkeleton } from '@/components/items/item-card-skeleton';
import { EmptyCategory } from '@/components/items/empty-category';
import { CATEGORY_OPTIONS } from '@/components/items/options';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Plus, Pencil, Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelectionStore } from '@/lib/selection-store';
import { View } from 'react-native';
import { Separator } from '@/components/ui/separator';
import { SelectionBar } from '@/components/items/selection-bar';

type ItemDoc = Doc<'items'>;
type ItemCategory = NonNullable<ItemDoc['category']>;

export default function SelectByCategoryScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const category = useMemo<ItemCategory | null>(() => {
    const allowed = new Set(CATEGORY_OPTIONS.map((o) => o.value));
    const v = (params.category || '').toString();
    return allowed.has(v as ItemCategory) ? (v as ItemCategory) : null;
  }, [params.category]);

  const initializedRef = useRef<string | null>(null);
  const getSelected = useSelectionStore((s) => s.getSelected);
  const setSelected = useSelectionStore((s) => s.setSelected);

  const items = useQuery(api.items.listByCategory, category ? { category } : 'skip');
  const setCurrent = useMutation(api.items.setCurrent);
  const remove = useMutation(api.items.remove);

  const title =
    'Select ' + (category ? (CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? '') : '');
  // Initialize selection once from the first item (server puts current first)
  useEffect(() => {
    if (!category || !items || items.length === 0) return;
    const key = category;
    if (initializedRef.current !== key) {
      setSelected(category, items[0]._id as Id<'items'>);
      initializedRef.current = key;
    }
  }, [category, items]);

  // Determine selected item object for info pills
  const selectedId = useSelectionStore((s) =>
    s.getSelected(category || 'accessories')
  ) as Id<'items'> | null;
  const selectedItem = (items || []).find((it) => it._id === selectedId) as
    | (Doc<'items'> & { _id: Id<'items'> })
    | undefined;

  return (
    <>
      <Stack.Screen
        options={{
          title,
        }}
      />
      <View className="py-safe flex-1">
        {/* Item Swiper */}
        <View className="flex-1 items-center justify-center" style={{ minHeight: 0 }}>
          {/* 1. No category found */}
          {/* 2. Loading */}
          {/* 3. Empty category */}
          {/* 4. Item Swiper */}
          {!category ? (
            <View className="px-6">
              <Text className="text-center text-sm text-muted-foreground">No category found.</Text>
            </View>
          ) : items === undefined ? (
            <View className="px-4 py-4">
              <View className="flex-row">
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} className="mr-3">
                    <ItemCardSkeleton />
                  </View>
                ))}
              </View>
            </View>
          ) : items.length === 0 ? (
            <EmptyCategory label={category} />
          ) : (
            <ItemSwiper category={category} items={items as any} />
          )}
        </View>
        {/* Bottom context and actions */}
        <SelectionBar
          selected={selectedItem ?? null}
          onAdd={() => {
            if (!category) return;
            router.push({ pathname: '/items/add', params: { category } as any });
          }}
          onEdit={() => {
            if (!selectedId) return;
            router.push(`/items/edit/${selectedId}`);
          }}
          onDelete={async () => {
            if (!selectedId) return;
            await remove({ id: selectedId });
          }}
          onSelect={async () => {
            if (!category || !selectedId) return;
            await setCurrent({ category, itemId: selectedId });
            router.back();
          }}
          primaryDisabled={
            !category || items === undefined || (items?.length ?? 0) === 0 || !selectedId
          }
        />
      </View>
    </>
  );
}
