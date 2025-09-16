import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Icon } from '@/components/ui/icon';
import { SingleSelectRow } from '@/components/items/single-select-row';
import { ColorSelectRow } from '@/components/items/color-select-row';
import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Image, Platform, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { uploadAsync as uploadFileAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { Camera, Trash2 } from 'lucide-react-native';
import { CATEGORY_OPTIONS, COLOR_OPTIONS, SEASON_OPTIONS } from '@/components/items/options';
import { BottomBarLayout } from '@/components/bottom-bar-layout';

import type { Doc } from '@/convex/_generated/dataModel';

type InsertItemInput = Partial<Omit<Doc<'items'>, 'user_id' | '_id' | '_creationTime'>>;
type ItemDoc = Doc<'items'>;
type ItemCategory = NonNullable<ItemDoc['category']>;

export function AddItemForm({ itemId }: { itemId?: Id<'items'> }) {
  const { user, isLoaded } = useUser();
  const params = useLocalSearchParams<{ category?: string }>();
  const urlCategory = React.useMemo<ItemCategory | null>(() => {
    const allowed = new Set(CATEGORY_OPTIONS.map((o) => o.value));
    const v = (params.category || '').toString();
    return allowed.has(v as ItemCategory) ? (v as ItemCategory) : null;
  }, [params.category]);
  const [form, setForm] = React.useState<InsertItemInput>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const [imagePreviewUri, setImagePreviewUri] = React.useState<string | null>(null);
  const [imageBase64, setImageBase64] = React.useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = React.useState<string>('image/jpeg');
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);
  const addItem = useMutation(api.items.add);
  const updateItem = useMutation(api.items.update);

  const isEditMode = !!itemId;
  const existing = useQuery(
    api.items.getByIdWithUrl as any,
    itemId ? ({ id: itemId } as any) : 'skip'
  ) as (Doc<'items'> & { _id: Id<'items'>; url?: string | null }) | undefined | null;

  React.useEffect(() => {
    if (!isEditMode || !existing) return;
    setForm({
      category: existing.category,
      brand: existing.brand,
      season: existing.season,
      color: existing.color,
      image: existing.image,
      size: existing.size,
    });
    if (existing.url) setImagePreviewUri(existing.url);
  }, [isEditMode, existing?._id]);

  // Prefill category from URL when creating a new item
  React.useEffect(() => {
    if (isEditMode) return;
    if (urlCategory && !form.category) {
      setForm((prev) => ({ ...prev, category: urlCategory }));
    }
  }, [isEditMode, urlCategory, form.category]);

  // Centralized crop aspect for easy customization
  const CROP_ASPECT: [number, number] = [1, 1];

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
        allowsEditing: true,
        aspect: CROP_ASPECT,
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
        allowsEditing: true,
        aspect: CROP_ASPECT,
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

    if (Platform.OS === 'web') {
      let blob: Blob;
      try {
        const resp = await fetch(imagePreviewUri);
        blob = await resp.blob();
      } catch (_e) {
        if (imageBase64) {
          const byteChars = atob(imageBase64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: imageMimeType });
        } else {
          throw new Error('Could not read image data');
        }
      }

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': imageMimeType,
          'Content-Disposition': `inline; filename="${fileName}"`,
        },
        body: blob,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };
      return storageId;
    }

    const result = await uploadFileAsync(uploadUrl, imagePreviewUri, {
      httpMethod: 'POST',
      headers: {
        'Content-Type': imageMimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
      uploadType: FileSystemUploadType.BINARY_CONTENT,
    });
    if (result.status !== 200) {
      throw new Error(result.body || 'Upload failed');
    }
    const { storageId } = JSON.parse(result.body) as { storageId: Id<'_storage'> };
    return storageId;
  }

  async function onSubmit() {
    if (!isLoaded || !user) return;
    if (!form.category) {
      setError('Please select a category');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      let storageId: Id<'_storage'> | null = null;
      if (imagePreviewUri && !form.image) {
        storageId = await uploadImageIfNeeded();
      }

      if (isEditMode && itemId) {
        await updateItem({
          id: itemId,
          category: form.category || undefined,
          brand: form.brand || undefined,
          season: form.season || undefined,
          color: form.color || undefined,
          image: storageId || undefined,
          size: form.size || undefined,
        } as any);
      } else {
        await addItem({
          category: form.category || undefined,
          brand: form.brand || undefined,
          season: form.season || undefined,
          color: form.color || undefined,
          image: storageId || undefined,
          size: form.size || undefined,
        });
      }

      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomBarLayout
      variant="buttons"
      buttons={
        <>
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
          {isEditMode ? (
            <Button variant="outline" disabled={submitting} onPress={() => router.back()}>
              <Text>Cancel</Text>
            </Button>
          ) : null}
          <Button
            className="flex-1"
            disabled={submitting || !isLoaded || !form.category}
            onPress={onSubmit}>
            <Text>
              {submitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Saving...'
                : isEditMode
                  ? 'Update item'
                  : 'Save item'}
            </Text>
          </Button>
        </>
      }>
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
                    <AspectRatio ratio={1}>
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
                    key={`brand-${existing?._id ?? 'new'}`}
                    id="brand"
                    value={form.brand ?? ''}
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
                    key={`size-${existing?._id ?? 'new'}`}
                    id="size"
                    value={form.size ?? ''}
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
    </BottomBarLayout>
  );
}
