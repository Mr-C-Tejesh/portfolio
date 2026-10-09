import React, { useRef, useEffect } from 'react';

export default function DotMatrixText({ text = "TEJESH C." }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 100 });
  const reqRef = useRef(null);
  const colorRef = useRef('#FFFFFF');

  useEffect(() => {
    // Resolve the CSS variable for the dot color, defaulting to pure white
    colorRef.current = getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim() || '#FFFFFF';

    let observer;
    document.fonts.ready.then(() => {
      initCanvas();

      observer = new ResizeObserver(() => {
        initCanvas();
      });

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    });

    return () => {
      if (observer) observer.disconnect();
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [text]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Reset any existing transforms before re-initializing
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();

    const width = rect.width;
    const offCanvas = document.createElement('canvas');
    const octx = offCanvas.getContext('2d', { willReadFrequently: true });

    let fontSize = 300;
    octx.font = `900 ${fontSize}px "Inter", sans-serif`;
    let metrics = octx.measureText(text);

    if (metrics.width > width * 0.95) {
      fontSize = Math.floor(fontSize * (width * 0.95) / metrics.width);
      octx.font = `900 ${fontSize}px "Inter", sans-serif`;
    }

    const height = Math.max(Math.ceil(fontSize * 1.5), 100);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    offCanvas.width = width;
    offCanvas.height = height;

    octx.font = `900 ${fontSize}px "Inter", sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = 'white';
    octx.fillText(text, width / 2, height / 2);

    const imageData = octx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const gap = Math.max(Math.floor(width / 150), 4);
    const radius = gap * 0.35;

    const newDots = [];
    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 128) {
          newDots.push({
            originX: x,
            originY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: radius
          });
        }
      }
    }

    dotsRef.current = newDots;
    draw(ctx, width, height, dpr);
  };

  const draw = (ctx, width, height, dpr) => {
    ctx.clearRect(0, 0, width, height);
    // Use the resolved color token instead of a CSS variable string that Canvas 2D API cannot parse
    ctx.fillStyle = colorRef.current;

    const dots = dotsRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    let needsUpdate = false;

    if (!reducedMotion && hasFinePointer) {
        const mouse = mouseRef.current;
        const spring = 0.08;
        const friction = 0.8;

        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          const oldX = dot.x;
          const oldY = dot.y;

          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            dot.vx -= Math.cos(angle) * force * 5;
            dot.vy -= Math.sin(angle) * force * 5;
          }

          dot.vx += (dot.originX - dot.x) * spring;
          dot.vy += (dot.originY - dot.y) * spring;

          dot.vx *= friction;
          dot.vy *= friction;

          dot.x += dot.vx;
          dot.y += dot.vy;

          // Stop animating when all dots have settled into equilibrium (no movement)
          if (Math.abs(dot.x - oldX) > 0.01 || Math.abs(dot.y - oldY) > 0.01) {
              needsUpdate = true;
          }
        }
    } else {
        for (let i = 0; i < dots.length; i++) {
            dots[i].x = dots[i].originX;
            dots[i].y = dots[i].originY;
        }
    }

    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      ctx.moveTo(dot.x, dot.y);
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    }
    ctx.fill();

    if (needsUpdate) {
      reqRef.current = requestAnimationFrame(() => draw(ctx, width, height, dpr));
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;

    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    reqRef.current = requestAnimationFrame(() => draw(ctx, canvas.width / dpr, canvas.height / dpr, dpr));
  };

  const handlePointerLeave = () => {
    mouseRef.current.x = -1000;
    mouseRef.current.y = -1000;

    // Ensure we trigger the loop to return dots to origin
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      reqRef.current = requestAnimationFrame(() => draw(ctx, canvas.width / dpr, canvas.height / dpr, dpr));
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-hidden="true"
        style={{ display: 'block', margin: '0 auto', touchAction: 'none' }}
      />
      <h1 className="visually-hidden">{text}</h1>
    </div>
  );
}
