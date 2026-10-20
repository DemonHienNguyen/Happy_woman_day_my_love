import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GiftData, PaletteConfig } from '../types/gift';
import { pseudoRandom } from '../utils/gardenMath';

interface GardenRevealProps {
  gift: GiftData;
  palette: PaletteConfig;
}

const REVEAL_STAGES = ['hidden', 'bud', 'open', 'words', 'alone', 'close', 'leave'] as const;
type Stage = (typeof REVEAL_STAGES)[number];

const REVEAL_TIMINGS: [Stage, number][] = [
  ['bud', 3200],
  ['open', 4700],
  ['words', 6000],
  ['alone', 10500],
  ['close', 12500],
  ['leave', 13300],
];

function CenterTitle({ show, text }: { show: boolean; text: string }) {
  return (
    <div className="relative" style={{ width: 'min(70vw, 340px)', aspectRatio: '340 / 96' }}>
      <svg viewBox="0 0 340 96" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="rose-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff1e2" />
            <stop offset="45%" stopColor="#f6c9b4" />
            <stop offset="100%" stopColor="#e7a08f" />
          </linearGradient>
        </defs>
        <motion.text
          x="170"
          y="74"
          textAnchor="middle"
          className="font-serif-gift font-semibold"
          style={{ fontSize: 78, letterSpacing: 6 }}
          fill="url(#rose-gold)"
          stroke="#fbe3d4"
          strokeWidth={1.2}
          strokeDasharray="420"
          initial={{ strokeDashoffset: 420, fillOpacity: 0, opacity: 0 }}
          animate={
            show
              ? { strokeDashoffset: 0, fillOpacity: 1, opacity: 1 }
              : { strokeDashoffset: 420, fillOpacity: 0, opacity: 0 }
          }
          transition={
            show
              ? {
                  strokeDashoffset: { duration: 1.6, ease: 'easeInOut' },
                  fillOpacity: { duration: 0.9, delay: 1.1 },
                  opacity: { duration: 0.2 },
                }
              : { duration: 0.6 }
          }
        >
          {text}
        </motion.text>
      </svg>
      {/* Little sparkle star */}
      <motion.svg
        aria-hidden="true"
        viewBox="-10 -10 20 20"
        className="absolute"
        style={{ right: '6%', top: '4%', width: 26, height: 26 }}
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={
          show
            ? { scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: 90 }
            : { scale: 0, opacity: 0 }
        }
        transition={{ duration: 1, delay: show ? 1.7 : 0 }}
      >
        <path d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10Z" fill="#fffbe8" />
      </motion.svg>
    </div>
  );
}

