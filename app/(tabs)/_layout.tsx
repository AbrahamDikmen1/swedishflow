import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav, { BottomNavProps } from '../../src/components/BottomNav';
import AdminPreviewBanner from '../../src/components/AdminPreviewBanner';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <AdminPreviewBanner />
      <Tabs
        tabBar={(props) => <BottomNav {...(props as unknown as BottomNavProps)} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Hem' }} />
        <Tabs.Screen name="learn" options={{ title: 'Kurs' }} />
        <Tabs.Screen name="practice" options={{ title: 'Repetera' }} />
        <Tabs.Screen name="progress" options={{ title: 'Framsteg' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

