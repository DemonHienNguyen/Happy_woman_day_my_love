import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { GiftData, PaletteConfig } from '../types/gift';
import { pseudoRandom } from '../utils/gardenMath';

interface BouquetExperienceProps {
  gift: GiftData;
  palette: PaletteConfig;
  onDone: () => void;
}

interface BouquetSlot {
  x: number;
  y: number;
  row: number;
  scale?: number;
}

const PRIMARY_SLOTS: BouquetSlot[] = [
  { x: 0.22, y: 0.17, row: 0, scale: 1 },
  { x: 0.41, y: 0.11, row: 0, scale: 1 },
  { x: 0.59, y: 0.11, row: 0, scale: 1 },
  { x: 0.78, y: 0.17, row: 0, scale: 1 },
  { x: 0.1, y: 0.33, row: 1, scale: 1 },
  { x: 0.3, y: 0.27, row: 1, scale: 1 },
  { x: 0.5, y: 0.25, row: 1, scale: 1 },
  { x: 0.7, y: 0.27, row: 1, scale: 1 },
  { x: 0.9, y: 0.33, row: 1, scale: 1 },
  { x: 0.3, y: 0.44, row: 2, scale: 1 },
  { x: 0.5, y: 0.42, row: 2, scale: 1 },
  { x: 0.7, y: 0.44, row: 2, scale: 1 },
];

const SECONDARY_SLOTS: BouquetSlot[] = [
  { x: 0.5, y: 0.03, row: 0, scale: 0.78 },
  { x: 0.31, y: 0.06, row: 0, scale: 0.72 },
  { x: 0.69, y: 0.06, row: 0, scale: 0.72 },
  { x: 0.08, y: 0.2, row: 0, scale: 0.7 },
  { x: 0.92, y: 0.2, row: 0, scale: 0.7 },
  { x: 0.2, y: 0.36, row: 1, scale: 0.74 },
  { x: 0.8, y: 0.36, row: 1, scale: 0.74 },
  { x: 0.4, y: 0.19, row: 0, scale: 0.68 },
  { x: 0.6, y: 0.19, row: 0, scale: 0.68 },
];

const ALL_SLOTS: BouquetSlot[] = [...PRIMARY_SLOTS, ...SECONDARY_SLOTS];

const SLOT_ORDER = [
  10,
  6,
  9,
  11,
  5,
  7,
  1,
  2,
  4,
  8,
  0,
  3,
  ...SECONDARY_SLOTS.map((_, i) => PRIMARY_SLOTS.length + i),
];

const CARD_STAGE_DURATIONS: Record<string, number> = {
  card: 3800,
  fold: 700,
  bloom: 1400,
  landed: 1000,
};

const NEXT_CARD_STAGE: Record<string, string | null> = {
  card: 'fold',
  fold: 'bloom',
  bloom: 'landed',
  landed: null,
};

const ROW_SCALES = [0.9, 1, 1.12];

const FOLIAGE_SPRAYS = [
  { src: '/gift/flowers/foliage-wide.webp', x: 0.42, w: 0.84, rotate: -24, mirror: false },
  { src: '/gift/flowers/foliage-wide.webp', x: 0.58, w: 0.84, rotate: -24, mirror: true },
  { src: '/gift/flowers/foliage-upright.webp', x: 0.5, w: 0.96, rotate: 0, mirror: false },
];

function getMetrics() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const W = Math.min(0.7 * vw, (0.68 * vh) / 1.35, 500);
  const H = 1.35 * W;
  const top = Math.max(0.07 * vh, 0.45 * vh - H / 2);
  const P = Math.min(0.64 * vw, 0.36 * vh, 290);
  return {
    vw,
    vh,
    W,
    H,
    left: (vw - W) / 2,
    top,
    P,
    center: { x: vw / 2, y: 0.47 * vh - 0.195 * P },
    hero: Math.min(0.42 * vw, 0.26 * vh, 220),
  };
}

interface StepItem {
  kind: 'intro' | 'sprig' | 'flower' | 'cascade' | 'wrap';
  group?: number;
  flower?: number;
  from?: number;
  to?: number;
}

