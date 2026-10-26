-- ==============================================================================
-- SCHEMA LENGKAP SUPABASE UNTUK MEOW'S BOOK COLLECTION
-- Jalankan skrip ini langsung di menu SQL Editor di dashboard Supabase Anda.
-- ==============================================================================

-- 1. Buat Tabel Books (Koleksi Resensi Buku)
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    accent_color TEXT DEFAULT '#C85A32',
    paws_rating NUMERIC(3,1) DEFAULT 5.0 CHECK (paws_rating >= 1.0 AND paws_rating <= 5.0),
    paws_badge TEXT DEFAULT 'Pilihan Kurasi',
    is_featured BOOLEAN DEFAULT false,
    categories TEXT[] DEFAULT '{}',
    blurb TEXT NOT NULL,
    review_content TEXT NOT NULL,
    read_time TEXT DEFAULT '5 min read',
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Quotes (Kutipan Emas Pilihan dalam Resensi)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    page_number TEXT,
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indeks untuk Optimasi Performa Query
CREATE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_quotes_book_id ON public.quotes(book_id);

-- 4. Fungsi & Trigger Otomatis untuk Kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_books_updated_at ON public.books;
CREATE TRIGGER set_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Aktifkan Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 6. Hapus Kebijakan Lama jika ada
DROP POLICY IF EXISTS "Public Read Published Books" ON public.books;
DROP POLICY IF EXISTS "Admin Read All Books" ON public.books;
DROP POLICY IF EXISTS "Admin Insert Books" ON public.books;
DROP POLICY IF EXISTS "Admin Update Books" ON public.books;
DROP POLICY IF EXISTS "Admin Delete Books" ON public.books;

DROP POLICY IF EXISTS "Public Read Published Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Read All Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Insert Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Update Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Delete Quotes" ON public.quotes;

-- 7. Kebijakan RLS Tabel Books
-- Pengunjung publik hanya dapat membaca buku berstatus 'published'
CREATE POLICY "Public Read Published Books"
ON public.books
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admin yang telah login (authenticated) dapat membaca semua buku (termasuk draft)
CREATE POLICY "Admin Read All Books"
ON public.books
FOR SELECT
TO authenticated
USING (true);

-- Admin yang telah login (authenticated) dapat menambah buku baru
CREATE POLICY "Admin Insert Books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin yang telah login (authenticated) dapat memperbarui buku
CREATE POLICY "Admin Update Books"
ON public.books
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin yang telah login (authenticated) dapat menghapus buku
CREATE POLICY "Admin Delete Books"
ON public.books
FOR DELETE
TO authenticated
USING (true);

-- 8. Kebijakan RLS Tabel Quotes
-- Pengunjung publik dapat membaca kutipan dari buku yang sudah published
CREATE POLICY "Public Read Published Quotes"
ON public.quotes
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.books
        WHERE public.books.id = public.quotes.book_id
        AND public.books.status = 'published'
    )
);

-- Admin yang telah login (authenticated) memiliki akses penuh ke kutipan
CREATE POLICY "Admin Manage Quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Storage Bucket untuk File Sampul Buku
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Book Covers" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Book Covers" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Book Covers" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Book Covers" ON storage.objects;

-- Siapa saja dapat melihat gambar sampul
CREATE POLICY "Public Read Book Covers"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'book-covers');

-- Hanya admin terautentikasi yang dapat mengunggah gambar sampul
CREATE POLICY "Admin Upload Book Covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

-- Hanya admin terautentikasi yang dapat mengubah gambar sampul
CREATE POLICY "Admin Update Book Covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers');

-- Hanya admin terautentikasi yang dapat menghapus gambar sampul
CREATE POLICY "Admin Delete Book Covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');

-- ==============================================================================
-- CARA MEMBUAT AKUN ADMIN DI SUPABASE:
-- 1. Buka dashboard proyek Supabase Anda: https://supabase.com/dashboard
-- 2. Pilih menu "Authentication" di bilah kiri, lalu klik tab "Users".
-- 3. Klik tombol "Add user" -> "Create user".
-- 4. Masukkan email (misal: admin@meowsbooks.com) dan password yang aman.
-- 5. Centang "Auto Confirm User?" agar akun langsung aktif tanpa perlu konfirmasi email.
-- 6. Akun tersebut langsung dapat digunakan untuk login di website pada halaman /admin/login.
-- ==============================================================================
