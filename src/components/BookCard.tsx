import React from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { PawsRating } from './PawsRating';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Link
        href={`/books/${book.slug}`}
        style={{ display: 'block', textDecoration: 'none' }}
        aria-label={`Lihat resensi ${book.title}`}
      >
        {/* Sampul Buku 3D Tactile */}
        <div className="book-cover-wrapper" style={{ width: '100%', marginBottom: '10px' }}>
          <div className="book-cover-surface">
            <div className="book-spine-line" />
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_url}
                alt={`Sampul buku ${book.title}`}
                className="book-cover-img"
                loading="lazy"
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
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  className="font-serif"
                  style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '6px' }}
                >
                  {book.title}
                </div>
                <div style={{ fontSize: '0.74rem', opacity: 0.8 }}>{book.author}</div>
              </div>
            )}
          </div>
        </div>

        {/* Informasi Evaluasi Paws & Kategori */}
        <div style={{ marginBottom: '6px' }}>
          <PawsRating rating={book.paws_rating} badge={book.paws_badge} size={12} />
        </div>

        {/* Judul & Penulis */}
        <h2
          className="font-serif"
          style={{
            fontSize: '1.02rem',
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'var(--text-main)',
            marginBottom: '3px',
            transition: 'color 0.15s ease',
          }}
        >
          {book.title}
        </h2>

        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '6px',
          }}
        >
          {book.author}
        </p>

        {/* Blurb / Ringkasan Singkat Kompak */}
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.blurb}
        </p>
      </Link>
    </article>
  );
}
