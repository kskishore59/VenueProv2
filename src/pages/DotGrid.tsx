import { useRef, useEffect } from 'react';

interface DotGridProps {
  dotColor?: string;
  hoverColor?: string;
  gap?: number;
  maxDistance?: number;
}

export default function DotGrid({
  dotColor = 'rgba(6, 24, 49, 0.18)', // slate-400 with opacity
  hoverColor = 'rgba(30, 94, 255, 0.75)', // brand-blue with opacity
  gap = 20,
  maxDistance = 130
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    // Listen to mouse events globally on window for smooth tracking across sections
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const isMouseActive = mouseRef.current.active;

      const cols = Math.floor(width / gap) + 2;
      const rows = Math.floor(height / gap) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap;
          const y = j * gap;

          let radius = 1.2;
          let drawX = x;
          let drawY = y;
          let color = dotColor;

          if (isMouseActive) {
            const dx = mouseX - x;
            const dy = mouseY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const factor = (maxDistance - dist) / maxDistance;

              // Scale radius up smoothly
              radius = 1.2 + factor * 2.8;

              // Magnetic repulsion warp effect (dots push away from cursor slightly)
              const warpStrength = 10;
              const angle = Math.atan2(dy, dx);
              drawX = x - Math.cos(angle) * factor * warpStrength;
              drawY = y - Math.sin(angle) * factor * warpStrength;

              // Highlight dots near the cursor
              color = hoverColor;
            }
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotColor, hoverColor, gap, maxDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
}
