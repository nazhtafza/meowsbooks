'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book, Quote } from '@/lib/types';
import { upsertBook } from '@/lib/storage';
import { PawsRating } from './PawsRating';
import { BookCard } from './BookCard';

interface AdminBookFormProps {
  initialBook?: Book;
  isEditMode?: boolean;
}

const PRESET_COLORS = [
  '#C85A32', // Terracotta
  '#1C3B68', // Deep Navy
  '#1F563B', // Forest Green
  '#8B4513', // Warm Leather
  '#5C3A58', // Plum Monograph
  '#1F2421', // Charcoal Slate
];

const PRESET_BADGES = [
  'Purr-fect Masterpiece',
  'Pilihan Kurasi',
  'Warm & Cozy Read',
  'Deep Intellectual Yarn',
  'Esai Reflektif',
  'Klasik Abadi',
];

export function AdminBookForm({ initialBook, isEditMode = false }: AdminBookFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State (fokus pada resensi buku)
  const [title, setTitle] = useState(initialBook?.title || '');
  const [slug, setSlug] = useState(initialBook?.slug || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [coverUrl, setCoverUrl] = useState(initialBook?.cover_url || '');
  const [accentColor, setAccentColor] = useState(initialBook?.accent_color || '#C85A32');
  const [pawsRating, setPawsRating] = useState<number>(initialBook?.paws_rating ?? 5.0);
  const [pawsBadge, setPawsBadge] = useState(initialBook?.paws_badge || 'Pilihan Kurasi');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialBook?.is_featured ?? false);
  const [categoriesText, setCategoriesText] = useState(initialBook?.categories?.join(', ') || 'Filsafat, Esai');
  const [blurb, setBlurb] = useState(initialBook?.blurb || '');
  const [reviewContent, setReviewContent] = useState(initialBook?.review_content || '');
  const [readTime, setReadTime] = useState(initialBook?.read_time || '5 min read');
  const [status, setStatus] = useState<'draft' | 'published'>(initialBook?.status || 'published');

  // Quotes State
  const [quotes, setQuotes] = useState<Quote[]>(initialBook?.quotes || []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(val));
    }
  };

  const addQuote = () => {
    setQuotes([
      ...quotes,
      {
        id: `quote-${Date.now()}`,
        quote_text: '',
        page_number: '',
        context: '',
      },
    ]);
  };

  const updateQuote = (index: number, field: keyof Quote, value: string) => {
    const updated = [...quotes];
    updated[index] = { ...updated[index], [field]: value };
    setQuotes(updated);
  };

  const removeQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !blurb.trim() || !reviewContent.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Mohon lengkapi judul buku, penulis, blurb ringkas, dan isi resensi.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const categories = categoriesText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const bookPayload: Partial<Book> & { quotes?: Quote[] } = {
      id: initialBook?.id,
      slug: slug || generateSlug(title),
      title: title.trim(),
      author: author.trim(),
      cover_url: coverUrl.trim(),
      accent_color: accentColor,
      paws_rating: Number(pawsRating),
      paws_badge: pawsBadge.trim(),
      is_featured: isFeatured,
      categories,
      blurb: blurb.trim(),
      review_content: reviewContent.trim(),
      read_time: readTime.trim(),
      status,
      quotes: quotes.filter((q) => q.quote_text.trim().length > 0),
    };

    try {
      const result = await upsertBook(bookPayload);
      setIsSubmitting(false);

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: isEditMode
            ? 'Resensi buku berhasil diperbarui.'
            : 'Resensi buku berhasil ditambahkan ke katalog.',
        });
        setTimeout(() => {
          router.push('/admin');
        }, 900);
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Gagal menyimpan resensi.',
        });
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan resensi buku.';
      setStatusMessage({
        type: 'error',
        text: errorMessage,
      });
    }
  };

  const previewBook: Book = {
    id: initialBook?.id || 'preview-id',
    slug: slug || 'preview-slug',
    title: title || 'Judul Buku',
    author: author || 'Nama Penulis',
    cover_url: coverUrl || '',
    accent_color: accentColor,
    paws_rating: Number(pawsRating),
    paws_badge: pawsBadge,
    is_featured: isFeatured,
    categories: categoriesText.split(',').map((c) => c.trim()).filter(Boolean),
    blurb: blurb || 'Ringkasan satu-dua kalimat akan tampil di kartu katalog buku...',
    review_content: reviewContent,
    read_time: readTime,
    status,
    created_at: initialBook?.created_at || '2026-10-26T00:00:00.000Z',
    quotes,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Header & Mobile Live Preview Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 600 }}>
            {isEditMode ? 'Sunting Resensi Buku' : 'Tambah Resensi Buku Baru'}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Fokus pada substansi ulasan buku, kutipan, dan sistem rating Paws.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          {showPreview ? 'Tutup Preview' : 'Preview Kartu'}
        </button>
      </div>

      {/* Live Preview Box */}
      {showPreview && (
        <div
          style={{
            background: 'var(--bg-paper)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '28px',
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: '0.74rem',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}
          >
            Live Preview Kartu Katalog
          </div>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <BookCard book={previewBook} />
          </div>
        </div>
      )}

      {/* Notifikasi Status */}
      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '0.88rem',
            backgroundColor: statusMessage.type === 'success' ? '#E6F4EA' : '#FCE8E6',
            color: statusMessage.type === 'success' ? '#137333' : '#C5221F',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(19, 115, 51, 0.2)' : 'rgba(197, 34, 31, 0.2)'}`,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Bagian 1: Identitas Buku */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">1. Buku yang Diresensi</h2>
          <p className="form-card-desc">Judul, penulis, sampul, dan rona aksen</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="book-title">
            Judul Buku *
          </label>
          <input
            id="book-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Contoh: The Art of Doing Nothing"
            required
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="book-author">
              Nama Penulis *
            </label>
            <input
              id="book-author"
              type="text"
              className="form-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Contoh: Barnaby P. Whiskers"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="book-slug">
              Slug URL
            </label>
            <input
              id="book-slug"
              type="text"
              className="form-input font-mono"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="the-art-of-doing-nothing"
            />
          </div>
        </div>

        {/* Sampul Buku */}
        <div className="form-group">
          <label className="form-label" htmlFor="book-cover-url">
            Foto Sampul Buku (URL atau Upload)
          </label>
          <input
            id="book-cover-url"
            type="text"
            className="form-input"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://... atau /covers/... atau pilih file di bawah"
            style={{ marginBottom: '8px' }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
          />
        </div>

        {/* Warna Aksen Buku */}
        <div className="form-group">
          <label className="form-label">
            Warna Aksen Buku (Accent Color)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              style={{
                width: '38px',
                height: '38px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              aria-label="Pilih warna aksen kustom"
            />
            <input
              type="text"
              className="form-input font-mono"
              style={{ width: '110px' }}
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#C85A32"
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: accentColor === color ? '2px solid var(--text-main)' : '1px solid rgba(0,0,0,0.1)',
                  }}
                  aria-label={`Warna ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="book-categories">
            Kategori / Tema (Pisahkan dengan koma)
          </label>
          <input
            id="book-categories"
            type="text"
            className="form-input"
            value={categoriesText}
            onChange={(e) => setCategoriesText(e.target.value)}
            placeholder="Filsafat, Esai, Desain"
          />
        </div>
      </div>

      {/* Bagian 2: Evaluasi & Skor Paws */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">2. Evaluasi Skor Paws</h2>
          <p className="form-card-desc">Sistem penilaian Paws kurasi Meow&apos;s Book Collection</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="paws-rating-slider" style={{ margin: 0 }}>
                Skor Paws
              </label>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                {Number(pawsRating).toFixed(1)} / 5.0
              </span>
            </div>
            <input
              id="paws-rating-slider"
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={pawsRating}
              onChange={(e) => setPawsRating(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
            />
            <div style={{ marginTop: '6px' }}>
              <PawsRating rating={pawsRating} showScore={false} size={16} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paws-badge-select">
              Label Kurasi (Paw Badge)
            </label>
            <input
              id="paws-badge-select"
              type="text"
              className="form-input"
              value={pawsBadge}
              onChange={(e) => setPawsBadge(e.target.value)}
              placeholder="Contoh: Purr-fect Masterpiece"
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {PRESET_BADGES.map((badge) => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => setPawsBadge(badge)}
                  className="paws-badge-pill"
                  style={{
                    cursor: 'pointer',
                    background: pawsBadge === badge ? 'var(--text-main)' : 'var(--bg-paper)',
                    color: pawsBadge === badge ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--text-main)' }}
            />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
              Jadikan Sorotan Utama (Tampil di Hero Section beranda)
            </span>
          </label>
        </div>
      </div>

      {/* Bagian 3: Konten Resensi (Fokus Utama) */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">3. Teks Resensi Editorial</h2>
          <p className="form-card-desc">Ulasan mendalam dan ringkasan tajam</p>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="form-label" htmlFor="book-blurb" style={{ margin: 0 }}>
              One-Liner Blurb (Punchline) *
            </label>
            <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {blurb.length} karakter
            </span>
          </div>
          <textarea
            id="book-blurb"
            className="form-textarea font-serif"
            rows={3}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="1-2 kalimat menggugah yang merangkum esensi buku secara tajam..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="read-time-input">
            Estimasi Durasi Baca
          </label>
          <input
            id="read-time-input"
            type="text"
            className="form-input"
            style={{ maxWidth: '180px' }}
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            placeholder="5 min read"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="review-content">
            Isi Resensi Lengkap *
          </label>
          <textarea
            id="review-content"
            className="form-textarea"
            rows={12}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Tuliskan ulasan mendalam Anda di sini. Mendukung heading (### Judul Bab), kutipan (> Kalimat kutipan), dan paragraf ulasan..."
            required
            style={{ lineHeight: 1.6 }}
          />
        </div>
      </div>

      {/* Bagian 4: Kutipan Buku (Quotes - Opsional) */}
      <div className="form-card">
        <div
          className="form-card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div>
            <h2 className="form-card-title">4. Kutipan Buku Pilihan (Opsional)</h2>
            <p className="form-card-desc">Kutipan berkesan dari dalam buku yang dapat disalin pembaca</p>
          </div>
          <button
            type="button"
            onClick={addQuote}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            + Tambah Kutipan
          </button>
        </div>

        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Tidak ada kutipan. Klik &ldquo;+ Tambah Kutipan&rdquo; jika ingin menyematkan kutipan penting.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {quotes.map((quote, idx) => (
              <div
                key={quote.id || idx}
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
                    Kutipan #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuote(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#C5221F',
                      fontSize: '0.76rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    Hapus
                  </button>
                </div>

                <textarea
                  className="form-textarea font-serif"
                  rows={2}
                  value={quote.quote_text}
                  onChange={(e) => updateQuote(idx, 'quote_text', e.target.value)}
                  placeholder="Teks kutipan yang berkesan..."
                  style={{ marginBottom: '8px' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={quote.page_number || ''}
                    onChange={(e) => updateQuote(idx, 'page_number', e.target.value)}
                    placeholder="Hal. 42 (opsional)"
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={quote.context || ''}
                    onChange={(e) => updateQuote(idx, 'context', e.target.value)}
                    placeholder="Bab / Konteks kutipan (opsional)"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian 5: Status Publikasi */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">5. Status Publikasi</h2>
          <p className="form-card-desc">Pilih status tayang untuk resensi ini</p>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
              style={{ accentColor: 'var(--text-main)' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Terbitkan (Published)
            </span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              style={{ accentColor: 'var(--text-main)' }}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Simpan sebagai Draft
            </span>
          </label>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingBottom: '60px',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Batal
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
          id="btn-submit-book"
        >
          {isSubmitting
            ? 'Menyimpan...'
            : isEditMode
            ? 'Simpan Perubahan'
            : 'Publikasikan Resensi'}
        </button>
      </div>
    </form>
  );
}
