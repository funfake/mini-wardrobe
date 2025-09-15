import { Button, type ButtonProps } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useColorScheme } from 'nativewind';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import * as React from 'react';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

type ThemeToggleProps = {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
};

export function ThemeToggle({ variant = 'ghost', size = 'icon', className }: ThemeToggleProps) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const IconComponent = THEME_ICONS[colorScheme ?? 'light'];
  const iconSizeClass = size === 'icon' ? 'size-6' : 'size-4';

  return (
    <Button onPress={toggleColorScheme} size={size} variant={variant} className={className}>
      <Icon as={IconComponent} className={iconSizeClass} />
    </Button>
  );
}

export default ThemeToggle;
