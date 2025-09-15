import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Icon } from '@/components/ui/icon';
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  SEASON_OPTIONS,
  type ItemCategory,
  type ItemColor,
  type ItemSeason,
} from '@/components/items/options';
import { ColorSelectRow, SingleSelectRow } from '@/components/items/single-select-row';
import { useUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { router } from 'expo-router';
import * as React from 'react';
import { Image, Platform, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2 } from 'lucide-react-native';

type InsertItemInput = {
  category?: ItemCategory;
  brand?: string;
  season?: ItemSeason;
  color?: ItemColor;
  image?: string;
  size?: string;
};

export function AddItemForm() {
  const { user, isLoaded } = useUser();
  const [form, setForm] = React.useState<InsertItemInput>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const [imagePreviewUri, setImagePreviewUri] = React.useState<string | null>(null);
  const [imageBase64, setImageBase64] = React.useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = React.useState<string>('image/jpeg');
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);
  const addItem = useMutation(api.items.add);

  function updateField<Key extends keyof InsertItemInput>(key: Key, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // no base64->Blob on RN; use FormData with file uri

  async function takePhoto() {
    try {
      if (Platform.OS === 'web') {
        setError('Camera capture is not supported on web');
        return;
      }

      if (!cameraPermission?.granted) {
        const { granted } = await requestCameraPermission();
        if (!granted) {
          setError('Camera permission is required');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        base64: true,
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      setImagePreviewUri(asset.uri);
      // Prefer explicit mimeType if present; fall back to jpg
      const maybeMime = (asset as unknown as { mimeType?: string }).mimeType;
      const mime: string | undefined =
        maybeMime || (asset.type === 'image' ? 'image/jpeg' : undefined);
      setImageMimeType(mime || 'image/jpeg');
      setImageBase64(asset.base64 ?? null);
      // Clear any previously selected storage path in form
      setForm((prev) => ({ ...prev, image: undefined }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open camera');
    }
  }

  async function pickFromLibrary() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      setImagePreviewUri(asset.uri);
      const maybeMime = (asset as unknown as { mimeType?: string }).mimeType;
      const mime: string | undefined =
        maybeMime || (asset.type === 'image' ? 'image/jpeg' : undefined);
      setImageMimeType(mime || 'image/jpeg');
      setImageBase64(asset.base64 ?? null);
      setForm((prev) => ({ ...prev, image: undefined }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open gallery');
    }
  }

  function inferExtensionFromMime(mime: string) {
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    return 'jpg';
  }

  async function uploadImageIfNeeded(): Promise<Id<'_storage'> | null> {
    if (!imagePreviewUri) return null;
    const uploadUrl = await generateUploadUrl();
    const ext = inferExtensionFromMime(imageMimeType);
    const fileName = `item_${Date.now()}.${ext}`;
    const form = new FormData();
    form.append('file', {
      uri: imagePreviewUri,
      name: fileName,
      type: imageMimeType,
    } as any);
    const res = await fetch(uploadUrl, { method: 'POST', body: form as any });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Upload failed');
    }
    const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };
    return storageId;
  }

  async function onSubmit() {
    if (!isLoaded || !user) return;
    setSubmitting(true);
    setError('');
    try {
      let storageId: Id<'_storage'> | null = null;
      if (imagePreviewUri && !form.image) {
        storageId = await uploadImageIfNeeded();
      }

      await addItem({
        category: form.category || undefined,
        brand: form.brand || undefined,
        season: form.season || undefined,
        color: form.color || undefined,
        image: storageId || undefined,
        size: form.size || undefined,
      });

      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="pb-safe flex-1" /* pb-safe ensures safe area bottom padding */>
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
            {/* <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Add item</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Fill in optional details and save to your wardrobe
          </CardDescription>
        </CardHeader> */}

            <CardContent className="px-0">
              <View className="gap-6">
                <View className="items-center gap-3 px-6">
                  <View className="w-48">
                    <AspectRatio>
                      {imagePreviewUri ? (
                        <Image
                          source={{ uri: imagePreviewUri }}
                          className="h-full w-full rounded-md border border-border bg-accent"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="h-full w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
                          <Icon as={Camera} size={42} className="text-muted-foreground" />
                          <Text className="mt-2 text-xs text-muted-foreground">
                            No photo selected
                          </Text>
                        </View>
                      )}
                    </AspectRatio>
                  </View>
                  <View className="flex-row gap-2 px-6">
                    <Button size="sm" onPress={takePhoto} disabled={submitting}>
                      <Text>{imagePreviewUri ? 'Retake photo' : 'Take photo'}</Text>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={pickFromLibrary}
                      disabled={submitting}>
                      <Text>Choose from library</Text>
                    </Button>
                  </View>
                </View>
                <View className="gap-1.5">
                  <SingleSelectRow
                    label="Category"
                    options={CATEGORY_OPTIONS}
                    value={form.category ?? null}
                    onChange={(v) => updateField('category', v)}
                  />
                </View>
                <View className="gap-1.5 px-6">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    onChangeText={(v) => updateField('brand', v)}
                    returnKeyType="next"
                  />
                </View>
                <View className="gap-1.5">
                  <SingleSelectRow
                    label="Season"
                    options={SEASON_OPTIONS}
                    value={form.season ?? null}
                    onChange={(v) => updateField('season', v)}
                  />
                </View>
                <View className="gap-1.5">
                  <ColorSelectRow
                    label="Color"
                    options={COLOR_OPTIONS}
                    value={form.color ?? null}
                    onChange={(v) => updateField('color', v)}
                  />
                </View>
                <View className="gap-1.5 px-6">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    onChangeText={(v) => updateField('size', v)}
                    returnKeyType="next"
                  />
                </View>

                {!error ? null : (
                  <Text className="px-6 text-center text-sm font-medium text-destructive">
                    {error}
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </View>
      <View className="border-t border-border bg-background px-4 py-4">
        <View className="flex-row items-center gap-3">
          <Button
            variant="outline"
            disabled={submitting}
            onPress={async () => {
              setImagePreviewUri(null);
              setImageBase64(null);
              setForm((prev) => ({ ...prev, image: undefined }));
              router.back();
            }}>
            <Icon as={Trash2} size={16} />
          </Button>
          <Button className="flex-1" disabled={submitting || !isLoaded} onPress={onSubmit}>
            <Text>{submitting ? 'Saving...' : 'Save item'}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
