import React from 'react';

interface PawIconProps {
  className?: string;
  size?: number;
  filled?: boolean;
}

export function PawIcon({ className = '', size = 16, filled = true }: PawIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? '0' : '2'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Telapak utama */}
      <path d="M12 11.5c-2.4 0-4.2 1.8-4.2 4.2 0 1.8 1.4 3.3 3.2 3.3.6 0 1.2-.2 1-.7-.3-.6.6-1.3 1.2-1.3s1.5.7 1.2 1.3c-.2.5.4.7 1 .7 1.8 0 3.2-1.5 3.2-3.3 0-2.4-1.8-4.2-6.6-4.2z" />
      {/* 4 Jari Cakar */}
      <circle cx="6.5" cy="9.5" r="2" />
      <circle cx="10" cy="6.5" r="2" />
      <circle cx="14" cy="6.5" r="2" />
      <circle cx="17.5" cy="9.5" r="2" />
    </svg>
  );
}
