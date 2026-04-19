import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/auth/AuthProvider';
import { colors } from '../../src/theme/colors';

export default function AppLayout() {
  const { isAuthenticated, isAdmin, ready } = useAuth();
  if (!ready) return null;
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontSize: 16, fontWeight: '600' },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="stocks" options={{ title: 'Stocks' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen
        name="users"
        options={{ title: 'Users', href: isAdmin ? '/users' : null }}
      />
    </Tabs>
  );
}
