# Visitor Management — Mobile App

React Native (Expo) app for **iOS and Android**, mirroring the web `frontend/` feature set.

## Stack

- Expo SDK 56, React Native, TypeScript
- React Navigation (role-based stacks)
- TanStack Query, Axios
- AsyncStorage (auth session)
- expo-camera (QR scan)
- react-native-gifted-charts (admin analytics)

## Screens (same as web)

| Role | Screens |
|------|---------|
| **All** | Login, bootstrap redirect |
| **Guard** | Dashboard, register visitor, visitor status, visit detail + QR, entry/exit, scan QR |
| **Resident** | Pending approvals, history, visit detail (approve/reject) |
| **Admin** | Analytics charts, all visits, visit detail |

## Backend URL

API calls use the production backend (hardcoded in `src/config.ts`):

`https://visitor-management-system-6n23.onrender.com/api`

## Logo

Home-screen and splash icons use **MS** on slate (`#0f172a`), matching the web app. Regenerate assets:

```bash
npm run generate-icons
```

## Run

```bash
cd app
npm install
npm start
```

Then press `i` (iOS simulator) or `a` (Android emulator), or scan the QR code with Expo Go.

```bash
npm run ios
npm run android
```

## Demo accounts

Same as the web app:

- `guard@shuklamanya99.com` / `guard123`
- `resident1@shuklamanya99.com` / `resident123`
- `admin@shuklamanya99.com` / `admin123`
