import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { CourseProvider } from '../src/context/CourseContext';
import { ProgressProvider } from '../src/context/ProgressContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CourseProvider>
        <ProgressProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="learn/a1" />
            <Stack.Screen name="learn/a1/mission/[missionId]" />
            <Stack.Screen name="mission/[id]" />
            <Stack.Screen name="admin/index" />
            <Stack.Screen name="admin/login" />
            <Stack.Screen name="admin/mission/[id]" />
          </Stack>
        </ProgressProvider>
      </CourseProvider>
    </AuthProvider>
  );
}
