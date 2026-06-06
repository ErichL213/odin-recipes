import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    else if (user && inAuth) router.replace('/(tabs)');
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="spot/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="route/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="create-event" options={{ presentation: 'modal' }} />
          <Stack.Screen name="create-spot" options={{ presentation: 'modal' }} />
          <Stack.Screen name="create-route" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}
