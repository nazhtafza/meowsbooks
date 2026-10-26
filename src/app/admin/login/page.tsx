'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin, getCachedAdminSync } from '@/lib/auth';
import { PawIcon } from '@/components/PawIcon';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Jika sudah memiliki sesi login, langsung arahkan ke /admin
  useEffect(() => {
    const existing = getCachedAdminSync();
    if (existing) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan email dan password admin.');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.push('/admin');
    } else {
      setErrorMessage(result.error || 'Terjadi kesalahan saat masuk.');
    }
  };

  return (
    <div
      className="container-narrow"
      style={{
        padding: '60px 20px 100px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-book)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '12px' }}>
            <PawIcon size={24} filled={true} className="paw-icon paw-filled" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            Masuk Panel Admin
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Akses kurator untuk mengelola resensi Meow&apos;s Book Collection.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '18px',
              fontSize: '0.82rem',
              backgroundColor: '#FCE8E6',
              color: '#C5221F',
              border: '1px solid rgba(197, 34, 31, 0.2)',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@meowsbooks.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
            id="btn-admin-login"
          >
            {loading ? 'Memproses...' : 'Masuk ke Panel Admin'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link
          href="/"
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          &larr; Kembali ke Katalog Publik
        </Link>
      </div>
    </div>
  );
}
