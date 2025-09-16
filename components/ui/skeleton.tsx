import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

export type SkeletonProps = ViewProps & { className?: string };

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <View className={cn('animate-pulse rounded-md bg-muted', className)} style={style} {...props} />
  );
}
