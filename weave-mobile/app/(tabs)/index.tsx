/**
 * Thread Home Screen Route (Tab Index)
 *
 * Epic 3: Daily Actions & Proof
 * Epic 4: Daily Reflection
 *
 * Main daily action loop showing today's binds and reflection prompt
 */

import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ThreadHomeScreen } from '@/screens/ThreadHomeScreen';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';

export default function ThreadRoute() {
  const router = useRouter();
  const { currentStep, isLoading } = useInAppOnboarding();

  // 🎯 In-App Tutorial: Redirect to create needle if user should be in tutorial
  useEffect(() => {
    if (!isLoading && currentStep === 'create_first_needle') {
      console.log('[THREAD_ROUTE] 🎯 Redirecting to create first needle (tutorial)');
      router.replace('/needles/create');
    }
  }, [currentStep, isLoading, router]);

  return <ThreadHomeScreen />;
}
