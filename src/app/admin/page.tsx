'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';
import { getAllBooks, deleteBook } from '@/lib/storage';
import { PawsRating } from '@/components/PawsRating';
import { PawIcon } from '@/components/PawIcon';

import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function AdminDashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = React.useCallback(async () => {
    const data = await getAllBooks(true);
    setBooks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAllBooks(true).then((data) => {
      if (isMounted) {
        setBooks(data);
        setLoading(false);
      }
    });

    const handleUpdate = () => {
      if (isMounted) {
        loadData();
      }
    };

    window.addEventListener('meows-books-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('meows-books-updated', handleUpdate);
    };
  }, [loadData]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus resensi "${title}"?`)) {
      await deleteBook(id);
      loadData();
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesStatus =
      filterStatus === 'all' ? true : b.status === filterStatus;
    const matchesQuery =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <AdminAuthGuard>
      <div className="container-wide" style={{ padding: '32px 20px 80px 20px' }}>
      {/* Top Header & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '6px' }}>
            Panel Manajemen Resensi
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Kelola seluruh resensi buku, sistem penilaian Paws, dan kutipan editorial.
          </p>
        </div>

        <div>
          <Link
            href="/admin/books/new"
            className="btn-primary"
            id="admin-btn-new-book"
            style={{ fontSize: '0.86rem', padding: '10px 18px' }}
          >
            + Tambah Buku Baru
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`category-pill ${filterStatus === 'all' ? 'active' : ''}`}
          >
            Semua ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('published')}
            className={`category-pill ${filterStatus === 'published' ? 'active' : ''}`}
          >
            Published ({books.filter((b) => b.status === 'published').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('draft')}
            className={`category-pill ${filterStatus === 'draft' ? 'active' : ''}`}
          >
            Draft ({books.filter((b) => b.status === 'draft').length})
          </button>
        </div>

        <input
          type="text"
          className="form-input"
          style={{ maxWidth: '280px', padding: '8px 12px', fontSize: '0.84rem' }}
          placeholder="Cari judul atau penulis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Daftar Buku */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Memuat daftar buku...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-curation">
          <div style={{ marginBottom: '12px' }}>
            <PawIcon size={32} filled={false} className="paw-icon paw-empty" />
          </div>
          <h2 className="empty-curation-title">Belum Ada Resensi</h2>
          <p className="empty-curation-text">
            {searchQuery
              ? 'Tidak ada buku yang sesuai dengan pencarian Anda.'
              : 'Belum ada koleksi buku yang diinput. Klik tombol di bawah untuk menambahkan buku pertama Anda.'}
          </p>
          <Link href="/admin/books/new" className="btn-primary" id="admin-empty-new-book">
            + Tambah Buku Pertama
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px', flex: 1 }}>
                {/* Thumbnail Mini */}
                <div
                  style={{
                    width: '42px',
                    height: '60px',
                    backgroundColor: book.accent_color || '#1A1A1A',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {book.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/books/${book.slug}`}
                      className="font-serif"
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                    >
                      {book.title}
                    </Link>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          book.status === 'published' ? '#E6F4EA' : '#F1F3F4',
                        color:
                          book.status === 'published' ? '#137333' : '#5F6368',
                      }}
                    >
                      {book.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    {book.is_featured && (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#FEF7E0',
                          color: '#B06000',
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                    }}
                  >
                    Oleh {book.author} &bull; {book.categories?.join(', ')}
                  </div>
                </div>
              </div>

              {/* Rating & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <PawsRating rating={book.paws_rating} badge={book.paws_badge} size={13} />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/books/${book.slug}`}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    target="_blank"
                  >
                    Lihat
                  </Link>
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Sunting
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(book.id, book.title)}
                    className="btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </AdminAuthGuard>
  );
}
