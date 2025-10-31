'use client';

import { Suspense } from 'react';
import { SignInView } from '@/sections/auth';
import { AuthLayout } from '@/layouts/auth';

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <SignInView />
      </Suspense>
    </AuthLayout>
  );
}
