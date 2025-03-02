import { Tabs } from 'expo-router';
import { Chrome as Home, BookOpen, Settings, Search } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#888888' : '#888888',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trending',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: 'Scholar Trends',
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          headerTitle: 'Scholar Analysis',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          headerTitle: 'Search Topics',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}