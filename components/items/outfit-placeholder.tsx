import { Text } from '@/components/ui/text';
import { PantsIcon, TShirtIcon, SunglassesIcon, SneakerIcon } from 'phosphor-react-native';
import * as React from 'react';
import { View } from 'react-native';

export type OutfitSlot = 'accessories' | 'tops' | 'bottoms' | 'shoes';

export function Placeholder({ slot }: { slot: OutfitSlot }) {
  let Icon: any;
  let label: string;
  switch (slot) {
    case 'accessories':
      Icon = SunglassesIcon;
      label = 'Accessories';
      break;
    case 'tops':
      Icon = TShirtIcon;
      label = 'Tops';
      break;
    case 'bottoms':
      Icon = PantsIcon;
      label = 'Bottoms';
      break;
    case 'shoes':
      Icon = SneakerIcon;
      label = 'Shoes';
      break;
    default:
      return null;
  }
  return (
    <View className="items-center gap-2">
      <Icon size={48} />
      <Text className="text-sm text-muted-foreground">{label}</Text>
    </View>
  );
}
