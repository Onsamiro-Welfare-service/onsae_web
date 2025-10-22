'use client';

import { SystemAdminLoginView } from '@/sections/auth';
import { AuthLayout } from '@/layouts/auth';

export default function SystemAdminLoginPage() {
  return (
    <AuthLayout>
      <SystemAdminLoginView />
    </AuthLayout>
  );
}
