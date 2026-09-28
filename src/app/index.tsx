import { useEffect } from 'react';

import { router } from 'expo-router';

import { SplashScreen } from '../features/auth';

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(main)/home');
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <SplashScreen />;
}