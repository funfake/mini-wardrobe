import { Button, type ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

type SingleSelectRowProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string; icon?: LucideIcon; className?: string }>;
  value?: T | null;
  onChange: (value: T) => void;
};

export function SingleSelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: SingleSelectRowProps<T>) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[(colorScheme ?? 'light') as 'light' | 'dark'];
  return (
    <View className="gap-1.5">
      <Text className="pl-6 text-sm font-medium text-foreground/80">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingLeft: 24 }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const Icon = opt.icon;
          return (
            <Button
              key={opt.value}
              size="sm"
              variant={isSelected ? 'secondaryOutline' : 'outline'}
              className={cn('px-3', isSelected && 'border-primary')}
              onPress={() => onChange(opt.value)}>
              <View className="flex-row items-center gap-2">
                {Icon ? (
                  <Icon
                    size={16}
                    color={isSelected ? palette.foreground : palette.mutedForeground}
                  />
                ) : null}
                <Text className="text-sm">{opt.label}</Text>
              </View>
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
}

type ColorDotProps = { className?: string } & Omit<ViewProps, 'children'>;

export function ColorDot({ className, ...props }: ColorDotProps) {
  return <View className={cn('size-3 rounded-full border border-border', className)} {...props} />;
}

type ColorSelectRowProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string; className?: string }>;
  value?: T | null;
  onChange: (value: T) => void;
};

export function ColorSelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: ColorSelectRowProps<T>) {
  return (
    <View className="gap-1.5">
      <Text className="pl-6 text-sm font-medium text-foreground/80">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingLeft: 24 }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <Button
              key={opt.value}
              size="sm"
              variant={isSelected ? 'secondaryOutline' : 'outline'}
              className={cn('px-3', isSelected && 'border-primary')}
              onPress={() => onChange(opt.value)}>
              <View className="flex-row items-center gap-2">
                <View className={cn('size-4 rounded-full border border-border', opt.className)} />
                <Text className="text-sm">{opt.label}</Text>
              </View>
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
}
