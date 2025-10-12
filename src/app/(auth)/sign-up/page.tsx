import type { Metadata } from 'next';

import { SignUpView } from '@/sections/auth/sign-up-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: '회원가입',
};

export default function Page() {
  return <SignUpView />;
}
