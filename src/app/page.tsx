'use client';

import React, { useEffect, useState } from 'react';
import { Book } from '@/lib/types';
import { getAllBooks } from '@/lib/storage';
import { BookCard } from '@/components/BookCard';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { PawIcon } from '@/components/PawIcon';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  useEffect(() => {
    let isMounted = true;

    getAllBooks(false).then((data) => {
      if (isMounted) {
        setBooks(data);
        setLoading(false);
      }
    });

    const handleUpdate = () => {
      getAllBooks(false).then((data) => {
        if (isMounted) {
          setBooks(data);
        }
      });
    };

    window.addEventListener('meows-books-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('meows-books-updated', handleUpdate);
    };
  }, []);

  // Kategori dinamis dari buku yang ada
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      b.categories?.forEach((c) => set.add(c));
    });
    return ['Semua', ...Array.from(set)];
  }, [books]);

  // Buku-buku featured untuk carousel
  const featuredBooks = React.useMemo(() => {
    const featured = books.filter((b) => b.is_featured);
    return featured.length > 0 ? featured : books;
  }, [books]);

  // Filtered books
  const displayBooks = books.filter((b) => {
    if (selectedCategory === 'Semua') return true;
    return b.categories?.includes(selectedCategory);
  });

  return (
    <main className="container-wide" style={{ padding: '24px 20px 80px 20px' }}>
      {/* Slider/Carousel Sampul Buku Featured (Murni Visual, Tanpa Judul & Deskripsi) */}
      {featuredBooks.length > 0 && <FeaturedCarousel books={featuredBooks} />}

      {/* Filter Kategori Dinamis */}
      {categories.length > 1 && (
        <div style={{ margin: '24px 0 24px 0' }}>
          <div className="category-scroll-container">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Katalog Koleksi Buku */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Memuat koleksi resensi...
        </div>
      ) : books.length === 0 ? (
        <div className="empty-curation" style={{ marginTop: '32px', padding: '64px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <PawIcon size={36} filled={false} className="paw-icon paw-empty" />
          </div>
          <h1 className="empty-curation-title font-serif">Koleksi Sedang Dipersiapkan</h1>
          <p className="empty-curation-text" style={{ marginBottom: 0 }}>
            Belum ada resensi buku yang dipublikasikan saat ini. Silakan berkunjung kembali dalam waktu dekat untuk menikmati kurasi bacaan pilihan kami.
          </p>
        </div>
      ) : (
        <section style={{ marginTop: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '28px',
            }}
          >
            <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 600 }}>
              {selectedCategory === 'Semua' ? 'Seluruh Koleksi' : `Kategori: ${selectedCategory}`}
            </h2>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {displayBooks.length} Resensi
            </span>
          </div>

          <div className="books-grid">
            {displayBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
