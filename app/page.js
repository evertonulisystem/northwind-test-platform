'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para /login
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          QA Automation Shop
        </h1>
        <p className="text-white/80">Redirecionando...</p>
      </div>
    </div>
  );
}