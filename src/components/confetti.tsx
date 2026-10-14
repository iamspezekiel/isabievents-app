'use client';

/**
 * Zero-dependency confetti burst — a short canvas animation used to celebrate
 * a confirmed purchase. Self-contained: resizes with its container, cleans up
 * its own RAF loop, and does no work after the burst finishes.
 */
import React, {useEffect, useRef} from 'react';

interface ConfettiProps {
  /** How long the burst animates (ms). */
  duration?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  shape: number;
}

const COLORS = ['#7E7CFF', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#a855f7'];

export function Confetti({duration = 3200, className}: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (): Particle => {
      const fromLeft = Math.random() < 0.5;
      return {
        x: (fromLeft ? 0.12 : 0.88) * canvas.width,
        y: 0.32 * canvas.height,
        vx: (fromLeft ? 1 : -1) * (2 + Math.random() * 5) * dpr,
        vy: (-6 - Math.random() * 7) * dpr,
        size: (5 + Math.random() * 7) * dpr,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        shape: (Math.random() * 3) | 0,
      };
    };

    const parts: Particle[] = Array.from({length: 160}, spawn);
    const gravity = 0.16 * dpr;
    const drag = 0.992;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = Math.max(0, 1 - elapsed / duration);
      for (const p of parts) {
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size * 0.5, p.size);
        }
        ctx.restore();
      }
      if (elapsed < duration) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [duration]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
