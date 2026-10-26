'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Book } from '@/lib/types';

interface Stripe3DBookProps {
  book: Book;
  scrollRatio?: number; // 0 to 1 as the section scrolls through viewport
}

export function Stripe3DBook({ book }: Stripe3DBookProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sudut rotasi 3D terinterpolasi halus (Damped Spring Physics)
  const [rotX, setRotX] = useState(6);
  const [rotY, setRotY] = useState(-18);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Target rotasi untuk animasi lerp
  const targetRot = useRef({ x: 6, y: -18, glareX: 50, glareY: 50, glareOpacity: 0 });
  const currentRot = useRef({ x: 6, y: -18, glareX: 50, glareY: 50, glareOpacity: 0 });
  const animFrame = useRef<number | null>(null);

  // Handle gerakan mouse di atas panggung 3D buku
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Hitung sudut kemiringan 3D proporsional (-18deg s/d +18deg)
    const degX = -(mouseY / (rect.height / 2)) * 14;
    const degY = (mouseX / (rect.width / 2)) * 22;

    // Posisi pantulan cahaya specular (glare)
    const gX = ((e.clientX - rect.left) / rect.width) * 100;
    const gY = ((e.clientY - rect.top) / rect.height) * 100;

    targetRot.current = {
      x: degX,
      y: degY - 6, // Biaskan sedikit miring ke kanan ala pajangan buku
      glareX: gX,
      glareY: gY,
      glareOpacity: 0.35,
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Kembalikan ke posisi display default buku Stripe Press
    targetRot.current = {
      x: 6,
      y: -18,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    };
  };

  // Efek parallax scroll: saat halaman digulir, sudut buku bergeser anggun
  useEffect(() => {
    const handleScroll = () => {
      if (isHovered || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Posisi vertikal buku di viewport (-1 s/d 1)
      const relativeY = (rect.top + rect.height / 2 - windowH / 2) / (windowH / 2);
      const clampedY = Math.max(-1, Math.min(1, relativeY));

      targetRot.current.x = clampedY * 10;
      targetRot.current.y = -18 + clampedY * 6;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHovered]);

  // Loop animasi LERP (Linear Interpolation) 60fps untuk gerakan elastis yang mulus
  useEffect(() => {
    const loop = () => {
      const ease = 0.085;
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * ease;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * ease;
      currentRot.current.glareX += (targetRot.current.glareX - currentRot.current.glareX) * ease;
      currentRot.current.glareY += (targetRot.current.glareY - currentRot.current.glareY) * ease;
      currentRot.current.glareOpacity +=
        (targetRot.current.glareOpacity - currentRot.current.glareOpacity) * ease;

      setRotX(currentRot.current.x);
      setRotY(currentRot.current.y);
      setGlarePos({
        x: currentRot.current.glareX,
        y: currentRot.current.glareY,
        opacity: currentRot.current.glareOpacity,
      });

      animFrame.current = requestAnimationFrame(loop);
    };

    animFrame.current = requestAnimationFrame(loop);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // Perhitungan bayangan dinamis realistis yang bergeser berlawanan dengan kemiringan
  const shadowX = -rotY * 1.5;
  const shadowY = Math.max(16, 24 + rotX * 1.2);
  const shadowBlur = 48 + Math.abs(rotY) * 0.8;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '280px',
        aspectRatio: '2 / 3',
        perspective: '1500px',
        perspectiveOrigin: '50% 50%',
        cursor: 'grab',
        touchAction: 'none',
      }}
      aria-label={`Buku 3D ${book.title}`}
    >
      {/* 3D Container Transform Space */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`,
          transition: isHovered ? 'none' : 'transform 0.4s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Bayangan Dinamis Realistis yang Jatuh ke Lantai/Latar Belakang */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(-28px)',
            boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px -10px rgba(0, 0, 0, 0.42), 0 8px 24px -4px rgba(0,0,0,0.22)`,
            borderRadius: '6px',
            pointerEvents: 'none',
            transition: 'box-shadow 0.1s ease-out',
          }}
        />

        {/* 1. MUKA DEPAN SAMPUL (FRONT COVER) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(13px)',
            borderRadius: '5px',
            overflow: 'hidden',
            backgroundColor: book.accent_color || '#1A1A1A',
            backfaceVisibility: 'hidden',
          }}
        >
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={`Sampul ${book.title}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px',
                textAlign: 'center',
                color: '#FFFFFF',
              }}
            >
              <div
                className="font-serif"
                style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}
              >
                {book.title}
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>{book.author}</div>
            </div>
          )}

          {/* Garis Lipatan Tulang Buku Kiri (Spine Joint Hinge) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '18px',
              background:
                'linear-gradient(to right, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.35) 30%, rgba(255,255,255,0.18) 70%, rgba(0,0,0,0.2) 100%)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />

          {/* Pantulan Cahaya Interaktif (Specular Sheen Glare) mengikuti kursor mouse */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, rgba(255,255,255,0) 65%)`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
        </div>

        {/* 2. TULANG BUKU KIRI 3D (BOOK SPINE) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '26px',
            height: '100%',
            transformOrigin: 'left center',
            transform: 'rotateY(-90deg) translateX(-26px)',
            backgroundColor: book.accent_color || '#1A1A1A',
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.5) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              transform: 'rotate(-90deg)',
              whiteSpace: 'nowrap',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              opacity: 0.85,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {book.title}
          </div>
        </div>

        {/* 3. TEPIAN KERTAS BUKU KANAN 3D (PAGE FORE-EDGE) */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            right: 0,
            width: '24px',
            height: 'calc(100% - 6px)',
            transformOrigin: 'right center',
            transform: 'rotateY(90deg) translateX(12px)',
            background:
              'repeating-linear-gradient(to bottom, #FAF8F2 0px, #FAF8F2 1px, #EBE6D8 1px, #EBE6D8 2px)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.18)',
          }}
        />

        {/* 4. TEPIAN KERTAS ATAS (TOP PAGE EDGE) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '3px',
            width: 'calc(100% - 6px)',
            height: '24px',
            transformOrigin: 'top center',
            transform: 'rotateX(90deg) translateY(-12px)',
            background:
              'repeating-linear-gradient(to right, #FAF8F2 0px, #FAF8F2 1px, #EBE6D8 1px, #EBE6D8 2px)',
          }}
        />

        {/* 5. TEPIAN KERTAS BAWAH (BOTTOM PAGE EDGE) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '3px',
            width: 'calc(100% - 6px)',
            height: '24px',
            transformOrigin: 'bottom center',
            transform: 'rotateX(-90deg) translateY(12px)',
            background:
              'repeating-linear-gradient(to right, #FAF8F2 0px, #FAF8F2 1px, #EBE6D8 1px, #EBE6D8 2px)',
          }}
        />

        {/* 6. SAMPUL BELAKANG (BACK COVER) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(-13px) rotateY(180deg)',
            backgroundColor: book.accent_color || '#1A1A1A',
            borderRadius: '5px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </div>
  );
}