// Background falling petals
function DriftingPetalsOverlay({
  petals,
  count = 14,
  seed = 6,
  blooms = [],
  bloomCount = 4,
}: {
  petals: string[];
  count?: number;
  seed?: number;
  blooms?: string[];
  bloomCount?: number;
}) {
  if (!petals.length) return null;
  const items = [
    ...Array.from({ length: count }, (_, i) => ({
      src: petals[i % petals.length],
      isBloom: false,
      k: i,
    })),
    ...blooms.slice(0, bloomCount).map((b, i) => ({
      src: b,
      isBloom: true,
      k: count + i,
    })),
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(({ src, isBloom, k }) => {
        const seedVal = k + 31 * seed;
        const width = isBloom
          ? 34 + 30 * pseudoRandom(seedVal, 3)
          : 18 + 30 * pseudoRandom(seedVal, 3);
        const duration = isBloom
          ? 13 + 7 * pseudoRandom(seedVal, 4)
          : 8 + 7 * pseudoRandom(seedVal, 4);
        const sway = (pseudoRandom(seedVal, 5) - 0.5) * (isBloom ? 12 : 20);

        return (
          <motion.img
            key={k}
            src={src}
            alt=""
            draggable={false}
            className="absolute top-0 max-w-none"
            style={{
              left: `${100 * pseudoRandom(seedVal, 2)}%`,
              width,
              height: 'auto',
              opacity: isBloom ? 0.7 + 0.25 * pseudoRandom(seedVal, 6) : 0.5 + 0.4 * pseudoRandom(seedVal, 6),
            }}
            initial={{ y: '-14vh', x: 0, rotate: 0 }}
            animate={{
              y: '114vh',
              x: ['0vw', `${sway}vw`, `${-sway / 2}vw`],
              rotate: (isBloom ? 200 : 360) * (pseudoRandom(seedVal, 7) > 0.5 ? 1 : -1),
            }}
            transition={{
              duration,
              delay: -duration * pseudoRandom(seedVal, 8),
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );
}

// Foliage item
function FoliageItem({ spray, W, H }: { spray: (typeof FOLIAGE_SPRAYS)[0]; W: number; H: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: spray.x * W - (spray.w * W) / 2,
        bottom: 0.4 * H,
        width: spray.w * W,
        transform: spray.mirror ? 'scaleX(-1)' : undefined,
      }}
    >
      <motion.img
        src={spray.src}
        alt=""
        draggable={false}
        className="block w-full"
        style={{ originX: 0.5, originY: 1 }}
        initial={{ scale: 0.2, rotate: spray.rotate - 30, opacity: 0 }}
        animate={{ scale: 1, rotate: spray.rotate, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.2, 0.8, 0.3, 1] }}
      />
    </div>
  );
}

// Stem tie and kraft backing
function BouquetBaseSvg({ W, H, tie }: { W: number; H: number; tie: { x: number; y: number } }) {
  const tissueWaves = Array.from({ length: 6 }, (_, i) => {
    const xRatio = 0.02 + 0.16 * i;
    return `Q${(xRatio + 0.08) * W} ${0.46 * H} ${(xRatio + 0.16) * W} ${0.52 * H}`;
  }).join(' ');

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-visible"
      width={W}
      height={H}
    >
      <defs>
        <linearGradient id="kraft-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6c7a2" />
          <stop offset="100%" stopColor="#c99c72" />
        </linearGradient>
        <linearGradient id="tissue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8dcdc" />
          <stop offset="100%" stopColor="#efc0c4" />
        </linearGradient>
      </defs>

      {/* Exposed stems below tie point */}
      {Array.from({ length: 5 }, (_, r) => (
        <line
          key={r}
          x1={tie.x}
          y1={tie.y}
          x2={(0.455 + 0.022 * r) * W}
          y2={1.03 * H}
          stroke={r % 2 ? '#6f8a5c' : '#7e9868'}
          strokeWidth={0.012 * W}
          strokeLinecap="round"
        />
      ))}

      {/* Kraft paper backing */}
      <path
        d={`M${-0.04 * W} ${0.47 * H} L${0.15 * W} ${0.42 * H} L${0.32 * W} ${0.47 * H} L${0.5 * W} ${
          0.41 * H
        } L${0.68 * W} ${0.47 * H} L${0.85 * W} ${0.42 * H} L${1.04 * W} ${0.47 * H} L${0.58 * W} ${
          0.97 * H
        } L${0.42 * W} ${0.97 * H} Z`}
        fill="url(#kraft-back)"
      />

      {/* Decorative pink tissue scalloped layer */}
      <path
        d={`M${0.02 * W} ${0.52 * H} ${tissueWaves} L${0.56 * W} ${0.92 * H} L${0.44 * W} ${0.92 * H} Z`}
        fill="url(#tissue)"
        opacity={0.92}
      />
    </svg>
  );
}

// Sparkle pearl dots around flower base
function FlowerGlowDots({
  index,
  x,
  y,
  d,
  delay = 0,
}: {
  index: number;
  x: number;
  y: number;
  d: number;
  delay?: number;
}) {
  return (
    <>
      {Array.from({ length: 5 }, (_, o) => {
        const angle = 2 * Math.PI * pseudoRandom(5 * index + o, 43);
        const dist = d * (0.78 + 0.22 * pseudoRandom(5 * index + o, 44));
        const size = d * (0.07 + 0.05 * pseudoRandom(5 * index + o, 45));
        return (
          <motion.span
            key={o}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: x + Math.cos(angle) * dist - size / 2,
              top: y + Math.sin(angle) * dist - size / 2,
              width: size,
              height: size,
              zIndex: 5,
              background: 'radial-gradient(circle at 40% 35%, #ffffff 0%, #f7f1ea 60%, #e8ddd2 100%)',
              boxShadow: '0 1px 2px rgba(74,28,44,0.2)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 14,
              delay: delay + 0.6 + 0.06 * o,
            }}
          />
        );
      })}
    </>
  );
}

