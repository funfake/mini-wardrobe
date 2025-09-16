import { Text } from '@/components/ui/text';
import { Stack, router } from 'expo-router';
import * as React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { WardrobeGrid } from '@/components/items/wardrobe-grid';
import { WardrobeFiltersBar, type WardrobeFilters } from '@/components/items/wardrobe-filters';
import { SelectionBar } from '@/components/items/selection-bar';
import type { Id } from '@/convex/_generated/dataModel';

export default function WardrobeScreen() {
  const [filters, setFilters] = React.useState<WardrobeFilters>({
    search: '',
    season: null,
    color: null,
  });
  const [debounced, setDebounced] = React.useState<WardrobeFilters>(filters);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(filters), 300);
    return () => clearTimeout(id);
  }, [filters]);

  const items = useQuery(
    api.items.listAllWithFilters as any,
    {
      search: debounced.search || undefined,
      season: debounced.season || undefined,
      color: debounced.color || undefined,
    } as any
  );

  const [selectedId, setSelectedId] = React.useState<Id<'items'> | null>(null);
  const remove = useMutation(api.items.remove);

  const selectedItem = React.useMemo(() => {
    if (!items || !selectedId) return null;
    return (items as any[]).find((it) => it._id === selectedId) ?? null;
  }, [items, selectedId]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Wardrobe',
          presentation: 'modal',
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
      <View className="py-safe flex-1">
        <View className="flex-1">
          {items === undefined ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted-foreground">Loading...</Text>
            </View>
          ) : (
            <WardrobeGrid items={(items as any) ?? []} onPressItem={(id) => setSelectedId(id)} />
          )}
        </View>
        {selectedItem ? (
          <SelectionBar
            selected={selectedItem as any}
            hidePrimary
            onClear={() => setSelectedId(null)}
            onEdit={() => {
              if (!selectedId) return;
              router.push(`/items/edit/${selectedId}`);
            }}
            onDelete={async () => {
              if (!selectedId) return;
              await remove({ id: selectedId });
              setSelectedId(null);
            }}
          />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <WardrobeFiltersBar value={filters} onChange={setFilters} />
          </KeyboardAvoidingView>
        )}
      </View>
    </>
  );
}