function CenterBud({ show, tint }: { show: boolean; tint: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-[8%]"
      style={{ originY: 1 }}
      initial={{ scale: 0, opacity: 0, y: '40%' }}
      animate={
        show
          ? { scale: [0.9, 1.04, 0.97, 1.06], opacity: 1, y: '0%' }
          : { scale: 1.4, opacity: 0, y: '0%' }
      }
      transition={
        show
          ? {
              scale: { duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
              opacity: { duration: 0.6 },
              y: { duration: 1, ease: 'easeOut' },
            }
          : { duration: 0.5, ease: 'easeOut' }
      }
    >
      <div
        className="absolute inset-[-30%] rounded-full"
        style={{ background: `radial-gradient(circle, ${tint} 0%, transparent 60%)` }}
      />
      <svg viewBox="0 0 100 120" className="relative h-full w-full overflow-visible">
        <defs>
          <linearGradient id="bud-petal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe6e4" />
            <stop offset="55%" stopColor="#f3b4bc" />
            <stop offset="100%" stopColor="#d97f92" />
          </linearGradient>
          <linearGradient id="bud-sepal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a4ba8c" />
            <stop offset="100%" stopColor="#6f8a5c" />
          </linearGradient>
        </defs>
        <path d="M50 8 C76 30 80 70 50 100 C20 70 24 30 50 8Z" fill="url(#bud-petal)" />
        <path d="M50 14 C64 36 66 72 50 98" fill="none" stroke="#fff4f2" strokeOpacity={0.6} strokeWidth={2} />
        <path d="M50 22 C34 44 34 76 50 98 C40 80 30 60 50 22Z" fill="#e89aa8" opacity={0.7} />
        <path d="M50 100 C30 98 18 82 22 66 C30 80 40 88 50 100Z" fill="url(#bud-sepal)" />
        <path d="M50 100 C70 98 82 82 78 66 C70 80 60 88 50 100Z" fill="url(#bud-sepal)" />
        <path d="M44 100 C46 108 54 108 56 100Z" fill="#6f8a5c" />
      </svg>
    </motion.div>
  );
}

export function GardenReveal({ gift, palette }: GardenRevealProps) {
  const [stage, setStage] = useState<Stage>('hidden');

  useEffect(() => {
    const timers = REVEAL_TIMINGS.map(([s, ms]) => window.setTimeout(() => setStage(s), ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const stageIndex = REVEAL_STAGES.indexOf(stage);
  const isAtLeast = (target: Stage) => stageIndex >= REVEAL_STAGES.indexOf(target);

  const isOpen = isAtLeast('open') && !isAtLeast('close');
  const isWords = stage === 'words';
  const showCenterPhoto = isAtLeast('open') && !isAtLeast('alone');

  const heroBloom =
    palette.blooms.find((b) => /zinnia|peony|dahlia|rose/.test(b)) ??
    palette.blooms.find((b) => !/lily|iris|craspedia|cluster/.test(b)) ??
    palette.blooms[0];

  const flowerSize = 'min(42vw, 27vh, 230px)';
  const marginV = `calc(${flowerSize} * 0.4)`;
  const maskRadius = 100 / 1.8;
  const outerBloomMask = `radial-gradient(circle closest-side, transparent ${maskRadius - 3}%, #000 ${maskRadius + 9}%)`;
  const centerCircleMask = 'radial-gradient(circle closest-side, #000 84%, transparent 100%)';
  const backdropMask = 'radial-gradient(ellipse 62% 42% at 50% 50%, #000 55%, transparent 100%)';

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {/* Background soft blur behind center hero */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          background: 'rgba(36,14,24,0.16)',
          maskImage: backdropMask,
          WebkitMaskImage: backdropMask,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showCenterPhoto ? 1 : 0 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 48%, transparent 45%, rgba(36,14,24,0.22) 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showCenterPhoto ? 1 : 0 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      {/* Main central stalk growing upwards */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 w-[5px] -translate-x-1/2 rounded-full"
        style={{
          height: '52vh',
          originY: 1,
          background: 'linear-gradient(180deg, #8fa978 0%, #6f8a5c 100%)',
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={
          isAtLeast('leave')
            ? { scaleY: 1, opacity: 0 }
            : isAtLeast('bud')
              ? { scaleY: 1, opacity: isAtLeast('alone') ? 0.9 : 1 }
              : { scaleY: 0, opacity: 0 }
        }
        transition={{
          scaleY: { duration: 1.2, ease: 'easeOut' },
          opacity: { duration: 0.6 },
        }}
      />

      {/* Center assembly: Title, Blooming Flower & Photo, Caption */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Shimmering "20 · 10" Title */}
        <CenterTitle show={isWords} text={gift.garden.big} />

        {/* Center Flower container */}
        <motion.div
          className="relative"
          style={{
            width: flowerSize,
            aspectRatio: '1',
            marginTop: marginV,
            marginBottom: marginV,
          }}
          animate={
            isAtLeast('leave')
              ? { y: '60vh', rotate: 8, opacity: 0, scale: 0.6 }
              : { y: 0, rotate: 0, opacity: 1, scale: 1 }
          }
          transition={
            isAtLeast('leave')
              ? { duration: 1.1, ease: [0.5, 0, 0.75, 0] }
              : { duration: 0.4 }
          }
        >
          {/* Radial light halo behind center bloom */}
          <motion.div
            aria-hidden="true"
            className="absolute -inset-[70%] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,232,214,0.75) 0%, ${palette.glow} 30%, transparent 62%)`,
            }}
            initial={{ opacity: 0 }}
            animate={
              isOpen
                ? { opacity: [0.65, 1, 0.65, 0.9, 0.65], scale: [1, 1.08, 1, 1.04, 1] }
                : { opacity: 0, scale: 1 }
            }
            transition={
              isOpen
                ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.8 }
            }
          />

          {/* Bud before bloom */}
          <CenterBud show={isAtLeast('bud') && !isOpen} tint={palette.glow} />

          {/* Underlay bloom petals */}
          <motion.img
            src={heroBloom}
            alt=""
            draggable={false}
            className="absolute max-w-none"
            style={{
              width: '180%',
              left: '-40%',
              top: '-40%',
              filter: 'drop-shadow(0 10px 22px rgba(20,6,12,0.45))',
            }}
            initial={{ scale: 0.2, rotate: -120, opacity: 0 }}
            animate={isOpen ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0.2, rotate: -60, opacity: 0 }}
            transition={{
              duration: isOpen ? 1.4 : 0.8,
              ease: isOpen ? [0.3, 1.2, 0.5, 1] : 'easeIn',
            }}
          />

          {/* Soft inner glow ring */}
          <motion.div
            aria-hidden="true"
            className="absolute -inset-[8%] rounded-full"
            style={{
              background: 'radial-gradient(circle closest-side, #fff3ea 72%, rgba(255,236,226,0) 100%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.9, delay: isOpen ? 0.3 : 0 }}
          />

          {/* Circular Photo of Recipient */}
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{
              WebkitMaskImage: centerCircleMask,
              maskImage: centerCircleMask,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{
              duration: isOpen ? 1 : 0.7,
              delay: isOpen ? 0.35 : 0,
              ease: [0.3, 1.1, 0.5, 1],
            }}
          >
            <motion.img
              src={gift.garden.photo}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
              style={{ objectPosition: gift.garden.focus }}
              initial={{ scale: 1.3, filter: 'saturate(0.3) brightness(1.15) blur(3px)' }}
              animate={
                isOpen
                  ? { scale: 1.02, filter: 'saturate(1) brightness(1) blur(0px)' }
                  : { scale: 1.3, filter: 'saturate(0.3) brightness(1.15) blur(3px)' }
              }
              transition={{
                duration: isOpen ? 2.4 : 0.6,
                delay: isOpen ? 0.4 : 0,
                ease: 'easeOut',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle closest-side, transparent 58%, rgba(255,214,206,0.4) 86%, rgba(255,200,190,0.65) 100%)',
              }}
            />
          </motion.div>

          {/* Overlay bloom petals framing the photo */}
          <motion.img
            src={heroBloom}
            alt=""
            draggable={false}
            className="absolute max-w-none"
            style={{
              width: '180%',
              left: '-40%',
              top: '-40%',
              WebkitMaskImage: outerBloomMask,
              maskImage: outerBloomMask,
            }}
            initial={{ scale: 1.4, rotate: 40, opacity: 0 }}
            animate={isOpen ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0.5, rotate: -30, opacity: 0 }}
            transition={{
              duration: isOpen ? 1.1 : 0.7,
              delay: isOpen ? 0.6 : 0,
              ease: [0.3, 0, 0.2, 1],
            }}
          />

          {/* Rising sparkles around center */}
          {isOpen &&
            Array.from({ length: 14 }, (_, a) => {
              const xOff = (pseudoRandom(a, 71) - 0.5) * 160;
              const size = 3 + 4 * pseudoRandom(a, 72);
              return (
                <motion.span
                  key={a}
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background:
                      'radial-gradient(circle, #fffbe8 0%, #ffd9a0 55%, rgba(255,210,150,0) 80%)',
                  }}
                  initial={{ x: 0.3 * xOff, y: 0, opacity: 0 }}
                  animate={{
                    x: [0.3 * xOff, xOff],
                    y: [0, -180 - 120 * pseudoRandom(a, 73)],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + 2 * pseudoRandom(a, 74),
                    delay: 1 + 2.5 * pseudoRandom(a, 75),
                    repeat: Infinity,
                    repeatDelay: 0.5 + pseudoRandom(a, 76),
                    ease: 'easeOut',
                  }}
                />
              );
            })}
        </motion.div>

        {/* Center poetic caption */}
        <motion.p
          className="font-serif-gift relative px-6 text-center text-[clamp(1.7rem,7.4vw,2.9rem)] leading-tight text-balance text-white"
          style={{ textShadow: '0 2px 4px rgba(30,8,16,0.5), 0 0 30px rgba(30,8,16,0.65)' }}
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={
            isWords
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: 0, filter: 'blur(4px)' }
          }
          transition={{ duration: 1.2, delay: isWords ? 0.9 : 0, ease: 'easeOut' }}
        >
          {gift.garden.line}
        </motion.p>
      </div>
    </div>
  );
}
