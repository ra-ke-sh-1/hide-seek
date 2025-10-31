import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Initializing Hide&Seek Worlds..." />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="auth" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="world-builder" />
            <Stack.Screen name="vibe-code" />
            <Stack.Screen name="game" />
            <Stack.Screen name="avatar-creator" />
            <Stack.Screen name="friends" />
            <Stack.Screen name="lobby/[id]" />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}