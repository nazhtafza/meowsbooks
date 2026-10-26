'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCachedAdminSync } from '@/lib/auth';

export function Navbar() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const user = getCachedAdminSync();
      setIsAdminLoggedIn(Boolean(user));
    };

    checkStatus();

    window.addEventListener('meows-auth-changed', checkStatus);
    return () => {
      window.removeEventListener('meows-auth-changed', checkStatus);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="container-wide header-inner">
        {/* Brand Logo menggunakan gambar logo resmi pengguna */}
        <Link href="/" className="brand-logo-container" aria-label="Beranda Meow's Book Collection">
          <Image
            src="/logo.png"
            alt="Meow's Book Collection"
            width={160}
            height={50}
            priority
            className="brand-logo-img"
          />
        </Link>

        {/* Tombol Navigasi Admin */}
        <nav className="nav-links">
          <Link
            href={isAdminLoggedIn ? '/admin' : '/admin/login'}
            className="admin-badge-btn"
            id="nav-admin-btn"
          >
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
