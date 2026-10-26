'use client';

import React from 'react';
import { AdminBookForm } from '@/components/AdminBookForm';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function NewBookPage() {
  return (
    <AdminAuthGuard>
      <div className="container-wide" style={{ padding: '32px 20px 80px 20px' }}>
        <AdminBookForm isEditMode={false} />
      </div>
    </AdminAuthGuard>
  );
}
