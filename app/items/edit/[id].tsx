import { AddItemForm } from '@/components/items/add-item-form';
import { Stack, useLocalSearchParams } from 'expo-router';
import type { Id } from '@/convex/_generated/dataModel';
import * as React from 'react';

export default function EditItemScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const itemId = params.id as Id<'items'>;
  return (
    <>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerShadowVisible: false }} />
      <AddItemForm itemId={itemId} />
    </>
  );
}
