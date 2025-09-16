import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';
import { ScrollView } from 'react-native';

type ColorDotProps = { className?: string } & Omit<ViewProps, 'children'>;

export function ColorDot({ className, ...props }: ColorDotProps) {
  return <View className={cn('size-3 rounded-full border border-border', className)} {...props} />;
}

type ColorSelectRowProps<T extends string> = {
  label?: string;
  options: Array<{ value: T; label: string; className?: string }>;
  value?: T | null;
  leftPadding?: boolean;
  onChange: (value: T) => void;
  onClear?: () => void;
};

export function ColorSelectRow<T extends string>({
  label,
  options,
  value,
  leftPadding = true,
  onChange,
  onClear,
}: ColorSelectRowProps<T>) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className={cn('text-sm font-medium text-foreground/80', leftPadding && 'pl-6')}>
          {label}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingLeft: leftPadding ? 24 : 0 }}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <Button
              key={opt.value}
              size="sm"
              variant={isSelected ? 'secondaryOutline' : 'outline'}
              className={cn('px-3', isSelected && 'border-primary')}
              onPress={() => {
                if (isSelected && onClear) {
                  onClear();
                } else {
                  onChange(opt.value);
                }
              }}>
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
