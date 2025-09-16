import { AddItemForm } from '@/components/items/add-item-form';
import { Stack } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function AddItemScreen() {
  return (
    <>
      <Stack.Screen />
      <AddItemForm />
    </>
  );
}