// Individual flower item on bouquet
function FlowerItemOnBouquet({
  index,
  photo,
  bloom,
  size,
  style,
  entering = false,
  pop,
  petals = [],
  tilt,
  sway = true,
}: {
  index: number;
  photo?: string;
  bloom: string;
  size: number;
  style?: React.CSSProperties;
  entering?: boolean;
  pop?: number;
  petals?: string[];
  tilt?: { x: number; y: number };
  sway?: boolean;
}) {
  const rotJitter = (pseudoRandom(index, 41) - 0.5) * 80;
  const hasPop = pop !== undefined;
  const animDelay = hasPop ? pop + 0.5 : 0;
  const isEntering = entering || hasPop;
  const bloomImgStyle = { width: '175%', left: '-37.5%', top: '-37.5%' };
  const maskRadius = 100 / 1.75;
  const outerBloomMask = `radial-gradient(circle closest-side, transparent ${maskRadius - 3}%, #000 ${maskRadius + 9}%)`;
  const centerCircleMask = 'radial-gradient(circle closest-side, #000 86%, transparent 100%)';

  return (
    <motion.div
      layoutId={`flower-${index}`}
      className="absolute"
      style={{ width: size, height: size, ...style }}
      transition={{ layout: { duration: 0.9, ease: [0.4, 0, 0.2, 1] } }}
    >
      <motion.div
        className="absolute inset-0"
        animate={sway ? { rotate: [-2.5, 2.5] } : { rotate: 0 }}
        transition={
          sway
            ? {
                duration: 2.6 + 1.6 * pseudoRandom(index, 52),
                delay: 1.2 * pseudoRandom(index, 53),
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }
            : { duration: 0.4 }
        }
        style={{ originY: 1.2 }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: tilt
              ? `perspective(${5 * size}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
              : undefined,
          }}
        >
          {/* Outer Bloom Image */}
          <motion.img
            src={bloom}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{ ...bloomImgStyle, filter: 'drop-shadow(0 6px 10px rgba(74,28,44,0.25))' }}
            initial={isEntering ? { scale: hasPop ? 0.25 : 0.3, rotate: rotJitter - 120, opacity: 0 } : false}
            animate={{ scale: 1, rotate: rotJitter, opacity: 1 }}
            transition={{ duration: 1.2, delay: animDelay, ease: [0.34, 1.25, 0.64, 1] }}
          />

          {/* Photo Center */}
          {photo && (
            <motion.div
              className="absolute inset-0"
              initial={hasPop ? { scale: 0.4, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: animDelay + 0.2, ease: [0.3, 1.2, 0.5, 1] }}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-[8%] rounded-full"
                style={{
                  background: 'radial-gradient(circle closest-side, #fff3ea 72%, rgba(255,236,226,0) 100%)',
                }}
              />
              <div
                className="absolute inset-0 overflow-hidden rounded-full"
                style={{ WebkitMaskImage: centerCircleMask, maskImage: centerCircleMask }}
              >
                <motion.img
                  src={photo}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                  initial={hasPop ? { filter: 'blur(5px) saturate(0.3) brightness(1.15)' } : false}
                  animate={{ filter: 'blur(0px) saturate(1) brightness(1)' }}
                  transition={{ duration: 1.2, delay: animDelay + 0.3 }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle closest-side, transparent 55%, rgba(255,214,206,0.45) 85%, rgba(255,200,190,0.7) 100%)',
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Masked Bloom Petals Overlapping Photo Border */}
          <motion.img
            src={bloom}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{ ...bloomImgStyle, WebkitMaskImage: outerBloomMask, maskImage: outerBloomMask }}
            initial={isEntering ? { scale: 1.35, rotate: rotJitter + 40, opacity: 0 } : false}
            animate={{ scale: 1, rotate: rotJitter, opacity: 1 }}
            transition={{
              duration: 1,
              delay: isEntering ? animDelay + 0.25 : 0,
              ease: [0.3, 0, 0.2, 1],
            }}
          />

          {/* Flash glow */}
          {entering && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[60%] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,240,214,0.9) 0%, rgba(255,214,214,0.4) 35%, transparent 65%)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: 1.3 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Polaroid Wish Card
function WishPolaroidCard({
  flower,
  folding,
  metrics,
  petals,
}: {
  flower: { photo: string; wish?: string; number: number };
  folding: boolean;
  metrics: ReturnType<typeof getMetrics>;
  petals: string[];
}) {
  const { P, center, hero } = metrics;
  const cardHeight = 1.2 * P;
  const padding = 0.055 * P;
  const rotAngle = flower.number % 2 ? -2.5 : 2;

  return (
    <motion.div
      className="pointer-events-none fixed"
      style={{ left: center.x, top: center.y, width: 0, height: 0, zIndex: 60 }}
      initial={{ opacity: 0, scale: 0.86, rotate: 2 * rotAngle, y: 24 }}
      animate={{ opacity: 1, scale: 1, rotate: folding ? 0 : rotAngle, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.01 } }}
      transition={{ type: 'spring', stiffness: 90, damping: 16 }}
    >
      {/* Paper Card Frame */}
      <motion.div
        className="absolute flex flex-col items-center rounded-[4px] bg-[#fffaf4]"
        style={{
          left: -P / 2 - padding,
          top: -cardHeight / 2 - padding,
          width: P + 2 * padding,
          padding,
          paddingBottom: 1.4 * padding,
          boxShadow: '0 22px 50px rgba(74,28,44,0.28), 0 3px 8px rgba(74,28,44,0.15)',
        }}
        animate={folding ? { opacity: 0, scale: 0.7, y: 30 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: folding ? 0.5 : 0.6, ease: 'easeIn' }}
      >
        <div style={{ height: cardHeight, width: P }} />
        <p
          className="font-serif-gift mt-[0.9em] text-[10px] uppercase tracking-[0.32em] text-[#b07a88]"
          style={{ fontSize: Math.max(10, 0.04 * P) }}
        >
          Lời chúc thứ {flower.number}
        </p>
        <motion.p
          className="font-serif-gift mt-1 text-balance text-center leading-[1.22] font-medium"
          style={{ fontSize: 0.078 * P, color: '#4a1c2c' }}
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.55, ease: 'easeOut' }}
        >
          {flower.wish}
        </motion.p>
      </motion.div>

      {/* Photo Frame morphing to Circle on fold */}
      <motion.div
        className="absolute overflow-hidden"
        initial={false}
        animate={
          folding
            ? { left: -hero / 2, top: -hero / 2, width: hero, height: hero, borderRadius: hero / 2 }
            : { left: -P / 2, top: -cardHeight / 2, width: P, height: cardHeight, borderRadius: 2 }
        }
        transition={{ duration: 0.7, ease: [0.6, 0, 0.3, 1] }}
      >
        <img src={flower.photo} alt="" draggable={false} className="h-full w-full object-cover" />
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(255,236,214,0.35) 0%, transparent 45%)' }}
          animate={{ opacity: folding ? 0 : 1 }}
        />
      </motion.div>

      {/* Petals exploding outward on fold */}
      {folding &&
        Array.from({ length: 10 }, (_, a) => {
          const angle = (2 * Math.PI * a) / 10 + 0.3;
          const corner = {
            x: Math.sign(Math.cos(angle)) * (P / 2 + padding),
            y: Math.sign(Math.sin(angle)) * (cardHeight / 2 + padding),
          };
          const dist = 0.62 * hero;
          const petalSize = 0.34 * hero;
          return (
            <motion.img
              key={a}
              src={petals[a % petals.length]}
              alt=""
              draggable={false}
              className="absolute max-w-none"
              style={{ left: -petalSize / 2, top: -petalSize / 2, width: petalSize }}
              initial={{
                x: corner.x,
                y: corner.y,
                rotate: 360 * pseudoRandom(a, 51),
                opacity: 0,
                scale: 0.6,
              }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                rotate: (180 * angle) / Math.PI + 90,
                opacity: [0, 1, 1],
                scale: 1,
              }}
              transition={{ duration: 0.7, delay: 0.02 * a, ease: 'easeOut' }}
            />
          );
        })}
    </motion.div>
  );
}

// Kraft Wrapping Paper & Ribbon
function BouquetWrapFront({
  wrapping,
  W,
  H,
  tie,
  tagText,
}: {
  wrapping: boolean;
  W: number;
  H: number;
  tie: { x: number; y: number };
  tagText: string;
}) {
  if (!wrapping) return null;
  const bowW = 0.17 * W;
  const bowH = 0.13 * W;

  return (
    <>
      {/* Front Kraft Wrapping Flaps */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={W}
        height={H}
        style={{ zIndex: 50 }}
      >
        <defs>
          <linearGradient id="kraft-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eccfac" />
            <stop offset="100%" stopColor="#cfa47a" />
          </linearGradient>
          <linearGradient id="kraft-front-2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2d9ba" />
            <stop offset="100%" stopColor="#d6ad84" />
          </linearGradient>
        </defs>
        {[
          {
            d: `M${-0.02 * W} ${0.56 * H} Q${0.25 * W} ${0.64 * H} ${0.58 * W} ${0.6 * H} L${0.56 * W} ${
              0.98 * H
            } L${0.44 * W} ${0.98 * H} Z`,
            fill: 'url(#kraft-front)',
            from: -38,
          },
          {
            d: `M${1.02 * W} ${0.56 * H} Q${0.75 * W} ${0.64 * H} ${0.42 * W} ${0.6 * H} L${0.44 * W} ${
              0.98 * H
            } L${0.56 * W} ${0.98 * H} Z`,
            fill: 'url(#kraft-front-2)',
            from: 38,
          },
        ].map((flap, idx) => (
          <motion.path
            key={idx}
            d={flap.d}
            fill={flap.fill}
            stroke="rgba(150,105,70,0.35)"
            strokeWidth={1}
            style={{ originX: 0.5, originY: 1 }}
            initial={{ rotate: flap.from, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.15 * idx, ease: [0.3, 0, 0.2, 1] }}
          />
        ))}
      </svg>

      {/* Red Satin Ribbon Band */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[2px]"
        style={{
          left: tie.x - 0.19 * W,
          top: tie.y - 0.02 * W,
          width: 0.38 * W,
          height: 0.04 * W,
          background: 'linear-gradient(180deg, #c03a55 0%, #8e1c32 55%, #6a1226 100%)',
          zIndex: 51,
          boxShadow: '0 2px 4px rgba(74,28,44,0.3)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
      />

      {/* Ribbon tails */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute overflow-visible"
        style={{ left: tie.x - 0.1 * W, top: tie.y, width: 0.2 * W, height: 0.2 * W, zIndex: 52 }}
        viewBox="0 0 100 100"
      >
        {['M50 4 Q38 44 16 94', 'M50 4 Q64 46 86 90'].map((d, a) => (
          <motion.path
            key={a}
            d={d}
            stroke="#8e1c32"
            strokeWidth={10}
            fill="none"
            strokeLinecap="butt"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 1.6 + 0.1 * a, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Ribbon Bow */}
      {[-1, 1].map((dir) => (
        <motion.svg
          key={dir}
          aria-hidden="true"
          className="pointer-events-none absolute overflow-visible"
          style={{
            left: dir < 0 ? tie.x - bowW : tie.x,
            top: tie.y - bowH / 2,
            width: bowW,
            height: bowH,
            zIndex: 53,
            originX: dir < 0 ? 1 : 0,
            originY: 0.5,
          }}
          viewBox="0 0 100 76"
          initial={{ scale: 0, rotate: -25 * dir }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 11, delay: 1.5 }}
        >
          <defs>
            <linearGradient id={`satin-${dir}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d24a64" />
              <stop offset="55%" stopColor="#97203a" />
              <stop offset="100%" stopColor="#6a1226" />
            </linearGradient>
          </defs>
          <g transform={dir < 0 ? undefined : 'translate(100 0) scale(-1 1)'}>
            <path d="M100 38 C70 0 10 -6 4 22 C0 44 30 72 100 38 Z" fill={`url(#satin-${dir})`} />
            <path d="M92 36 C66 14 26 10 16 26" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={3} />
          </g>
        </motion.svg>
      ))}

      {/* Center Ribbon Knot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          left: tie.x - 0.032 * W,
          top: tie.y - 0.036 * W,
          width: 0.064 * W,
          height: 0.072 * W,
          zIndex: 54,
          background: 'radial-gradient(circle at 35% 30%, #d24a64 0%, #8e1c32 60%, #5e0f20 100%)',
          boxShadow: '0 2px 5px rgba(74,28,44,0.4)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 1.5 }}
      />

      {/* Sparkles exploding around the knot */}
      {Array.from({ length: 18 }, (_, i) => {
        const angle = 2 * Math.PI * (i / 18) + pseudoRandom(i, 47);
        const dist = W * (0.18 + 0.2 * pseudoRandom(i, 48));
        const size = 4 + 5 * pseudoRandom(i, 49);
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: tie.x - size / 2,
              top: tie.y - size / 2,
              width: size,
              height: size,
              zIndex: 55,
              background: 'radial-gradient(circle, #fffbe8 0%, #ffd98a 50%, rgba(255,200,120,0) 75%)',
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: [0, 1, 0],
              scale: [0.4, 1.4, 0.6],
            }}
            transition={{ duration: 1.4, delay: 1.65, ease: 'easeOut' }}
          />
        );
      })}

      {/* Hanging Gift Tag */}
      <motion.div
        className="pointer-events-none absolute"
        style={{ left: tie.x + 0.01 * W, top: tie.y + 0.02 * W, zIndex: 56, originX: 0, originY: 0 }}
        initial={{ opacity: 0, rotate: -30 }}
        animate={{ opacity: 1, rotate: [-30, 18, 2, 10, 6, 8] }}
        transition={{ duration: 2.2, delay: 2.2, ease: 'easeOut', opacity: { duration: 0.4, delay: 2.2 } }}
      >
        <div className="ml-[2px] h-[0.09em] w-px bg-[#7a4a3a]" style={{ height: 0.09 * W }} />
        <div
          className="font-hand -mt-px flex items-center justify-center whitespace-nowrap rounded-[3px] px-3 font-semibold text-[#7a2c40]"
          style={{
            height: 0.13 * W,
            fontSize: 0.09 * W,
            background: 'linear-gradient(170deg, #fffaf2 0%, #f6e9dc 100%)',
            boxShadow: '0 4px 10px rgba(74,28,44,0.25)',
            border: '1px solid rgba(196,154,92,0.6)',
          }}
        >
          {tagText}
        </div>
      </motion.div>
    </>
  );
}

