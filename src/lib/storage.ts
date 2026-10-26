'use client';

import { Book, Quote } from './types';
import { getSupabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'meows_books_collection';

// Validasi format UUID standar
export function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Generator UUID v4 yang kompatibel dengan PostgreSQL UUID
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper membaca localStorage (kosong [] saat awal)
export function getLocalBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Book[];
  } catch (error) {
    console.error('Gagal membaca data lokal:', error);
    return [];
  }
}

// Helper menyimpan ke localStorage
export function saveLocalBooks(books: Book[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
    window.dispatchEvent(new Event('meows-books-updated'));
  } catch (error) {
    console.error('Gagal menyimpan data lokal:', error);
  }
}

// Mengambil seluruh buku
export async function getAllBooks(includeDrafts = false): Promise<Book[]> {
  const supabase = getSupabase();

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('books')
        .select('*, quotes(*)')
        .order('created_at', { ascending: false });

      if (!includeDrafts) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase query books info:', error.message);
        return getLocalBooks().filter((b) => includeDrafts || b.status === 'published');
      }
      return (data as Book[]) || [];
    } catch (err) {
      console.warn('Supabase fetch failed, fallback lokal:', err);
      return getLocalBooks().filter((b) => includeDrafts || b.status === 'published');
    }
  }

  const local = getLocalBooks();
  if (includeDrafts) return local;
  return local.filter((b) => b.status === 'published');
}

// Mengambil satu buku berdasarkan slug
export async function getBookBySlug(slug: string, includeDrafts = false): Promise<Book | null> {
  const supabase = getSupabase();

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('books')
        .select('*, quotes(*)')
        .eq('slug', slug);

      if (!includeDrafts) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query.single();
      if (error || !data) {
        const local = getLocalBooks().find(
          (b) => b.slug === slug && (includeDrafts || b.status === 'published')
        );
        return local || null;
      }
      return data as Book;
    } catch (err) {
      console.warn('Supabase single fetch info:', err);
      const local = getLocalBooks().find(
        (b) => b.slug === slug && (includeDrafts || b.status === 'published')
      );
      return local || null;
    }
  }

  const local = getLocalBooks().find(
    (b) => b.slug === slug && (includeDrafts || b.status === 'published')
  );
  return local || null;
}

// Mengambil satu buku berdasarkan ID (admin edit)
export async function getBookById(id: string): Promise<Book | null> {
  const supabase = getSupabase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, quotes(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        return getLocalBooks().find((b) => b.id === id) || null;
      }
      return data as Book;
    } catch (err) {
      console.warn('Supabase fetch by ID info:', err);
      return getLocalBooks().find((b) => b.id === id) || null;
    }
  }

  return getLocalBooks().find((b) => b.id === id) || null;
}

// Simpan atau update resensi buku
export async function upsertBook(
  bookData: Partial<Book> & { quotes?: Quote[] }
): Promise<{ success: boolean; data?: Book; error?: string }> {
  try {
    const supabase = getSupabase();

    // Pastikan ID selalu berbentuk UUID valid untuk tabel PostgreSQL
    const id = bookData.id && isValidUUID(bookData.id) ? bookData.id : generateUUID();
    const now = new Date().toISOString();

    const formattedBook: Book = {
      id,
      slug: bookData.slug?.trim() || `buku-${Date.now()}`,
      title: bookData.title?.trim() || 'Tanpa Judul',
      author: bookData.author?.trim() || 'Anonim',
      cover_url: bookData.cover_url?.trim() || '',
      accent_color: bookData.accent_color || '#C85A32',
      paws_rating: Number(bookData.paws_rating) || 5.0,
      paws_badge: bookData.paws_badge?.trim() || 'Pilihan Kurasi',
      is_featured: Boolean(bookData.is_featured),
      categories: Array.isArray(bookData.categories) ? bookData.categories : [],
      blurb: bookData.blurb?.trim() || '',
      review_content: bookData.review_content?.trim() || '',
      read_time: bookData.read_time?.trim() || '5 min read',
      status: bookData.status || 'published',
      created_at: bookData.created_at || now,
      quotes:
        bookData.quotes?.map((q) => ({
          id: q.id && isValidUUID(q.id) ? q.id : generateUUID(),
          book_id: id,
          quote_text: q.quote_text.trim(),
          page_number: q.page_number?.trim() || '',
          context: q.context?.trim() || '',
        })) || [],
    };

    // Selalu simpan ke LocalStorage agar data resensi aman
    const currentBooks = getLocalBooks();
    const existingIndex = currentBooks.findIndex((b) => b.id === id);
    if (existingIndex >= 0) {
      currentBooks[existingIndex] = formattedBook;
    } else {
      currentBooks.unshift(formattedBook);
    }
    saveLocalBooks(currentBooks);

    // Jika Supabase aktif, simpan ke Supabase
    if (isSupabaseConfigured() && supabase) {
      const { quotes, ...bookPayload } = formattedBook;
      const { error: bookError } = await supabase
        .from('books')
        .upsert(bookPayload, { onConflict: 'id' });

      if (bookError) {
        console.warn('Supabase upsert warning:', bookError.message);
        // Jika terhambat kebijakan RLS Supabase
        if (bookError.code === '42501') {
          return {
            success: true,
            data: formattedBook,
            error:
              'Data tersimpan di perangkat lokal. Untuk menyinkronkan ke Supabase, pastikan Anda telah login sebagai Admin terdaftar atau perbarui kebijakan RLS di Supabase.',
          };
        }
        return { success: false, error: bookError.message };
      }

      // Simpan kutipan jika ada
      if (quotes && quotes.length >= 0) {
        await supabase.from('quotes').delete().eq('book_id', id);
        if (quotes.length > 0) {
          const quotesToInsert = quotes.map((q) => ({
            id: q.id,
            book_id: id,
            quote_text: q.quote_text,
            page_number: q.page_number,
            context: q.context,
          }));
          await supabase.from('quotes').insert(quotesToInsert);
        }
      }

      return { success: true, data: formattedBook };
    }

    return { success: true, data: formattedBook };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses data.';
    console.error('Exception di upsertBook:', err);
    return { success: false, error: message };
  }
}

// Menghapus buku
export async function deleteBook(id: string): Promise<boolean> {
  const supabase = getSupabase();

  const current = getLocalBooks().filter((b) => b.id !== id);
  saveLocalBooks(current);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('books').delete().eq('id', id);
    } catch (err) {
      console.warn('Gagal menghapus dari Supabase:', err);
    }
  }

  return true;
}
