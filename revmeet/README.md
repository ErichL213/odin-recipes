# RevMeet

Cross-platform iOS & Android app for the car community. Find car events, discover photo spots, and share driving routes — all plotted on a live map.

## Features

- **Car Events** — Browse upcoming meetups, car shows, cruises, and track days on a map. RSVP with one tap.
- **Photo Spots** — Tag and discover locations great for car photography. Upload photos and rate spots.
- **Driving Routes** — Share and explore great roads. Plot waypoints on a map, log distance and duration.
- **Auth** — Email/password sign-up via Firebase Auth.

## Stack

| Layer | Tech |
|-------|------|
| Framework | React Native + Expo (SDK 51) |
| Routing | Expo Router (file-based) |
| Maps | react-native-maps (Google Maps provider) |
| Backend | Firebase (Auth + Firestore + Storage) |
| Language | TypeScript |

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for local dev), or Xcode/Android Studio for simulators

### 2. Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (start in test mode, then apply `firestore.rules`)
4. Enable **Storage**
5. Add an iOS and Android app, download config files
6. Copy your web config values

### 3. Google Maps API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Maps SDK for Android** and **Maps SDK for iOS**
3. Create an API key and restrict it to your app bundle IDs

### 4. Environment

```bash
cp .env.example .env
# Fill in your Firebase and Google Maps keys
```

Update `app.json` → `android.config.googleMaps.apiKey` with your Android key.

For iOS, add your key in `AppDelegate.m`:
```objc
[GMSServices provideAPIKey:@"YOUR_IOS_GOOGLE_MAPS_API_KEY"];
```

### 5. Install & run

```bash
cd revmeet
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## Project Structure

```
revmeet/
├── app/
│   ├── _layout.tsx          # Root layout + auth guard
│   ├── (auth)/              # Login & register screens
│   ├── (tabs)/              # Bottom tab screens (events, spots, routes, profile)
│   ├── event/[id].tsx       # Event detail modal
│   ├── spot/[id].tsx        # Spot detail modal
│   ├── route/[id].tsx       # Route detail modal
│   ├── create-event.tsx     # Create event modal
│   ├── create-spot.tsx      # Create spot modal
│   └── create-route.tsx     # Create route modal
├── lib/
│   ├── firebase.ts          # Firebase init
│   ├── events.ts            # Firestore CRUD for events
│   ├── spots.ts             # Firestore CRUD + photo upload for spots
│   └── routes.ts            # Firestore CRUD for routes
├── hooks/
│   ├── useAuth.ts           # Firebase Auth state
│   └── useLocation.ts       # Expo Location GPS
├── types/index.ts           # Shared TypeScript types
├── constants/colors.ts      # Dark theme color palette
└── firestore.rules          # Security rules
```

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles |
| `events` | Car events with location, date, type |
| `spots` | Photo spots with location, photos, ratings |
| `routes` | Driving routes with ordered waypoints array |

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure your project
eas build:configure

# Build for both platforms
eas build --platform all
```

## Next Steps

- [ ] Push notifications for events near you
- [ ] Comments on events, spots, and routes
- [ ] Search / filter by event type or distance
- [ ] Turn-by-turn navigation integration (Google Directions API)
- [ ] Social follows / friend activity feed
