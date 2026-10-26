'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Book } from '@/lib/types';

interface FeaturedCarouselProps {
  books: Book[];
}

export function FeaturedCarousel({ books }: FeaturedCarouselProps) {
  // Bangun extended list dengan 3 set untuk infinite looping yang mulus tanpa lompatan visual
  const { baseLength, items } = useMemo(() => {
    if (!books || books.length === 0) return { baseLength: 0, items: [] as Book[] };
    let base = [...books];
    // Pastikan base memiliki minimal 3 elemen agar rotasi cover flow kiri, tengah, kanan selalu terisi
    while (base.length < 3) {
      base = [...base, ...books];
    }
    return {
      baseLength: base.length,
      items: [...base, ...base, ...base],
    };
  }, [books]);

  // Posisi awal di set tengah
  const [currentIndex, setCurrentIndex] = useState(baseLength || 0);
  const [prevBaseLength, setPrevBaseLength] = useState(baseLength);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isLocked = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sesuaikan posisi awal jika baseLength berubah (misal data async buku selesai termuat)
  if (baseLength !== prevBaseLength) {
    setPrevBaseLength(baseLength);
    setCurrentIndex(baseLength);
  }

  // Fungsi geser maju ke kanan / slide berikutnya
  const handleNext = useCallback(() => {
    if (isLocked.current) return;
    isLocked.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => {
      isLocked.current = false;
    }, 450);
  }, []);

  // Fungsi geser mundur ke kiri / slide sebelumnya
  const handlePrev = useCallback(() => {
    if (isLocked.current) return;
    isLocked.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      isLocked.current = false;
    }, 450);
  }, []);

  // Reset indeks secara hening (silent jump) saat animasi mencapai batas luar
  useEffect(() => {
    if (!isTransitioning || baseLength === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex >= baseLength * 2) {
        setIsTransitioning(false);
        setCurrentIndex((prev) => prev - baseLength);
      } else if (currentIndex < baseLength) {
        setIsTransitioning(false);
        setCurrentIndex((prev) => prev + baseLength);
      }
    }, 660);

    return () => clearTimeout(timer);
  }, [currentIndex, isTransitioning, baseLength]);

  // Re-enable transisi setelah silent jump
  useEffect(() => {
    if (!isTransitioning) {
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(frame2);
      });
      return () => cancelAnimationFrame(frame1);
    }
  }, [isTransitioning]);

  // Auto-play looping animasi setiap 3.8 detik
  useEffect(() => {
    if (books.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3800);

    return () => clearInterval(timer);
  }, [books.length, isPaused, handleNext]);

  if (!books || books.length === 0) return null;

  // Indeks aktif pada array asli buku
  const realActiveIndex =
    books.length > 0 ? ((currentIndex % books.length) + books.length) % books.length : 0;
  const activeBook = books[realActiveIndex] || books[0];

  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToSlide = (targetDotIndex: number) => {
    if (isLocked.current) return;
    let diff = targetDotIndex - realActiveIndex;
    if (diff === 0) return;
    if (diff > books.length / 2) diff -= books.length;
    if (diff < -books.length / 2) diff += books.length;

    isLocked.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + diff);
    setTimeout(() => {
      isLocked.current = false;
    }, 450);
  };

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(28px, 4vw, 48px) 0 clamp(24px, 3.5vw, 40px) 0',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '32px',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Ambient Lighting Glow terkalibrasi pas mengikuti rona buku tengah yang disorot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(360px, 48vw, 560px)',
          height: 'clamp(360px, 48vw, 560px)',
          background: `radial-gradient(circle, ${activeBook?.accent_color || '#C85A32'}28 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'background 0.7s ease',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Stage 3D Cover Flow: Posisi fisik setiap buku dihitung secara proporsional */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '860px',
            height: 'clamp(290px, 42vw, 450px)',
            perspective: '1300px',
            perspectiveOrigin: 'center center',
          }}
        >
          {items.map((item, idx) => {
            const diff = idx - currentIndex;
            const isVisible = Math.abs(diff) <= 2;
            if (!isVisible) return null;

            const isCenter = diff === 0;
            const isLeft = diff === -1;
            const isRight = diff === 1;

            // Perhitungan transformasi 3D ruang fisik yang proporsional
            const xOffset =
              diff === 0
                ? '0px'
                : diff > 0
                ? `calc(${diff} * clamp(140px, 20vw, 220px))`
                : `calc(${diff} * clamp(140px, 20vw, 220px))`;

            const zOffset = isCenter ? '45px' : Math.abs(diff) === 1 ? '-65px' : '-130px';
            const rotY = isCenter ? '0deg' : diff < 0 ? '22deg' : '-22deg';
            const scale = isCenter ? 1.08 : Math.abs(diff) === 1 ? 0.80 : 0.65;
            const opacity = isCenter ? 1 : Math.abs(diff) === 1 ? 0.45 : 0;
            const filter = isCenter ? 'brightness(1)' : 'brightness(0.86)';
            const zIndex = isCenter ? 10 : Math.abs(diff) === 1 ? 4 : 1;

            const transform = `translate(-50%, -50%) translateX(${xOffset}) translateZ(${zOffset}) rotateY(${rotY}) scale(${scale})`;
            const transition = isTransitioning
              ? 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), filter 0.65s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none';

            return (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 'clamp(175px, 25vw, 280px)',
                  transform,
                  opacity,
                  filter,
                  zIndex,
                  pointerEvents: Math.abs(diff) <= 1 ? 'auto' : 'none',
                  transition,
                  willChange: 'transform, opacity',
                }}
              >
                <Link
                  href={`/books/${item.slug}`}
                  onClick={(e) => {
                    if (isLeft) {
                      e.preventDefault();
                      handlePrev();
                    } else if (isRight) {
                      e.preventDefault();
                      handleNext();
                    } else if (!isCenter) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    cursor: isCenter ? 'pointer' : Math.abs(diff) === 1 ? 'pointer' : 'default',
                  }}
                  aria-label={isCenter ? `Buka resensi ${item.title}` : `Lihat sampul ${item.title}`}
                >
                  <div className="book-cover-wrapper" style={{ width: '100%' }}>
                    <div
                      className="book-cover-surface"
                      style={{
                        boxShadow: isCenter
                          ? '0 20px 48px -10px rgba(0, 0, 0, 0.38), 0 10px 22px -5px rgba(0,0,0,0.18)'
                          : 'var(--shadow-book)',
                        borderRadius: '6px',
                        transition: isTransitioning
                          ? 'box-shadow 0.65s cubic-bezier(0.22, 1, 0.36, 1)'
                          : 'none',
                      }}
                    >
                      <div
                        className="book-spine-line"
                        style={{ width: isCenter ? '18px' : '12px' }}
                      />
                      {item.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.cover_url} alt="" className="book-cover-img" />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: item.accent_color || '#1A1A1A',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Tombol Panah Navigasi Minimalis & Titik Paginasi */}
        {books.length > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
              aria-label="Sebelumnya"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Titik Paginasi Looping */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              {books.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  style={{
                    width: realActiveIndex === idx ? '22px' : '7px',
                    height: '7px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor:
                      realActiveIndex === idx
                        ? 'var(--text-main)'
                        : 'var(--border-strong)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    padding: 0,
                  }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
              aria-label="Selanjutnya"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
