### Mini Wardrobe

Minimal outfit picker and wardrobe tracker built with Expo Router, React Native, Clerk authentication, and Convex for data + file storage. Runs on iOS, Android, and Web.

### What it is

- **Goal**: Quickly catalog clothing, pick a current outfit, and shuffle suggestions.
- **Stack**: Expo (React Native), Expo Router, Clerk, Convex, Nativewind, React Native Reusables.
- **Auth**: Social sign-in via Clerk; app routes are guarded based on Convex auth state.

### Code structure

- **`app/`**: Expo Router screens
  - `index.tsx`: home with current outfit + actions
  - `items/add.tsx`: form to add an item
  - `items/edit/[id].tsx`: form to edit an item
  - `items/select/[category].tsx`: select through items of a same caegory
  - `items/wardrobe.tsx`: see all added items with filter and search
  - `(auth)/sign-in.tsx`: sign-in screen
  - `_layout.tsx`: providers (Clerk, Convex), navigation guards, theming
- **`components/`**: UI and feature components
  - `components/items/*`: components related to items management and dispplay
  - `components/ui/*`: RNR design system primitives (button, text, icon, dialog, etc.)
  - `components/auth/*`: user menu, social connections
- **`convex/`**: Backend schema and functions
  - `schema.ts`: tables `items` and `currentItems` with indices
  - `items.ts`: queries/mutations (add, list, filter, setCurrent, randomize, update, remove, image upload)
  - `auth.config.ts`: Clerk issuer domain for token verification
- **`lib/`**: app utilities and state (e.g., `selection-store.ts`, `theme.ts`)
- **`assets/`**: images and app icons
- **`global.css`**, **`tailwind.config.js`**: styling via Nativewind
- **`tsconfig.json`**: path alias `@/*` to project root (use `@` imports everywhere)

### Architecture notes

- **Navigation & Guards**: `expo-router` with `Stack.Protected` in `app/_layout.tsx`. Auth state comes from `useConvexAuth()` bridged by `ConvexProviderWithClerk` and `ClerkProvider`.
- **Auth**: Clerk in the app; Convex validates requests server-side using the Clerk JWT issuer (`CLERK_JWT_ISSUER_DOMAIN`).
- **Data model**:
  - `items`: wardrobe items; optional `category`, `brand`, `season`, `color`, `size`, `image` (Convex `_storage` id), plus `user_id`.
  - `currentItems`: per-user current selection for each category.
  - Indices for fast per-user and per-category queries.
- **Server functions** (`convex/items.ts`):
  - All endpoints require auth (`ctx.auth.getUserIdentity()`), enforce ownership on read/write, and keep `currentItems` consistent when items change.
  - Image uploads use `ctx.storage.generateUploadUrl()`; clients store the returned `_storage` id on the item.
  - Filters tokenize search across brand/season/color; `randomizeCurrent` picks one item per category.
- **UI**: Nativewind for styling, `react-native-reusables` primitives, icons via `lucide-react-native`.

### Local setup

1) Install prerequisites

- Node 18+ and npm (or pnpm/yarn)
- Xcode (iOS) and/or Android Studio (Android)
- Expo CLI (installed automatically via scripts)

2) Install dependencies

```bash
npm install
```

3) Environment variables (see `.env.example`)

Create `.env.local` in the project root and fill these values:

```bash
# Used by the Expo app (read on the client)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... # Clerk publishable key
EXPO_PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud # or local dev URL

# Used by Convex (server-side only)
CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-issuer-domain> # from Clerk JWT template
```

Notes:
- `EXPO_PUBLIC_*` variables are embedded in the client bundle. Do not put secrets there.
- `CLERK_JWT_ISSUER_DOMAIN` is required by Convex to validate Clerk tokens (see `convex/auth.config.ts`).

4) Convex setup

- Option A: local dev
  - Run `npx convex dev` in a separate terminal. Follow the instructions.
  - Set `CLERK_JWT_ISSUER_DOMAIN` in the Convex Dashboard for that deployment.

1) Start the app

```bash
npm run dev
# iOS simulator: press i
# Android emulator: press a
# Web: press w
```

Convenience scripts:

```bash
npm run ios      # start + open iOS simulator
npm run android  # start + open Android emulator
npm run web      # start web build
npm run clean    # remove .expo and node_modules
```

6) Clerk configuration

- Enable OAuth providers you want (e.g., Apple, GitHub, Google) in Clerk.
- No email/password flows are included in the UI by default.

### Author

William BRISA (contact@williambrisa.fr)