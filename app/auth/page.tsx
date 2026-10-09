'use client';

import SignIn from '@/components/auth/signIn';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthContent() {
  const params = useSearchParams();
  const type = params.get('type');

  if (type === 'signup') {
    return <h1>Sign Up</h1>;
  }

  return <SignIn redirectTo={safeRedirect(params.get('from'))} />;
}

// `from` comes from the URL, so anyone can put anything in it. Only follow
// it when it is a path on this site; "//evil.com" would leave the site.
function safeRedirect(from: string | null): string {
  return from && from.startsWith('/') && !from.startsWith('//')
    ? from
    : '/order';
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
