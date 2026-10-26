'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/lib/types';
import { getBookById } from '@/lib/storage';
import { AdminBookForm } from '@/components/AdminBookForm';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

function EditBookContent({ params }: EditBookPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      const data = await getBookById(resolvedParams.id);
      if (!data) {
        alert('Buku tidak ditemukan.');
        router.push('/admin');
        return;
      }
      setBook(data);
      setLoading(false);
    }
    loadBook();
  }, [resolvedParams.id, router]);

  if (loading) {
    return (
      <div className="container-wide" style={{ padding: '60px 20px', textAlign: 'center' }}>
        Memuat data buku...
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="container-wide" style={{ padding: '32px 20px 80px 20px' }}>
      <AdminBookForm initialBook={book} isEditMode={true} />
    </div>
  );
}

export default function EditBookPage({ params }: EditBookPageProps) {
  return (
    <AdminAuthGuard>
      <Suspense
        fallback={
          <div className="container-wide" style={{ padding: '60px 20px', textAlign: 'center' }}>
            Memuat formulir sunting...
          </div>
        }
      >
        <EditBookContent params={params} />
      </Suspense>
    </AdminAuthGuard>
  );
}
