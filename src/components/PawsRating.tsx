import React from 'react';
import { PawIcon } from './PawIcon';

interface PawsRatingProps {
  rating: number; // 1.0 to 5.0
  badge?: string;
  showScore?: boolean;
  size?: number;
}

export function PawsRating({
  rating,
  badge,
  showScore = true,
  size = 14,
}: PawsRatingProps) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const roundedRating = Math.round(normalizedRating);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="paws-row" aria-label={`Rating: ${normalizedRating.toFixed(1)} dari 5 Paws`}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <PawIcon
            key={idx}
            size={size}
            filled={idx <= roundedRating}
            className={idx <= roundedRating ? 'paw-icon paw-filled' : 'paw-icon paw-empty'}
          />
        ))}
      </div>

      {showScore && (
        <span
          className="font-mono"
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {normalizedRating.toFixed(1)}
        </span>
      )}

      {badge && (
        <span className="paws-badge-pill">
          <PawIcon size={11} filled={true} className="paw-icon paw-filled" />
          <span>{badge}</span>
        </span>
      )}
    </div>
  );
}
