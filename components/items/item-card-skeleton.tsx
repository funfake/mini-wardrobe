import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';
import { View } from 'react-native';

export function ItemCardSkeleton() {
  return (
    <Card className="w-36 overflow-hidden p-0">
      <AspectRatio ratio={1}>
        <View className="flex-1">
          <Skeleton className="h-full w-full" />
        </View>
      </AspectRatio>
    </Card>
  );
}
