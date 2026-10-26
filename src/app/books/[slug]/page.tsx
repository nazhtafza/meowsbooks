'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book } from '@/lib/types';
import { getBookBySlug, getAllBooks } from '@/lib/storage';
import { PawsRating } from '@/components/PawsRating';
import { QuoteCard } from '@/components/QuoteCard';
import { PawIcon } from '@/components/PawIcon';
import { Stripe3DBook } from '@/components/Stripe3DBook';
import { StripeParallaxCanvas } from '@/components/StripeParallaxCanvas';

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

function BookDetailContent({ params }: BookDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBookSlug, setActiveBookSlug] = useState<string>(resolvedParams.slug);

  // Ambil semua buku dan urutkan dimulai dari buku yang diminta
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const all = await getAllBooks(false);
      if (!isMounted) return;

      if (!all || all.length === 0) {
        setLoading(false);
        return;
      }

      // Cari indeks buku yang diminta
      const currentIndex = all.findIndex((b) => b.slug === resolvedParams.slug);

      if (currentIndex === -1) {
        // Jika tidak ditemukan di published list, coba ambil secara spesifik
        const single = await getBookBySlug(resolvedParams.slug, false);
        if (!isMounted) return;
        if (single) {
          setBooks([single, ...all]);
        }
      } else {
        // Susun urutan buku dimulai dari buku yang dipilih, lalu berlanjut ke buku-buku berikutnya
        const ordered = [
          ...all.slice(currentIndex),
          ...all.slice(0, currentIndex),
        ];
        setBooks(ordered);
      }
      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.slug]);

  // Pantau posisi scroll: Perbarui URL, Title, dan Palet Parallax saat masuk ke buku berikutnya
  useEffect(() => {
    if (books.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute('data-slug');
            const title = entry.target.getAttribute('data-title');
            if (slug) {
              setActiveBookSlug(slug);
              window.history.replaceState(null, '', `/books/${slug}`);
              if (title) {
                document.title = `${title} | Meow's Book Collection`;
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -50% 0px',
        threshold: 0,
      }
    );

    const sections = document.querySelectorAll('.book-editorial-section');
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [books]);

  if (loading) {
    return (
      <div className="container-narrow" style={{ padding: '80px 20px', textAlign: 'center' }}>
        Memuat ulasan buku...
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="container-narrow empty-curation" style={{ margin: '60px auto' }}>
        <h2 className="empty-curation-title">Resensi Tidak Ditemukan</h2>
        <p className="empty-curation-text">
          Buku yang Anda cari belum tersedia atau tautan tidak valid.
        </p>
        <Link href="/" className="btn-primary">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  // Buku yang sedang aktif di viewport pembaca untuk latar belakang parallax
  const currentActiveBook = books.find((b) => b.slug === activeBookSlug) || books[0];

  // Format teks resensi dengan gaya editorial Stripe Press
  const renderFormattedReview = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('####')) {
        elements.push(
          <h4
            key={idx}
            className="font-serif"
            style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              marginTop: '28px',
              marginBottom: '12px',
              color: 'var(--text-main)',
            }}
          >
            {trimmed.replace(/^####\s*/, '')}
          </h4>
        );
      } else if (trimmed.startsWith('###')) {
        elements.push(
          <h3
            key={idx}
            className="font-serif"
            style={{
              fontSize: '1.4rem',
              fontWeight: 600,
              marginTop: '36px',
              marginBottom: '14px',
              color: 'var(--text-main)',
            }}
          >
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        );
      } else if (trimmed.startsWith('>')) {
        elements.push(
          <blockquote
            key={idx}
            className="font-serif"
            style={{
              fontStyle: 'italic',
              fontSize: '1.18rem',
              lineHeight: 1.6,
              borderLeft: '3px solid var(--accent-gold)',
              paddingLeft: '20px',
              margin: '24px 0',
              color: 'var(--text-main)',
            }}
          >
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
      } else if (trimmed.length > 0) {
        elements.push(
          <p
            key={idx}
            style={{
              marginBottom: '20px',
            }}
          >
            {trimmed}
          </p>
        );
      }
    });

    return <div className="book-review-prose">{elements}</div>;
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 1. Latar Belakang Animasi Parallax ala Stripe Press */}
      <StripeParallaxCanvas accentColor={currentActiveBook.accent_color || '#C85A32'} />

      {/* Konten Halaman */}
      <div className="book-editorial-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Tombol Kembali ke Katalog */}
        <div style={{ paddingTop: '28px', paddingBottom: '16px' }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            &larr; Kembali ke Katalog
          </button>
        </div>

        {/* Daftar Resensi Buku yang Mengalir Mulus Saat Di-scroll (Stripe Press Style) */}
        {books.map((book, bookIdx) => {
          const hasMoreBooks = books.length > 1;

          return (
            <article
              key={book.id}
              id={`book-${book.slug}`}
              data-slug={book.slug}
              data-title={book.title}
              className="book-editorial-section"
            >
              {/* Layout Dua Kolom Editorial: Sisi Kiri Sticky 3D Book, Sisi Kanan Konten */}
              <div className="book-editorial-layout">
                {/* Kolom Kiri Sticky: Buku 3D Interaktif dengan Efek Parallax & Pantulan Cahaya */}
                <aside className="book-sticky-column">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '20px',
                    }}
                  >
                    {/* Buku 3D Animasi ala Stripe Press */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <Stripe3DBook book={book} />
                    </div>

                    {/* Evaluasi Paws */}
                    <div style={{ marginTop: '8px' }}>
                      <PawsRating rating={book.paws_rating} badge={book.paws_badge} size={15} />
                    </div>

                    {/* Detail Penulis & Waktu Baca */}
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div>Karya {book.author}</div>
                      <div style={{ marginTop: '2px' }}>Waktu baca: {book.read_time}</div>
                      {hasMoreBooks && (
                        <div style={{ marginTop: '6px', color: 'var(--accent-gold)' }}>
                          Buku {bookIdx + 1} dari {books.length} dalam katalog
                        </div>
                      )}
                    </div>

                    {/* Kategori */}
                    {book.categories && book.categories.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {book.categories.map((c) => (
                          <span
                            key={c}
                            className="category-pill"
                            style={{
                              fontSize: '0.76rem',
                              padding: '4px 10px',
                              pointerEvents: 'none',
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </aside>

                {/* Kolom Kanan: Judul, Garis Pembatas Khas Stripe Press, Blurb, Resensi, Kutipan */}
                <div className="book-content-column">
                  {/* Judul Buku */}
                  <h1
                    className="font-serif"
                    style={{
                      fontSize: 'clamp(2.1rem, 4.4vw, 3.1rem)',
                      fontWeight: 700,
                      lineHeight: 1.15,
                      color: 'var(--text-main)',
                      marginBottom: '10px',
                    }}
                  >
                    {book.title}
                  </h1>

                  <p
                    style={{
                      fontSize: '1.02rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '20px',
                    }}
                  >
                    Ditulis oleh {book.author} &bull; {book.read_time}
                  </p>

                  {/* Garis Horizontal Minimalis Khas Stripe Press (60px) */}
                  <div
                    style={{
                      width: '60px',
                      height: '1px',
                      background: 'var(--text-main)',
                      marginBottom: '28px',
                      opacity: 0.6,
                    }}
                  />

                  {/* One-Liner Blurb Banner */}
                  <div
                    style={{
                      background: 'var(--bg-paper)',
                      borderLeft: `4px solid ${book.accent_color || 'var(--text-main)'}`,
                      padding: '22px 26px',
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                      marginBottom: '36px',
                    }}
                  >
                    <p
                      className="font-serif"
                      style={{
                        fontSize: '1.18rem',
                        fontStyle: 'italic',
                        lineHeight: 1.55,
                        color: 'var(--text-main)',
                      }}
                    >
                      &ldquo;{book.blurb}&rdquo;
                    </p>
                  </div>

                  {/* Teks Resensi Lengkap */}
                  <section style={{ marginBottom: '44px' }}>
                    {renderFormattedReview(book.review_content)}
                  </section>

                  {/* Kutipan Emas / Quotes */}
                  {book.quotes && book.quotes.length > 0 && (
                    <section style={{ marginTop: '48px', marginBottom: '40px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                        }}
                      >
                        <PawIcon size={16} filled={true} className="paw-icon paw-filled" />
                        <h2 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 600 }}>
                          Kutipan Pilihan Buku
                        </h2>
                      </div>
                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '18px',
                        }}
                      >
                        Catatan dan kutipan penting yang disorot oleh kurator:
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {book.quotes.map((q) => (
                          <QuoteCard key={q.id} quote={q} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container-narrow" style={{ padding: '80px 20px', textAlign: 'center' }}>
          Memuat ulasan buku...
        </div>
      }
    >
      <BookDetailContent params={params} />
    </Suspense>
  );
}
