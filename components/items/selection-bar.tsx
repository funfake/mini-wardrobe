import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
// Replaced custom alert dialog with native Alert API for reliability on Reanimated v4
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { ArrowLeft, Camera, Pencil, Trash2, X } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { CATEGORY_OPTIONS, COLOR_OPTIONS, SEASON_OPTIONS } from '@/components/items/options';
import { Separator } from '@/components/ui/separator';

type ItemDoc = Doc<'items'>;

export type SelectionBarProps = {
  selected: (Doc<'items'> & { _id: Id<'items'> }) | null | undefined;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onSelect?: () => Promise<void>;
  primaryDisabled?: boolean;
  hidePrimary?: boolean;
  onClear?: () => void;
};

export function SelectionBar({
  selected,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
  primaryDisabled,
  hidePrimary,
  onClear,
}: SelectionBarProps) {
  const seasonLabel = selected?.season
    ? SEASON_OPTIONS.find((s) => s.value === selected.season)?.label
    : undefined;
  const colorLabel = selected?.color
    ? COLOR_OPTIONS.find((c) => c.value === selected.color)?.label
    : undefined;

  return (
    <View className="gap-4 border-t border-border bg-background px-4 py-4">
      {/* Item info */}
      <View className="gap-1 px-1">
        {selected ? (
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-medium">{selected.brand || 'No brand'}</Text>
            {selected.size ? (
              <View className="rounded-md border border-border px-2 py-0.5">
                <Text className="text-xs">{selected.size}</Text>
              </View>
            ) : null}
            {/* chips */}
            {seasonLabel ? (
              <View className="rounded-md border border-border px-2 py-0.5">
                <Text className="text-xs">{seasonLabel}</Text>
              </View>
            ) : null}
            {colorLabel ? (
              <View className="rounded-md border border-border px-2 py-0.5">
                <Text className="text-xs">{colorLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text className="text-sm text-muted-foreground">'Pick an item to continue'</Text>
        )}
      </View>

      {/* Action row */}
      <View className="flex-row items-center gap-3">
        {hidePrimary && onClear ? (
          <>
            <Button variant="outline" onPress={onClear}>
              <Icon as={ArrowLeft} size={14} />
              <Text>Back to filters</Text>
            </Button>
            <Separator orientation="vertical" />
          </>
        ) : null}
        {hidePrimary ? null : (
          <>
            <Button variant="outline" onPress={onAdd}>
              <Icon as={Camera} size={14} />
              <Text>Add</Text>
            </Button>
            <Separator orientation="vertical" />
          </>
        )}
        <View className="flex-row items-center gap-2">
          <Button variant="outline" disabled={!selected} onPress={onEdit}>
            <Icon as={Pencil} size={14} />
            <Text>Edit</Text>
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!selected}
            onPress={() => {
              Alert.alert('Delete item?', 'This action cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    void onDelete?.();
                  },
                },
              ]);
            }}>
            <Icon as={Trash2} size={14} />
          </Button>
        </View>
        {hidePrimary ? null : (
          <>
            <Separator orientation="vertical" />
            <Button className="flex-1" disabled={primaryDisabled} onPress={onSelect}>
              <Text>Select</Text>
            </Button>
          </>
        )}
      </View>
    </View>
  );
}
