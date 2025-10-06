'use client';

import { SignInView } from '@/sections/auth';
import { AuthLayout } from '@/layouts/auth';

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInView />
    </AuthLayout>
  );
}
