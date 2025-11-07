'use client';

import { Suspense } from 'react';
import { SystemAdminLoginView } from '@/sections/auth';
import { AuthLayout } from '@/layouts/auth';

export default function SystemAdminLoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <SystemAdminLoginView />
      </Suspense>
    </AuthLayout>
  );
}
