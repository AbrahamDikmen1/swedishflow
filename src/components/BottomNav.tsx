import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconName } from './Icon';
import { theme } from '../theme/theme';

export interface BottomNavProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: Record<string, unknown>;
    }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarButtonTestID?: string;
      };
    }
  >;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

export default function BottomNav({ state, descriptors, navigation }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const getIconName = (routeName: string, focused: boolean): IconName => {
    switch (routeName) {
      case 'home':
        return focused ? 'home' : 'home-outline';
      case 'learn':
        return focused ? 'book' : 'book-outline';
      case 'practice':
        return focused ? 'create' : 'create-outline';
      case 'progress':
        return focused ? 'bar-chart' : 'bar-chart-outline';
      case 'profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'home-outline';
    }
  };

  const getTabTitle = (routeName: string, defaultTitle?: string) => {
    switch (routeName) {
      case 'home':
        return 'Hem';
      case 'learn':
        return 'Kurs';
      case 'practice':
        return 'Repetera';
      case 'progress':
        return 'Framsteg';
      case 'profile':
        return 'Profil';
      default:
        return defaultTitle || routeName;
    }
  };

  return (
    <View style={[styles.navContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor ? descriptor.options : {};
          const isFocused = state.index === index;
          const routeName = route.name;
          const label = getTabTitle(routeName, options.title);
          const iconName = getIconName(routeName, isFocused);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                <Icon
                  name={iconName}
                  size={22}
                  color={isFocused ? theme.colors.primary : '#8E95A3'}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  { color: isFocused ? theme.colors.primary : '#8E95A3' },
                  isFocused && styles.activeTabLabel,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#EBF3FA',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
