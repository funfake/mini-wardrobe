import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import * as React from 'react';
import { View } from 'react-native';

export function SquareCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden p-0">
      <AspectRatio ratio={1}>
        <View className="flex-1 items-center justify-center bg-muted">{children}</View>
      </AspectRatio>
    </Card>
  );
}
