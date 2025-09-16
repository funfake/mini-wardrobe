import * as React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { WardrobeFiltersBar, type WardrobeFilters } from '@/components/items/wardrobe-filters';
import { SelectionBar, type SelectionBarProps } from '@/components/items/selection-bar';

type ButtonsVariantProps = {
  variant: 'buttons';
  buttons: React.ReactNode;
};

type FiltersVariantProps = {
  variant: 'filters';
  filtersProps: {
    value: WardrobeFilters;
    onChange: (next: WardrobeFilters) => void;
  };
};

type SelectionVariantProps = {
  variant: 'selection';
  selectionProps: SelectionBarProps;
};

type CommonProps = {
  children: React.ReactNode;
  topSafe?: boolean;
};

export type BottomBarLayoutProps = CommonProps &
  (ButtonsVariantProps | FiltersVariantProps | SelectionVariantProps);

export function BottomBarLayout(props: BottomBarLayoutProps) {
  const { children, topSafe } = props;

  return (
    <View className={(topSafe ? 'py-safe ' : 'pb-safe ') + 'flex-1'}>
      <View className="flex-1">{children}</View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        {props.variant === 'buttons' ? (
          <View className="border-t border-border bg-background px-4 py-4">
            <View className="flex-row items-center gap-3">{props.buttons}</View>
          </View>
        ) : props.variant === 'filters' ? (
          <WardrobeFiltersBar
            value={props.filtersProps.value}
            onChange={props.filtersProps.onChange}
          />
        ) : (
          <SelectionBar {...props.selectionProps} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
