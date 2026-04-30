'use client';

import { useEffect, useRef, useState } from 'react';

const DOT_X = 762.5;
const DOT_Y = 57.4976;
const SVG_H_ORIG = 495;

function calcSvgHeight(W: number, H: number): number {
  const cx = W / 2, cy = H / 2;
  const R = H / 2 - 24;
  const a = DOT_X;
  const b = SVG_H_ORIG - DOT_Y;
  const A = a * a + b * b;
  const B = -2 * (a * cx + b * cy);
  const C = cx * cx + cy * cy - R * R;
  const disc = B * B - 4 * A * C;
  if (disc < 0) return 337;
  const s1 = (-B + Math.sqrt(disc)) / (2 * A);
  const s2 = (-B - Math.sqrt(disc)) / (2 * A);
  return (s2 > 0 ? s2 : s1) * SVG_H_ORIG;
}

function useLogoLayout() {
  const [layout, setLayout] = useState({
    svgHeight: 0, circleRadius: 0, dotInitAngle: 0, dotR: 0,
    windowWidth: 0, windowHeight: 0,
  });
  useEffect(() => {
    const calc = () => {
      const W = window.innerWidth, H = window.innerHeight;
      const svgHeight = calcSvgHeight(W, H);
      const scale = svgHeight / SVG_H_ORIG;
      const dotScreenX = DOT_X * scale;
      const dotScreenY = H - (SVG_H_ORIG - DOT_Y) * scale;
      setLayout({
        svgHeight,
        circleRadius: H / 2 - 24,
        dotInitAngle: Math.atan2(dotScreenY - H / 2, dotScreenX - W / 2),
        dotR: 57.5 * scale,
        windowWidth: W,
        windowHeight: H,
      });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return layout;
}

export default function Hero() {
  const { svgHeight, circleRadius, dotInitAngle, dotR, windowWidth, windowHeight } = useLogoLayout();
  const orbitCx = windowWidth / 2;
  const orbitCy = windowHeight / 2;
  const orbitStartX = orbitCx + circleRadius * Math.cos(dotInitAngle);
  const orbitStartY = orbitCy + circleRadius * Math.sin(dotInitAngle);
  const orbitMidX = orbitCx - circleRadius * Math.cos(dotInitAngle);
  const orbitMidY = orbitCy - circleRadius * Math.sin(dotInitAngle);
  const orbitCircumference = 2 * Math.PI * circleRadius;

  const dotRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const shakeRafRef = useRef<number | null>(null);
  const meteorRafRef = useRef<number | null>(null);

  const [introPhase, setIntroPhase] = useState(0);
  const introPhaseRef = useRef(0);
  useEffect(() => { introPhaseRef.current = introPhase; }, [introPhase]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(1), 300),
      setTimeout(() => setIntroPhase(2), 1150),
      setTimeout(() => setIntroPhase(3), 2100),
      setTimeout(() => setIntroPhase(4), 2600),
      setTimeout(() => setIntroPhase(5), 3200),
      setTimeout(() => setIntroPhase(6), 3600),
      setTimeout(() => setIntroPhase(7), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!circleRadius || !dotInitAngle) return;
    const ANIM_DURATION = 7000;
    const PAUSE_DURATION = 3000;
    const REVOLUTION = Math.PI * 2;
    const easeInOut = (t: number) =>
      t < 0.5 ? 128 * t ** 8 : 1 - Math.pow(-2 * t + 2, 8) / 2;

    const setDotPos = (angle: number) => {
      if (!dotRef.current) return;
      dotRef.current.style.left = `${window.innerWidth / 2 + circleRadius * Math.cos(angle)}px`;
      dotRef.current.style.top = `${window.innerHeight / 2 + circleRadius * Math.sin(angle)}px`;
    };

    angleRef.current = dotInitAngle;
    setDotPos(dotInitAngle);

    let phase: 'pausing' | 'animating' = 'pausing';
    let phaseStart: number | null = null;
    let startAngle = dotInitAngle;

    const tick = (ts: number) => {
      if (phaseStart === null) phaseStart = ts;
      const elapsed = ts - phaseStart;
      if (phase === 'pausing') {
        if (elapsed >= PAUSE_DURATION) { phase = 'animating'; startAngle = angleRef.current; phaseStart = ts; }
      } else {
        const t = Math.min(elapsed / ANIM_DURATION, 1);
        const angle = startAngle + easeInOut(t) * REVOLUTION;
        angleRef.current = angle;
        setDotPos(angle);
        if (t >= 1) { phase = 'pausing'; phaseStart = ts; }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [circleRadius, dotInitAngle]);

  useEffect(() => {
    const shake = (ts: number) => {
      if (introPhaseRef.current >= 3 && sphereRef.current) {
        const t = ts / 1000;
        const x = 4 * Math.sin(3.3 * t) + 2.5 * Math.sin(7.1 * t + 1.2) + 1.5 * Math.sin(13.7 * t + 0.7);
        const y = 4 * Math.sin(2.9 * t + 0.5) + 2.5 * Math.sin(6.3 * t + 2.1) + 1.5 * Math.sin(11.9 * t + 1.8);
        sphereRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }
      shakeRafRef.current = requestAnimationFrame(shake);
    };
    shakeRafRef.current = requestAnimationFrame(shake);
    return () => { if (shakeRafRef.current) cancelAnimationFrame(shakeRafRef.current); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const canvasFront = canvasFrontRef.current;
    if (!canvasFront) return;
    const ctxFront = canvasFront.getContext('2d');
    if (!ctxFront) return;

    const resize = () => {
      canvas.width = canvasFront.width = window.innerWidth;
      canvas.height = canvasFront.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Meteor {
      x: number; y: number;
      speed: number; length: number; opacity: number;
      layer: 'back' | 'front';
    }
    const meteors: Meteor[] = [];
    const MAX = 14;
    const D = Math.SQRT1_2;

    const spawn = (): Meteor => {
      const front = Math.random() > 0.75;
      const len = front ? 120 + Math.random() * 100 : 30 + Math.random() * 50;
      const fromTop = Math.random() > 0.4;
      return {
        x: fromTop ? Math.random() * (canvas.width + len) : canvas.width + len,
        y: fromTop ? -len : Math.random() * canvas.height,
        speed: front ? 1400 + Math.random() * 600 : 300 + Math.random() * 300,
        length: len,
        opacity: front ? 0.6 + Math.random() * 0.35 : 0.08 + Math.random() * 0.2,
        layer: front ? 'front' : 'back',
      };
    };

    let lastTs = 0;
    let nextSpawn = 0;

    const drawMeteor = (c: CanvasRenderingContext2D, m: Meteor) => {
      const tailX = m.x + m.length * D;
      const tailY = m.y - m.length * D;
      const grad = c.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, 'rgba(255,33,32,0)');
      grad.addColorStop(1, `rgba(255,255,255,${m.opacity})`);
      c.beginPath();
      c.moveTo(tailX, tailY);
      c.lineTo(m.x, m.y);
      c.strokeStyle = grad;
      c.lineWidth = m.layer === 'front' ? 2 : 1;
      c.stroke();
    };

    const draw = (ts: number) => {
      const dt = lastTs ? (ts - lastTs) / 1000 : 0;
      lastTs = ts;

      if (introPhaseRef.current < 2) {
        meteorRafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);

      if (ts >= nextSpawn && meteors.length < MAX) {
        meteors.push(spawn());
        nextSpawn = ts + 300 + Math.random() * 1200;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x -= m.speed * dt * D;
        m.y += m.speed * dt * D;
        if (m.x + m.length * D < 0 || m.y - m.length * D > canvas.height) {
          meteors.splice(i, 1);
          continue;
        }
        drawMeteor(m.layer === 'front' ? ctxFront : ctx, m);
      }

      meteorRafRef.current = requestAnimationFrame(draw);
    };

    meteorRafRef.current = requestAnimationFrame(draw);
    return () => {
      if (meteorRafRef.current) cancelAnimationFrame(meteorRafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const svgScale = svgHeight / SVG_H_ORIG;
  const STROKE_XS = [130, 370, 610, 720, 830, 1070, 1180, 1490, 1730];
  const strokeW = Math.round(85 * svgScale);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 998, pointerEvents: 'none' }} />

      <section
        className="relative w-full overflow-hidden"
        style={{
          height: '100vh',
          backgroundColor: '#0D0D0D',
          transform: introPhase >= 1 ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)',
          zIndex: 999,
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            opacity: 0.06,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            pointerEvents: 'none',
            zIndex: 2,
            opacity: introPhase >= 3 ? 1 : 0,
            transform: introPhase >= 3 ? 'scale(1)' : 'scale(0.1)',
            transition: 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: '50% 50%',
          }}
        >
          <div
            className="absolute"
            style={{
              top: '50%', left: '50%',
              width: `${circleRadius * 1.4}px`, height: `${circleRadius * 1.4}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: '#FF2120',
              opacity: 0.32,
              filter: 'blur(100px)',
            }}
          />
        </div>

        {circleRadius > 0 && (
          <svg
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
              zIndex: 2,
              overflow: 'visible',
            }}
          >
            <defs>
              <mask id="orbit-mask">
                <rect width="100%" height="100%" fill="black" />
                <path
                  d={`M ${orbitStartX} ${orbitStartY} A ${circleRadius} ${circleRadius} 0 0 1 ${orbitMidX} ${orbitMidY} A ${circleRadius} ${circleRadius} 0 0 1 ${orbitStartX} ${orbitStartY}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeDasharray={orbitCircumference}
                  strokeDashoffset={introPhase >= 4 ? 0 : orbitCircumference}
                  style={{ transition: introPhase >= 4 ? 'stroke-dashoffset 1.2s ease-in-out' : 'none' }}
                />
              </mask>
            </defs>
            <circle
              cx={orbitCx} cy={orbitCy} r={circleRadius}
              fill="none"
              stroke="rgba(255, 33, 32, 0.24)"
              strokeWidth="2"
              strokeDasharray="6 12"
              mask="url(#orbit-mask)"
            />
          </svg>
        )}

        <div
          className="absolute inset-0"
          style={{
            pointerEvents: 'none',
            zIndex: 6,
            opacity: introPhase >= 3 ? 1 : 0,
            transform: introPhase >= 3 ? 'scale(1)' : 'scale(4)',
            transition: 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: '50% 50%',
          }}
        >
          <img
            ref={sphereRef}
            src="/sphere-hero.png"
            alt=""
            className="absolute"
            style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${circleRadius * 1.6}px`, height: `${circleRadius * 1.6}px`,
            }}
          />
        </div>

        <canvas ref={canvasFrontRef} className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 7 }} />

        {dotR > 0 && (
          <div
            ref={dotRef}
            className="absolute"
            style={{
              width: `${dotR * 2}px`,
              height: `${dotR * 2}px`,
              borderRadius: '50%',
              backgroundColor: 'white',
              zIndex: 8,
              transform: introPhase >= 2 ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) translateY(-100vh)',
              transition: introPhase >= 2 ? 'transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
            }}
          />
        )}

        {svgHeight > 0 && STROKE_XS.map(x => (
          <div
            key={x}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${Math.round(x * svgScale)}px`,
              width: `${strokeW}px`,
              height: introPhase >= 2 ? 0 : introPhase >= 1 ? 'calc(100vh + 10px)' : '10px',
              backgroundColor: 'white',
              transition: introPhase >= 2
                ? 'height 0.95s cubic-bezier(0.76, 0, 0.24, 1)'
                : 'height 0.85s cubic-bezier(0.76, 0, 0.24, 1)',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          />
        ))}

        {svgHeight > 0 && (
          <svg
            viewBox="0 0 1815 495"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute"
            style={{
              top: introPhase >= 2 ? `calc(100% - ${svgHeight}px)` : `-${svgHeight}px`,
              left: 0,
              height: `${svgHeight}px`,
              pointerEvents: 'none',
              zIndex: 5,
              transition: introPhase >= 2 ? 'top 0.85s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
            }}
          >
            <path d="M1180 494.968V14.9995H1265V299.988L1380 154.876H1475L1335 324.986L1475 494.968L1380 494.979L1265 349.985V494.968H1180Z" fill="white"/>
            <path d="M720 494.979V154.994H805V494.979H720Z" fill="white"/>
            <path d="M370 494.968V14.9995H455V194.645C466.883 178.646 480.649 166.761 500.302 158.99C520.412 150.762 540.521 146.648 560.631 146.648C599.936 146.648 632.157 159.447 657.294 185.045C682.431 210.187 695 246.756 695 294.753V494.968L610 494.999V314.987C610 289.389 603.373 265.272 590.119 249.73C577.322 233.731 557.637 224.991 532.5 224.991C507.363 224.991 488.656 233.731 474.945 249.73C461.691 265.272 455 289.389 455 314.987V494.968H370Z" fill="white"/>
            <path d="M830 494.979V154.994H915V194.651C926.883 178.652 940.649 166.767 960.302 158.996C980.412 150.768 1000.52 146.654 1020.63 146.654C1059.94 146.654 1092.16 159.453 1117.29 185.052C1142.43 210.193 1155 246.762 1155 294.759V494.979H1070V314.993C1070 289.395 1063.37 265.278 1050.12 249.736C1037.32 233.737 1017.64 224.997 992.5 224.997C967.363 224.997 948.656 233.737 934.945 249.736C921.691 265.278 915 289.395 915 314.993V494.979H830Z" fill="white"/>
            <path d="M1490 494.979V154.994H1575V194.651C1586.88 178.652 1600.65 166.767 1620.3 158.996C1640.41 150.768 1660.52 146.654 1680.63 146.654C1719.94 146.654 1752.16 159.453 1777.29 185.052C1802.43 210.193 1815 246.762 1815 294.759V494.979H1730V314.993C1730 289.395 1723.37 265.278 1710.12 249.736C1697.32 233.737 1677.64 224.997 1652.5 224.997C1627.36 224.997 1608.66 233.737 1594.95 249.736C1581.69 265.278 1575 289.395 1575 314.993V494.979H1490Z" fill="white"/>
            <path d="M130 494.968V89.9964H0V14.9995H345V89.9964H215V494.968H130Z" fill="white"/>
          </svg>
        )}

        <div
          className="absolute inset-0 z-10"
          style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            columnGap: '48px',
          }}
        >
          <h1
            style={{
              gridColumn: '1 / span 5',
              alignSelf: 'start',
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--lh-h2)',
              letterSpacing: 'var(--ls-h2)',
            }}
          >
            {[
              { text: 'One' },
              { text: 'partner.', break: true },
              { text: 'End-to-end', color: 'var(--thinkn-grey-400)' },
              { text: 'digital', break: true },
              { text: 'infrastructure.' },
            ].map((word, i) => (
              <span key={i}>
                <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.3em', marginBottom: '-0.3em' }}>
                  <span style={{
                    display: 'inline-block',
                    color: word.color ?? '#FFFFFF',
                    transform: introPhase >= 5 ? 'translateY(0)' : 'translateY(150%)',
                    transition: introPhase >= 5
                      ? `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.07}s`
                      : 'none',
                  }}>
                    {word.text}
                  </span>
                </span>
                {word.break ? <br /> : i < 4 ? ' ' : null}
              </span>
            ))}
          </h1>

          <div style={{ gridColumn: '10 / span 3', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <nav
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: 'var(--text-h5)',
                lineHeight: 'var(--lh-h5)',
                letterSpacing: 'var(--ls-h5)',
                fontWeight: 700,
              }}
            >
              {['Company', 'Services', 'Team', 'Contact'].map((item, i, arr) => (
                <span key={item} style={{ display: 'flex' }}>
                  <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.3em', marginBottom: '-0.3em' }}>
                    <a
                      href="#"
                      className="text-thinkn-electric-orange hover:text-white"
                      style={{
                        display: 'inline-block',
                        textDecoration: 'none',
                        transition: introPhase >= 6
                          ? `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.07}s, color 0.15s`
                          : 'color 0.15s',
                        transform: introPhase >= 6 ? 'translateY(0)' : 'translateY(150%)',
                      }}
                    >
                      {item}
                    </a>
                  </span>
                  {i < arr.length - 1 && (
                    <span style={{
                      display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom',
                      paddingBottom: '0.3em', marginBottom: '-0.3em',
                    }}>
                      <span style={{
                        display: 'inline-block',
                        color: 'var(--thinkn-electric-orange)',
                        transform: introPhase >= 6 ? 'translateY(0)' : 'translateY(150%)',
                        transition: introPhase >= 6
                          ? `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.07 + 0.035}s`
                          : 'none',
                      }}>/</span>
                    </span>
                  )}
                </span>
              ))}
            </nav>

            <h5
              style={{
                marginTop: 'auto',
                fontSize: 'var(--text-h5)',
                lineHeight: 'var(--lh-h5)',
                letterSpacing: 'var(--ls-h5)',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {'Venture tech company that builds and licenses platforms for digital transformation — from core systems to intelligent automation.'.split(' ').map((word, i, arr) => (
                <span key={i}>
                  <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.3em', marginBottom: '-0.3em' }}>
                    <span style={{
                      display: 'inline-block',
                      transform: introPhase >= 7 ? 'translateY(0)' : 'translateY(150%)',
                      transition: introPhase >= 7
                        ? `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`
                        : 'none',
                    }}>
                      {word}
                    </span>
                  </span>
                  {i < arr.length - 1 ? ' ' : null}
                </span>
              ))}
            </h5>
          </div>
        </div>
      </section>
    </>
  );
}