export function BouquetExperience({ gift, palette, onDone }: BouquetExperienceProps) {
  // Pre-calculate steps: intro -> sprig 1 -> flower 1 -> cascade -> sprig 2 -> flower 2 -> cascade -> wrap
  const { flowers, steps, wave } = useMemo(() => {
    const flList: Array<{ photo: string; wish?: string; number: number; slot: number }> = [];
    const stepList: StepItem[] = [{ kind: 'intro' }];
    let wishCounter = 0;

    gift.chapters.forEach((ch, chIdx) => {
      stepList.push({ kind: 'sprig', group: chIdx });
      // Wishes with text
      const withWish = ch.photos.filter((p) => p.wish?.trim());
      withWish.forEach((p) => {
        if (flList.length < PRIMARY_SLOTS.length) {
          wishCounter += 1;
          stepList.push({ kind: 'flower', flower: flList.length });
          flList.push({
            photo: p.src,
            wish: p.wish,
            number: wishCounter,
            slot: SLOT_ORDER[flList.length],
          });
        }
      });

      // Photos without text (cascade)
      const withoutWish = ch.photos.filter((p) => !p.wish?.trim());
      if (withoutWish.length) {
        const from = flList.length;
        const to = Math.min(ALL_SLOTS.length, from + withoutWish.length);
        stepList.push({ kind: 'cascade', from, to });
        withoutWish.slice(0, to - from).forEach((p) => {
          flList.push({ photo: p.src, number: 0, slot: SLOT_ORDER[flList.length] });
        });
      }
    });

    if (flList.length < ALL_SLOTS.length) {
      stepList.push({ kind: 'cascade', from: flList.length, to: ALL_SLOTS.length });
      while (flList.length < ALL_SLOTS.length) {
        flList.push({
          photo: gift.chapters[0].photos[flList.length % gift.chapters[0].photos.length].src,
          number: 0,
          slot: SLOT_ORDER[flList.length],
        });
      }
    }

    stepList.push({ kind: 'wrap' });

    // Wave timings
    const waveTimes = flList.map(() => 0);
    const distCenter = (idx: number) =>
      Math.hypot(ALL_SLOTS[flList[idx].slot].x - 0.5, (ALL_SLOTS[flList[idx].slot].y - 0.28) * 1.4);

    for (const st of stepList) {
      if (st.kind === 'cascade' && st.from !== undefined && st.to !== undefined) {
        Array.from({ length: st.to - st.from }, (_, a) => st.from! + a)
          .sort((a, b) => distCenter(a) - distCenter(b))
          .forEach((itemIdx, seq) => {
            waveTimes[itemIdx] = seq;
          });
      }
    }

    return {
      flowers: flList,
      steps: stepList,
      wishes: flList.filter((f) => f.wish).length,
      wave: waveTimes,
    };
  }, [gift.chapters]);

  const [metrics] = useState(getMetrics);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cardStage, setCardStage] = useState<'card' | 'fold' | 'bloom' | 'landed'>('card');

  const onDoneRef = useRef(onDone);
  const wrapStartTime = useRef(0);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const step = steps[currentStepIndex] || steps[steps.length - 1];
  const isWrap = step.kind === 'wrap';

  const advanceStep = () => {
    setCardStage('card');
    setCurrentStepIndex((idx) => Math.min(steps.length - 1, idx + 1));
  };

  // Step auto progression
  useEffect(() => {
    const timers: number[] = [];
    const schedule = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (step.kind === 'intro') {
      schedule(2600, advanceStep);
    } else if (step.kind === 'sprig') {
      schedule(2600, advanceStep);
    } else if (step.kind === 'cascade' && step.from !== undefined && stCount(step.to! - step.from)) {
      const cascadeDur = ((step.to! - step.from - 1) * 0.45 + 0.5 + 1.2 + 1.1) * 1000;
      schedule(cascadeDur, advanceStep);
    } else if (step.kind === 'wrap') {
      wrapStartTime.current = Date.now();
      schedule(30000, () => onDoneRef.current());
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [step]);

  function stCount(n: number) {
    return n > 0;
  }

  // Card sub-stage progression (card -> fold -> bloom -> landed)
  useEffect(() => {
    if (step.kind !== 'flower') return;
    const next = NEXT_CARD_STAGE[cardStage];
    const timer = window.setTimeout(
      () => (next ? setCardStage(next as typeof cardStage) : advanceStep()),
      CARD_STAGE_DURATIONS[cardStage]
    );
    return () => window.clearTimeout(timer);
  }, [step, cardStage]);

  const isLanded = cardStage === 'landed';
  const visibleFlowerCount = isWrap
    ? flowers.length
    : step.kind === 'cascade'
      ? step.to!
      : steps
          .slice(0, currentStepIndex)
          .reduce(
            (acc, s) =>
              s.kind === 'flower'
                ? acc + 1
                : s.kind === 'cascade'
                  ? acc + (s.to! - s.from!)
                  : acc,
            0
          ) + (step.kind === 'flower' && isLanded ? 1 : 0);

  const getCascadePopDelay = (idx: number) =>
    step.kind === 'cascade' && step.from !== undefined && idx >= step.from
      ? 0.45 * wave[idx]
      : undefined;

  const currentFlowerIndex =
    step.kind !== 'flower' || isLanded ? null : step.flower!;
  const showPolaroidCard =
    currentFlowerIndex !== null && (cardStage === 'card' || cardStage === 'fold');

  const availableBlooms = palette.blooms.filter(
    (b) => !/lily|iris|craspedia|cluster/.test(b)
  );
  const bloomList = availableBlooms.length ? availableBlooms : palette.blooms;

  const tiePoint = { x: 0.5 * metrics.W, y: 0.86 * metrics.H };
  const flowerBaseSize = 0.2 * metrics.W;

  const stepPromptText =
    step.kind === 'intro'
      ? gift.bouquet.intro
      : step.kind === 'sprig' && step.group !== undefined
        ? gift.chapters[step.group].sprig
        : null;

  const bouquetOpacity = showPolaroidCard
    ? 0.22
    : currentFlowerIndex !== null || step.kind === 'sprig'
      ? 0.38
      : 1;

  const handleTapToAdvance = () => {
    if (isWrap) {
      if (Date.now() - wrapStartTime.current >= 3500) {
        onDoneRef.current();
      }
      return;
    }
    if (step.kind !== 'flower') {
      advanceStep();
      return;
    }
    if (cardStage === 'card') {
      setCardStage('fold');
    } else if (cardStage === 'landed') {
      advanceStep();
    }
  };

  return (
    <div
      className="absolute inset-0 cursor-pointer select-none overflow-hidden"
      onClick={handleTapToAdvance}
    >
      {/* Drifting Petals in Background */}
      <DriftingPetalsOverlay
        petals={palette.petals}
        count={14}
        seed={6}
        blooms={bloomList}
        bloomCount={4}
      />
      {isWrap && (
        <DriftingPetalsOverlay
          petals={palette.petals}
          count={16}
          seed={7}
          blooms={bloomList}
          bloomCount={6}
        />
      )}

      <LayoutGroup>
        {/* Bouquet Main Container */}
        <motion.div
          className="absolute"
          style={{
            left: metrics.left,
            top: metrics.top,
            width: metrics.W,
            height: metrics.H,
          }}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isWrap
              ? { opacity: 1, y: [0, -8, 0], scale: 1.04 }
              : { opacity: bouquetOpacity, y: 0, scale: 1 }
          }
          transition={
            isWrap
              ? {
                  y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 3 },
                  scale: { duration: 2.5, delay: 2.6 },
                }
              : { duration: 0.7, ease: 'easeOut' }
          }
        >
          {/* Shimmering Halo behind bouquet */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: 0.5 * metrics.W - 0.95 * metrics.W,
              top: 0.3 * metrics.H - 0.95 * metrics.W,
              width: 1.9 * metrics.W,
              height: 1.9 * metrics.W,
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,226,196,0.55) 0deg 5deg, transparent 5deg 15deg)',
              WebkitMaskImage:
                'radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 30%, transparent 66%)',
              maskImage:
                'radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 30%, transparent 66%)',
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={isWrap ? { opacity: 1, rotate: 360 } : { opacity: 0, rotate: 0 }}
            transition={{
              opacity: { duration: 2, delay: 2.8 },
              rotate: { duration: 80, repeat: Infinity, ease: 'linear' },
            }}
          />

          {/* Warm center light */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: -0.25 * metrics.W,
              top: -0.1 * metrics.H,
              width: 1.5 * metrics.W,
              height: 0.8 * metrics.H,
              background: `radial-gradient(ellipse, ${palette.glow} 0%, transparent 65%)`,
            }}
            animate={{ opacity: isWrap ? 1 : 0.4 }}
            transition={{ duration: 2.4, delay: isWrap ? 2.8 : 0 }}
          />

          {/* Foliage greenery */}
          {FOLIAGE_SPRAYS.map((spray, a) => (
            <FoliageItem key={a} spray={spray} W={metrics.W} H={metrics.H} />
          ))}

          {/* Kraft & tissue backing with stem base */}
          <BouquetBaseSvg W={metrics.W} H={metrics.H} tie={tiePoint} />

          {/* Connecting Stems from tie point to each flower */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={metrics.W}
            height={metrics.H}
          >
            {flowers.slice(0, visibleFlowerCount).map(({ slot }, a) => {
              const pos = ALL_SLOTS[slot];
              const targetX = pos.x * metrics.W;
              const targetY = pos.y * metrics.H;
              const curveJitter = (pos.x - 0.5) * 0.18 * metrics.W;
              const popDelay = getCascadePopDelay(a);
              return (
                <motion.path
                  key={a}
                  d={`M${tiePoint.x} ${tiePoint.y} Q${(tiePoint.x + targetX) / 2 - curveJitter} ${
                    (tiePoint.y + targetY) / 2
                  } ${targetX} ${targetY}`}
                  fill="none"
                  stroke={a % 2 ? '#6f8a5c' : '#7e9868'}
                  strokeWidth={0.011 * metrics.W}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: popDelay === undefined ? 0.9 : 0.6,
                    delay: 0.1 + (popDelay ?? 0),
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </svg>

          {/* Pearl glow dots around each flower */}
          {flowers.slice(0, visibleFlowerCount).map(({ slot }, a) => {
            const popDelay = getCascadePopDelay(a);
            return (
              <FlowerGlowDots
                key={`bb-${a}`}
                index={a}
                x={ALL_SLOTS[slot].x * metrics.W}
                y={ALL_SLOTS[slot].y * metrics.H}
                d={flowerBaseSize * ROW_SCALES[ALL_SLOTS[slot].row] * (ALL_SLOTS[slot].scale ?? 1)}
                delay={popDelay === undefined ? 0 : popDelay + 0.5}
              />
            );
          })}

          {/* Flower heads on bouquet */}
          {flowers.slice(0, visibleFlowerCount).map(({ slot }, i) => {
            const pos = ALL_SLOTS[slot];
            const size =
              flowerBaseSize * ROW_SCALES[pos.row] * (pos.scale ?? 1);
            return (
              <FlowerItemOnBouquet
                key={`slot-${i}`}
                index={i}
                photo={flowers[i].photo}
                bloom={bloomList[i % bloomList.length]}
                size={size}
                pop={getCascadePopDelay(i)}
                petals={palette.petals}
                tilt={{ x: [16, 6, -4][pos.row], y: (pos.x - 0.5) * 44 }}
                sway={true}
                style={{
                  left: pos.x * metrics.W - size / 2,
                  top: pos.y * metrics.H - size / 2,
                  zIndex: 10 + 12 * pos.row + (pos.scale ? 0 : Math.min(11, PRIMARY_SLOTS.length - i)),
                }}
              />
            );
          })}

          {/* Front Wrapping Paper, Satin Ribbon, Bow, Tag */}
          <BouquetWrapFront
            wrapping={isWrap}
            W={metrics.W}
            H={metrics.H}
            tie={tiePoint}
            tagText={gift.bouquet.tag}
          />
        </motion.div>

        {/* Polaroid Wish Card Floating in Front */}
        <AnimatePresence>
          {currentFlowerIndex !== null && showPolaroidCard && (
            <WishPolaroidCard
              key={`card-${currentFlowerIndex}`}
              flower={flowers[currentFlowerIndex]}
              folding={cardStage === 'fold'}
              metrics={metrics}
              petals={palette.petals}
            />
          )}
        </AnimatePresence>

        {/* Hero Flower while folding into bouquet */}
        {currentFlowerIndex !== null && cardStage === 'bloom' && (
          <FlowerItemOnBouquet
            key={`hero-${currentFlowerIndex}`}
            index={currentFlowerIndex}
            photo={flowers[currentFlowerIndex].photo}
            bloom={bloomList[currentFlowerIndex % bloomList.length]}
            size={metrics.hero}
            entering={true}
            style={{
              left: metrics.center.x - metrics.hero / 2,
              top: metrics.center.y - metrics.hero / 2,
              zIndex: 60,
              position: 'fixed',
            }}
          />
        )}
      </LayoutGroup>

      {/* Prompts and Subtitles during Chapters */}
      <div
        className="pointer-events-none absolute inset-x-0 flex justify-center px-8"
        style={{ top: 0.16 * metrics.vh }}
      >
        <AnimatePresence mode="wait">
          {stepPromptText && (
            <motion.p
              key={`big-${currentStepIndex}`}
              className="font-serif-gift max-w-lg text-center text-[clamp(1.6rem,7.4vw,2.8rem)] italic leading-snug text-[#4a1c2c]"
              style={{ textShadow: '0 2px 18px rgba(255,244,236,0.9)' }}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.4 } }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              {stepPromptText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* When wrapped: show tagline and continue button */}
      {isWrap && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[5vh] flex flex-col items-center px-6 text-center"
          style={{ zIndex: 60 }}
        >
          <motion.p
            className="font-serif-gift max-w-xl text-[clamp(1.4rem,6.2vw,2.1rem)] leading-snug text-[#5b2a38]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 3.4 }}
          >
            {gift.bouquet.line}
          </motion.p>
          <motion.button
            type="button"
            onClick={onDone}
            className="pointer-events-auto relative mt-6 cursor-pointer rounded-full bg-[#7a2c40] px-7 py-3.5 text-sm font-medium tracking-wide text-white shadow-lg active:scale-95"
            style={{ boxShadow: '0 10px 30px rgba(122,44,64,0.35)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 4.5 }}
          >
            Đọc bức thư dành cho em 💌
          </motion.button>
        </div>
      )}
    </div>
  );
}
