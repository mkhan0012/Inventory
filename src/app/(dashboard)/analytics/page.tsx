import React from 'react';
import DeepAnalyticsClient from '@/components/DeepAnalyticsClient';
import { getDeepAnalytics } from '@/actions/deep-analytics';

export const dynamic = 'force-dynamic';

export default async function DeepAnalyticsPage() {
  const initialData = await getDeepAnalytics();

  return (
    <DeepAnalyticsClient initialData={initialData} />
  );
}
