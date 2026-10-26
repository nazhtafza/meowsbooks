'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin, getCachedAdminSync, logoutAdmin, AdminUser } from '@/lib/auth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(() => getCachedAdminSync());

  // Deteksi lingkungan client secara aman tanpa memicu cascading render
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const active = getCachedAdminSync();
    if (!active) {
      getCurrentAdmin().then((current) => {
        if (!current) {
          router.replace('/admin/login');
        } else {
          setUser(current);
        }
      });
    }
  }, [router]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
  };

  // Jangan render konten di server atau sebelum ada sesi aktif terdeteksi
  if (!isClient || !user) {
    return null;
  }

  return (
    <div>
      {/* Admin Top Utility Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-paper)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '8px 20px',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div
          className="container-wide"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sesi Admin Aktif:</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {user.email || 'admin@meowsbooks.com'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)' }}>
              Lihat Katalog Publik &rarr;
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#C5221F',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 600,
              }}
            >
              Keluar (Logout)
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
