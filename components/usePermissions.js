'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function usePermissions({ adminOnly = false } = {}) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/'); return; }
    fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) { router.replace('/'); return; }
        const result = await response.json();
        if (controller.signal.aborted) return;
        const current = result.data?.user;
        if (adminOnly && current?.role !== 'admin') { router.replace('/products'); return; }
        setUser(current ?? null);
      }).catch(error => { if (error.name !== 'AbortError') router.replace('/'); });
    return () => controller.abort();
  }, [adminOnly, router]);
  return { user, isAdmin: user?.role === 'admin' };
}
