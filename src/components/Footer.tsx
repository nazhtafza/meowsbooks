'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-paper)',
        padding: '52px 0 36px 0',
        marginTop: '60px',
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <Link href="/" className="brand-logo-container" aria-label="Meow's Book Collection">
              <Image
                src="/logo.png"
                alt="Meow's Book Collection"
                width={150}
                height={46}
                className="brand-logo-img"
              />
            </Link>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginTop: '14px',
                maxWidth: '520px',
                lineHeight: 1.7,
              }}
            >
              Ruang telaah dan kurasi buku mendalam bagi pembaca yang mencari kejernihan berpikir.
              Setiap karya diulas secara kritis, membedah gagasan esensial, dan dievaluasi dengan
              ketelitian sistem Paws untuk menemukan bacaan yang sungguh berbobot.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Link href="/" style={{ color: 'var(--text-secondary)' }}>
              Beranda
            </Link>
            <span>/</span>
            <Link href="/admin/login" style={{ color: 'var(--text-secondary)' }}>
              Login
            </Link>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '36px',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div>&copy; 2026 Meow&apos;s Book Collection. Seluruh hak cipta dilindungi.</div>
          <div>Kurasi Resensi Buku Independen</div>
        </div>
      </div>
    </footer>
  );
}
