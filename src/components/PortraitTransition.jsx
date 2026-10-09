import React, { useEffect, useRef, useState } from 'react';

export default function PortraitTransition({ targetRef }) {
  const imgRef = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handler = (e) => setIsReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;
    
    let rafId;

    const updatePosition = () => {
      const img = imgRef.current;
      const target = targetRef?.current;
      
      if (!img || !target) return;

      const scrollY = window.scrollY;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const t = Math.min(1, Math.max(0, scrollY / viewportHeight));
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      
      const targetRect = target.getBoundingClientRect();
      const targetX = targetRect.left;
      const targetY = targetRect.top;
      const targetWidth = targetRect.width;

      if (t >= 1) {
        // Locked to the document for zero jitter
        img.style.position = 'absolute';
        img.style.left = '0px';
        img.style.top = '0px';
        img.style.width = `${targetWidth}px`;
        img.style.transform = `translate3d(${targetX + window.scrollX}px, ${targetY + window.scrollY}px, 0)`;
        img.style.opacity = 1;
        img.style.filter = 'none';
        img.style.zIndex = 10;
        return;
      }
      
      // Transitioning
      const heroWidth = Math.min(viewportWidth * 0.45, 600);
      const heroX = viewportWidth > 768 ? viewportWidth - heroWidth + (heroWidth * 0.1) : (viewportWidth - heroWidth) / 2;
      const heroY = viewportHeight * 0.1;
      
      const currentWidth = heroWidth + (targetWidth - heroWidth) * easeT;
      const currentX = heroX + (targetX - heroX) * easeT;
      const currentY = heroY + (targetY - heroY) * easeT;
      
      const opacity = 0.06 + (1 - 0.06) * Math.min(1, t * 1.5);
      
      img.style.position = 'fixed';
      img.style.left = '0px';
      img.style.top = '0px';
      img.style.width = `${currentWidth}px`;
      img.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      img.style.opacity = opacity;
      img.style.filter = 'none';
      img.style.zIndex = easeT > 0.5 ? 10 : 0;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          updatePosition();
          rafId = null;
        });
      }
    };

    const onResize = () => {
      updatePosition();
    };

    // Initial position
    updatePosition();
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [targetRef, isReducedMotion]);

  useEffect(() => {
    if (!isReducedMotion) return;
    
    const img = imgRef.current;
    const target = targetRef?.current;
    if (!img || !target) return;
    
    const updateStatic = () => {
      const rect = target.getBoundingClientRect();
      img.style.position = 'absolute';
      img.style.width = `${rect.width}px`;
      img.style.left = `${rect.left + window.scrollX}px`;
      img.style.top = `${rect.top + window.scrollY}px`;
      img.style.opacity = 1;
      img.style.filter = 'none';
      img.style.transform = 'none';
      img.style.pointerEvents = 'none';
      img.style.zIndex = 10;
    };
    
    updateStatic();
    window.addEventListener('resize', updateStatic, { passive: true });
    return () => window.removeEventListener('resize', updateStatic);
  }, [isReducedMotion, targetRef]);

  return (
    <img
      ref={imgRef}
      src="/images/tejesh-halftone.png"
      alt=""
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '-1000px',
        left: '-1000px',
        transformOrigin: 'top left',
        willChange: 'transform, width, opacity, filter',
        pointerEvents: 'none'
      }}
    />
  );
}
