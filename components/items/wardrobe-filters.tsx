import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { SingleSelectRow } from '@/components/items/single-select-row';
import { ColorSelectRow } from '@/components/items/color-select-row';
import { COLOR_OPTIONS, SEASON_OPTIONS } from '@/components/items/options';
import * as React from 'react';
import { View } from 'react-native';

export type WardrobeFilters = {
  search: string;
  season: (typeof SEASON_OPTIONS)[number]['value'] | null;
  color: (typeof COLOR_OPTIONS)[number]['value'] | null;
};

export function WardrobeFiltersBar({
  value,
  onChange,
}: {
  value: WardrobeFilters;
  onChange: (next: WardrobeFilters) => void;
}) {
  return (
    <View className="gap-3 border-t border-border bg-background px-4 py-4">
      <View className="gap-1.5">
        <Input
          placeholder="Search brand, season, color"
          value={value.search}
          onChangeText={(t) => onChange({ ...value, search: t })}
          returnKeyType="search"
        />
      </View>

      <SingleSelectRow
        options={SEASON_OPTIONS}
        value={value.season}
        leftPadding={false}
        onChange={(season) => onChange({ ...value, season })}
        onClear={() => onChange({ ...value, season: null })}
      />

      <ColorSelectRow
        options={COLOR_OPTIONS}
        value={value.color}
        leftPadding={false}
        onChange={(color) => onChange({ ...value, color })}
        onClear={() => onChange({ ...value, color: null })}
      />
    </View>
  );
}
