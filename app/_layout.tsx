import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from 'convex/react';
import * as React from 'react';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Routes />
          <PortalHost />
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

void SplashScreen.preventAutoHideAsync();

function Routes() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  React.useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="index" />
        <Stack.Screen name="items/add" options={ADD_ITEM_SCREEN_OPTIONS} />
        <Stack.Screen name="items/edit/[id]" options={EDIT_ITEM_SCREEN_OPTIONS} />
        <Stack.Screen name="items/select/[category]" options={SELECT_ITEM_SCREEN_OPTIONS} />
        <Stack.Screen name="items/wardrobe" options={WARDROBE_SCREEN_OPTIONS} />
        <Stack.Screen name="profile" options={PROFILE_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}
    </Stack>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

// Removed sign-up and password flows; only social sign-in is supported

const ADD_ITEM_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  headerShadowVisible: false,
  gestureEnabled: false,
} as const;

const SELECT_ITEM_SCREEN_OPTIONS = {
  presentation: 'modal',
  headerTransparent: true,
  headerShadowVisible: false,
} as const;

const EDIT_ITEM_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  headerShadowVisible: false,
} as const;

const PROFILE_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  headerShadowVisible: false,
} as const;

const WARDROBE_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  headerShadowVisible: false,
} as const;
