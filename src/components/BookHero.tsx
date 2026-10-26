import React from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { PawsRating } from './PawsRating';

interface BookHeroProps {
  book: Book;
}

export function BookHero({ book }: BookHeroProps) {
  return (
    <section
      style={{
        position: 'relative',
        padding: '36px 0 48px 0',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '40px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* Kolom Kiri: Cover Besar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className="book-cover-wrapper"
            style={{
              width: '100%',
              maxWidth: '300px',
            }}
          >
            <div className="book-cover-surface">
              <div className="book-spine-line" />
              {book.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover_url}
                  alt={`Sampul buku ${book.title}`}
                  className="book-cover-img"
                  priority-attr="true"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: book.accent_color || '#1A1A1A',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    className="font-serif"
                    style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}
                  >
                    {book.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>{book.author}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Teks Editorial & Action */}
        <div>

          <h1
            className="font-serif"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--text-main)',
              marginBottom: '8px',
            }}
          >
            {book.title}
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '16px',
            }}
          >
            Karya {book.author} &bull; {book.read_time}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <PawsRating rating={book.paws_rating} badge={book.paws_badge} size={16} />
          </div>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '540px',
            }}
          >
            {book.blurb}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href={`/books/${book.slug}`} className="btn-primary">
              Baca Resensi Lengkap
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .hero-grid {
            grid-template-columns: 320px 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
