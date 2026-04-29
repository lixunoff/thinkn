'use client';

import { useEffect, useRef, useState } from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo({ className, style }: LogoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      setScale(width / 2815);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: 'relative',
        aspectRatio: '2815 / 800',
        overflow: 'visible',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2815px',
          height: '800px',
          transformOrigin: 'top left',
          transform: `scale(${scale ?? 0})`,
          opacity: scale === null ? 0 : 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src="/sphere-colored.png"
          alt=""
          style={{
            width: '1600px',
            height: '1600px',
            marginLeft: '-400px',
            flexShrink: 0,
          }}
        />
        <img
          src="/thinkn-white.svg"
          alt="Thinkn"
          style={{
            marginLeft: '-200px',
            height: '480px',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}
