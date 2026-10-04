import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
  gravity: number;
  flicker?: boolean;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface EffectsCanvasProps {
  effectType: 'fireworks' | 'explosion' | null;
  triggerKey: number;
  onComplete?: () => void;
}

export const EffectsCanvas: React.FC<EffectsCanvasProps> = ({
  effectType,
  triggerKey,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!effectType || triggerKey === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];

    const centerX = width / 2;
    const centerY = height / 2;

    if (effectType === 'fireworks') {
      // Spawn multi-color celebratory fireworks
      const colors = ['#22c55e', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff', '#4ade80'];
      const burstCount = 3;

      for (let b = 0; b < burstCount; b++) {
        const bx = centerX + (Math.random() - 0.5) * (width * 0.5);
        const by = centerY - (Math.random() * 0.25) * height;
        const particleCount = 45;

        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
          const speed = Math.random() * 4.5 + 2;
          const color = colors[Math.floor(Math.random() * colors.length)];

          particles.push({
            x: bx,
            y: by,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            size: Math.random() * 3 + 2,
            color,
            decay: Math.random() * 0.015 + 0.012,
            gravity: 0.08,
            flicker: Math.random() > 0.4,
          });
        }
      }
    } else if (effectType === 'explosion') {
      // Spawn explosive smoke and shockwave
      const colors = ['#ef4444', '#f97316', '#eab308', '#78716c', '#44403c'];

      // Add shockwave ring
      shockwaves.push({
        x: centerX,
        y: centerY,
        radius: 10,
        maxRadius: Math.min(width, height) * 0.55,
        alpha: 1,
        color: '#ef4444',
        lineWidth: 6,
      });
      shockwaves.push({
        x: centerX,
        y: centerY,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.4,
        alpha: 0.9,
        color: '#fbbf24',
        lineWidth: 4,
      });

      // Explosion debris & fiery sparks
      const debrisCount = 60;
      for (let i = 0; i < debrisCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 1.5;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: Math.random() * 5 + 2.5,
          color,
          decay: Math.random() * 0.03 + 0.02,
          gravity: 0.12,
        });
      }
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.14 + 1.5;
        sw.alpha -= 0.03;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = sw.lineWidth;
        ctx.stroke();
        ctx.restore();
      }

      // Render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        let currentAlpha = p.alpha;
        if (p.flicker && Math.random() > 0.5) {
          currentAlpha *= 0.5;
        }
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0 || shockwaves.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [effectType, triggerKey, onComplete]);

  if (!effectType) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 w-full h-full rounded-2xl"
    />
  );
};
