'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StripeParallaxCanvasProps {
  accentColor: string;
}

export function StripeParallaxCanvas({ accentColor }: StripeParallaxCanvasProps) {
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Parallax Scroll Listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas Partikel Halus & Pendaran Cahaya Dinamis
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize);

    const particleCount = 24;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      baseOpacity: number;
      pulse: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const baseOpacity = 0.06 + Math.random() * 0.16;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.2 + Math.random() * 2.4,
        speedY: -0.15 - Math.random() * 0.3,
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: baseOpacity,
        baseOpacity,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Partikel cahaya terapung di antara pita gradien Stripe
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += 0.02;
        p.opacity = p.baseOpacity + Math.sin(p.pulse) * 0.05;
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 180, 140, ${Math.max(0, p.opacity)})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Kecepatan parallax multi-layer untuk pita diagonal khas Stripe
  const ribbon1Offset = -scrollY * 0.22;
  const ribbon2Offset = -scrollY * 0.38;
  const ribbon3Offset = -scrollY * 0.16;
  const glowOffset = -scrollY * 0.12;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* 1. LAYER PITA GRADIEN DIAGONAL KHAS STRIPE (SIGNATURE SKEWED STRIPES) */}
      <div
        style={{
          position: 'absolute',
          top: '-35%',
          left: '-20%',
          width: '140%',
          height: '180%',
          transform: 'skewY(-10deg)',
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {/* Pita Gradien Utama 1 (Vibrant Accent Stripe) */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: 0,
            width: '100%',
            height: '420px',
            transform: `translateY(${ribbon1Offset}px)`,
            background: `linear-gradient(110deg, transparent 0%, ${accentColor}28 20%, #E09F3E22 45%, ${accentColor}18 70%, transparent 100%)`,
            filter: 'blur(45px)',
            transition: 'background 0.8s ease',
            willChange: 'transform',
          }}
        />

        {/* Pita Gradien Sekunder 2 (Luminous Warm Amber Ribbon) */}
        <div
          style={{
            position: 'absolute',
            top: '55%',
            left: 0,
            width: '100%',
            height: '320px',
            transform: `translateY(${ribbon2Offset}px)`,
            background: `linear-gradient(115deg, transparent 0%, #DDA15E1F 25%, ${accentColor}24 55%, transparent 95%)`,
            filter: 'blur(55px)',
            transition: 'background 0.8s ease',
            willChange: 'transform',
          }}
        />

        {/* Pita Gradien Latar Belakang 3 (Deep Atmospheric Stripe) */}
        <div
          style={{
            position: 'absolute',
            top: '85%',
            left: 0,
            width: '100%',
            height: '480px',
            transform: `translateY(${ribbon3Offset}px)`,
            background: `linear-gradient(105deg, transparent 0%, ${accentColor}1C 30%, #C289291A 60%, transparent 100%)`,
            filter: 'blur(60px)',
            transition: 'background 0.8s ease',
            willChange: 'transform',
          }}
        />
      </div>

      {/* 2. Pendaran Cahaya Radial Ambient Fokus Buku */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          transform: `translate(-50%, -50%) translateY(${glowOffset}px)`,
          background: `radial-gradient(circle, ${accentColor}20 0%, transparent 68%)`,
          filter: 'blur(40px)',
          transition: 'background 0.8s ease',
          willChange: 'transform',
        }}
      />

      {/* 3. Canvas Partikel Mengambang Halus */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* 4. Tekstur Kertas Editorial Halus (Fine Paper Grain Overlay) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.038,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(rgba(0,0,0,0.85) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.85) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 2px 2px',
        }}
      />
    </div>
  );
}
