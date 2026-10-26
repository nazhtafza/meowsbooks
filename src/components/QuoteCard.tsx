'use client';

import React, { useState } from 'react';
import { Quote } from '@/lib/types';

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote.quote_text}" ${quote.page_number ? `(${quote.page_number})` : ''}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  };

  return (
    <blockquote className="quote-card">
      <p className="quote-body">&ldquo;{quote.quote_text}&rdquo;</p>
      <div className="quote-meta">
        {quote.page_number && <span>{quote.page_number}</span>}
        {quote.context && <span>&bull; {quote.context}</span>}
        <button
          onClick={handleCopy}
          type="button"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: copied ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Salin kutipan ke clipboard"
        >
          {copied ? 'Tersalin' : 'Salin Kutipan'}
        </button>
      </div>
    </blockquote>
  );
}
