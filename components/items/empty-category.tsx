import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

export function EmptyCategory({ label }: { label: string }) {
  return (
    <View className="items-center justify-center py-4">
      <View className="w-48">
        <AspectRatio ratio={1}>
          <Card className="h-full w-full items-center justify-center border-dashed">
            <View className="items-center justify-center p-4">
              <Text className="text-center text-muted-foreground">No {label} yet</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground">
                Add items to start
              </Text>
            </View>
          </Card>
        </AspectRatio>
      </View>
    </View>
  );
}
