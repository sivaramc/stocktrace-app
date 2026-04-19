import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/auth/AuthProvider';

export default function AuthLayout() {
  const { isAuthenticated, ready } = useAuth();
  if (ready && isAuthenticated) {
    return <Redirect href="/stocks" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
