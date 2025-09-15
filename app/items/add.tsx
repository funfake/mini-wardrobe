import { AddItemForm } from '@/components/items/add-item-form';
import { Stack } from 'expo-router';
import * as React from 'react';

export default function AddItemScreen() {
  return (
    <>
      {/* <Stack.Screen /> is necessary to allow per-screen options (e.g., modal presentation, custom header) to be set for this route via the Stack.Screen component. Without it, the screen will not receive any custom navigation options defined in the layout or here. */}
      <Stack.Screen />
      <AddItemForm />
    </>
  );
}
