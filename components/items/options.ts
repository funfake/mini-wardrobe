import type { LucideIcon } from 'lucide-react-native';
import type { Doc } from '../../convex/_generated/dataModel';
import {
  CloudRainWind,
  Shirt,
  BetweenVerticalStart,
  HandCoins,
  Footprints,
  Sun,
  Leaf,
  Snowflake,
  CloudSun,
  Palette,
  Circle,
} from 'lucide-react-native';

type ItemDoc = Doc<'items'>;
export type ItemCategory = NonNullable<ItemDoc['category']>;
export type ItemSeason = NonNullable<ItemDoc['season']>;
export type ItemColor = NonNullable<ItemDoc['color']>;

export type Option<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  className?: string;
};

export const CATEGORY_OPTIONS: Option<ItemCategory>[] = [
  { value: 'jackets', label: 'Jackets', icon: CloudRainWind },
  { value: 'tops', label: 'Tops', icon: Shirt },
  { value: 'bottoms', label: 'Bottoms', icon: BetweenVerticalStart },
  { value: 'shoes', label: 'Shoes', icon: Footprints },
  { value: 'accessories', label: 'Accessories', icon: HandCoins },
];

export const SEASON_OPTIONS: Option<ItemSeason>[] = [
  { value: 'spring', label: 'Spring', icon: Leaf },
  { value: 'summer', label: 'Summer', icon: Sun },
  { value: 'autumn', label: 'Autumn', icon: CloudSun },
  { value: 'winter', label: 'Winter', icon: Snowflake },
];

export const COLOR_OPTIONS: Option<ItemColor>[] = [
  { value: 'black', label: 'Black', className: 'bg-black' },
  { value: 'white', label: 'White', className: 'bg-white border' },
  { value: 'gray', label: 'Gray', className: 'bg-gray-500' },
  { value: 'navy', label: 'Navy', className: 'bg-blue-900' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { value: 'red', label: 'Red', className: 'bg-red-500' },
  { value: 'green', label: 'Green', className: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
  { value: 'brown', label: 'Brown', className: 'bg-amber-800' },
  { value: 'beige', label: 'Beige', className: 'bg-amber-200' },
  { value: 'pink', label: 'Pink', className: 'bg-pink-400' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', className: 'bg-orange-500' },
  { value: 'olive', label: 'Olive', className: 'bg-lime-800' },
];


