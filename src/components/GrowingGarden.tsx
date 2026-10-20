import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PaletteConfig } from '../types/gift';
import {
  EASINGS,
  GardenFlower,
  generateGardenFlowers,
  generateDriftingPetals,
  generateGlowMotes,
  LEAF_PATHS,
  pseudoRandom,
  round2,
} from '../utils/gardenMath';

interface GrowingGardenProps {
  palette: PaletteConfig;
  onRevealStart?: () => void;
  onComplete?: () => void;
  skippable?: boolean;
  tier?: 'low' | 'mid' | 'high';
  leanAt?: number;
  timeline?: {
    grow?: number;
    peak?: number;
    fall?: number;
    done?: number;
  };
}

const PHASES = ['calm', 'grow', 'peak', 'fall', 'done'] as const;
type Phase = (typeof PHASES)[number];

const DEFAULT_MILESTONES: [Phase, number][] = [
  ['grow', 600],
  ['peak', 4000],
  ['fall', 6200],
  ['done', 9000],
];

interface FlowerItemProps {
  flower: GardenFlower;
  tier: 'low' | 'mid' | 'high';
  grown: boolean;
  falling: boolean;
  swaying: boolean;
  reduced: boolean;
  lean: { x: number; y: number; rotate: number } | null;
}

function FlowerItem({
  flower,
  tier,
  grown,
  falling,
  swaying,
  reduced,
  lean,
}: FlowerItemProps) {
  const isHigh = tier === 'high';
  const showLeaves = isHigh || (tier === 'mid' && flower.layer !== 'bg');

  const swayAnimConfig = {
    duration: flower.swayDur,
    repeat: reduced ? 0 : Infinity,
    ease: 'easeInOut' as const,
    delay: flower.growDelay + flower.enterDur,
  };

  const swayRot = [0, flower.windAmp, 0, -(0.6 * flower.windAmp), 0];
  const swayX = [0, 1.8 * flower.windAmp, 0, -(1.1 * flower.windAmp), 0];

  const flowerContent = (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `rotate(${flower.angleDeg}deg)`,
          transformOrigin: '0 0',
        }}
      >
        <svg
          width={flower.boxW}
          height={flower.stemLen}
          viewBox={`0 0 ${flower.boxW} ${flower.stemLen}`}
          fill="none"
          style={{
            position: 'absolute',
            left: `${-flower.boxW / 2}px`,
            top: 0,
            overflow: 'visible',
          }}
        >
          <motion.path
            d={flower.stemPath}
            stroke={flower.stemTone}
            strokeWidth={flower.stemW}
            strokeLinecap="round"
            initial={{ opacity: flower.stemRestOp }}
            animate={falling ? { opacity: 0 } : { opacity: flower.stemRestOp }}
            transition={
              falling
                ? { duration: 0.45 * flower.fallDur, ease: 'easeIn', delay: flower.fallDelay }
                : { duration: 0.3 }
            }
          />
          {showLeaves &&
            flower.leaves.map((leaf, idx) => {
              const scale = (0.26 * flower.headPx * leaf.scale) / 10;
              const leafX = flower.boxW / 2 + leaf.side * flower.headPx * 0.06;
              const leafY = flower.headPx * leaf.yFrac;
              return (
                <g
                  key={idx}
                  transform={`translate(${round2(leafX)} ${round2(leafY)}) rotate(${leaf.rot}) scale(${round2(scale)})`}
                >
                  <motion.path
                    d={LEAF_PATHS[leaf.shape]}
                    fill={leaf.tone}
                    style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
                    initial={{ opacity: leaf.op, scale: 1 }}
                    animate={falling ? { opacity: 0, scale: 0.9 } : { opacity: leaf.op, scale: 1 }}
                    transition={
                      falling
                        ? { duration: 0.4, ease: 'easeIn', delay: flower.fallDelay }
                        : { duration: 0.3 }
                    }
                  />
                </g>
              );
            })}
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${flower.headPx}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.img
          src={flower.src}
          alt=""
          loading="eager"
          decoding="async"
          draggable={false}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: isHigh ? 'drop-shadow(0 3px 7px rgba(0,0,0,0.32))' : 'none',
            willChange: isHigh ? 'transform, opacity' : undefined,
            backfaceVisibility: 'hidden',
          }}
          initial={{ opacity: flower.headOp, scale: 0.85 }}
          animate={grown ? { scale: 1 } : { scale: 0.85 }}
          transition={{
            duration: flower.enterDur,
            ease: EASINGS.bloom,
            delay: flower.growDelay,
          }}
        />
      </div>
    </>
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: `${flower.hx}px`,
        top: `${flower.hy}px`,
        width: 0,
        height: 0,
        zIndex: flower.z,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          willChange: isHigh ? 'transform' : undefined,
        }}
        initial={{
          x: flower.fallX,
          y: flower.fallY,
          rotate: flower.enterRot,
          opacity: 0,
        }}
        animate={
          falling
            ? { x: flower.fallX, y: flower.fallY, rotate: flower.fallRot, opacity: 0 }
            : grown
              ? { x: 0, y: 0, rotate: 0, opacity: 1 }
              : { x: flower.fallX, y: flower.fallY, rotate: flower.enterRot, opacity: 0 }
        }
        transition={
          falling
            ? {
                x: { duration: flower.fallDur, ease: EASINGS.fall, delay: flower.fallDelay },
                y: { duration: flower.fallDur, ease: EASINGS.fall, delay: flower.fallDelay },
                rotate: { duration: flower.fallDur, ease: EASINGS.fall, delay: flower.fallDelay },
                opacity: { duration: 0.6 * flower.fallDur, ease: 'easeIn', delay: flower.fallDelay + 0.4 * flower.fallDur },
              }
            : grown
              ? {
                  x: { duration: flower.enterDur, ease: EASINGS.bloom, delay: flower.growDelay },
                  y: { duration: flower.enterDur, ease: EASINGS.bloom, delay: flower.growDelay },
                  rotate: { duration: flower.enterDur, ease: EASINGS.bloom, delay: flower.growDelay },
                  opacity: { duration: 0.5 * flower.enterDur, ease: 'easeOut', delay: flower.growDelay },
                }
              : { duration: 0 }
        }
      >
        <motion.div
          style={{ position: 'absolute', left: 0, top: 0 }}
          initial={false}
          animate={lean ?? { x: 0, y: 0, rotate: 0 }}
          transition={{
            duration: 1.8,
            ease: EASINGS.bloom,
            delay: lean ? 0.25 * pseudoRandom(flower.hx, 61) : 0,
          }}
        >
          {flower.sway ? (
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                willChange: isHigh ? 'transform' : undefined,
              }}
              initial={{ rotate: 0, x: 0 }}
              animate={
                swaying
                  ? isHigh
                    ? { rotate: swayRot, x: swayX }
                    : { rotate: swayRot }
                  : isHigh
                    ? { rotate: 0, x: 0 }
                    : { rotate: 0 }
              }
              transition={
                swaying
                  ? isHigh
                    ? { rotate: swayAnimConfig, x: swayAnimConfig }
                    : { rotate: swayAnimConfig }
                  : { duration: 0.3 }
              }
            >
              {flowerContent}
            </motion.div>
          ) : (
            flowerContent
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function GrowingGarden({
  palette,
  onRevealStart,
  onComplete,
  skippable = true,
  tier: userTier,
  leanAt,
  timeline,
}: GrowingGardenProps) {
  const [gardenData] = useState(() => {
    let resolvedTier: 'low' | 'mid' | 'high' = 'high';
    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      resolvedTier = userTier ?? (isCoarse ? 'mid' : 'high');
    }
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      tier: resolvedTier,
      w,
      h,
      flowers: generateGardenFlowers(resolvedTier, w, h, palette.blooms),
      petals: generateDriftingPetals(resolvedTier, palette.petals.length ? palette.petals : palette.blooms),
      motes: generateGlowMotes(resolvedTier),
    };
  });

  const { tier, w, h, flowers, petals, motes } = gardenData;
  const isLow = tier === 'low';

  const [phase, setPhase] = useState<Phase>('calm');
  const [leaning, setLeaning] = useState(false);

  const revealRef = useRef(onRevealStart);
  const completeRef = useRef(onComplete);
  const revealedDone = useRef(false);
  const completedDone = useRef(false);
  const startTime = useRef(0);

  useEffect(() => {
    revealRef.current = onRevealStart;
    completeRef.current = onComplete;
  });

  useEffect(() => {
    startTime.current = Date.now();
    const timers = DEFAULT_MILESTONES.map(([p, defaultMs]) => {
      const delayMs = (p !== 'calm' && timeline ? timeline[p as keyof typeof timeline] : undefined) ?? defaultMs;
      return window.setTimeout(() => {
        setPhase(p);
        if (p === 'fall' && !revealedDone.current) {
          revealedDone.current = true;
          revealRef.current?.();
        }
        if (p === 'done' && !completedDone.current) {
          completedDone.current = true;
          completeRef.current?.();
        }
      }, delayMs);
    });

    if (leanAt !== undefined) {
      timers.push(window.setTimeout(() => setLeaning(true), leanAt));
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [leanAt, timeline]);

  const phaseIndex = PHASES.indexOf(phase);
  const hasReached = (target: Phase) => phaseIndex >= PHASES.indexOf(target);
  const isFalling = hasReached('fall');
  const isGrown = hasReached('grow');
  const isSwaying = isGrown && !isFalling;

  const handleSkip = () => {
    if (skippable && Date.now() - startTime.current >= 600) {
      if (!completedDone.current) {
        completedDone.current = true;
        if (!revealedDone.current) {
          revealedDone.current = true;
          revealRef.current?.();
        }
        completeRef.current?.();
      }
    }
  };

  return (
    <div
      role={skippable ? 'button' : undefined}
      tabIndex={skippable ? 0 : -1}
      aria-label={skippable ? 'Tap to open the gift' : undefined}
      className={`relative h-full w-full select-none overflow-hidden outline-none ${
        skippable ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ background: palette.bg }}
      onClick={handleSkip}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSkip()}
    >
      {/* Background shadow & depth */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: palette.darkBg, zIndex: 0 }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isFalling ? 0 : 1 }}
        transition={{ duration: 2.4, ease: 'easeInOut' }}
      />

      {/* Primary ambient center glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 58% 46% at 50% 46%, ${palette.glow} 0%, transparent 70%)`,
          zIndex: 0,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFalling ? 0 : 0.32 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Expanding luminous bloom shockwave */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 74% 58% at 50% 46%, ${palette.glow} 0%, transparent 60%)`,
          zIndex: 0,
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={
          isFalling
            ? isLow
              ? { opacity: 0, scale: 1 }
              : { opacity: [0.4, 0.55, 0], scale: [1, 1.4, 1.7] }
            : hasReached('peak')
              ? isLow
                ? { opacity: 0.55, scale: 1 }
                : { opacity: [0, 0.95, 0.4], scale: [0.5, 1.4, 1.1] }
              : { opacity: 0, scale: 0.6 }
        }
        transition={
          isFalling
            ? isLow
              ? { duration: 0.8 }
              : { duration: 1.8, ease: 'easeOut', times: [0, 0.4, 1] }
            : isLow
              ? { duration: 0.6 }
              : { duration: 1.1, ease: EASINGS.enter, times: [0, 0.4, 1] }
        }
      />

      {/* Bottom vignette */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: '30%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.34) 120%)',
          zIndex: 0,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isFalling ? 0 : 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Radiating Flowers */}
      {flowers.map((fl, idx) => {
        let leanConfig = null;
        if (leaning) {
          const centerX = w / 2;
          const centerY = 0.47 * h;
          const dx = centerX - fl.hx;
          const dy = centerY - fl.hy;
          const dist = Math.hypot(dx, dy) || 1;
          const amount = Math.min(34, 0.08 * dist);
          leanConfig = {
            x: round2((dx / dist) * amount),
            y: round2((dy / dist) * amount),
            rotate: round2(Math.sign(dx) * Math.min(12, 0.025 * Math.abs(dx))),
          };
        }

        return (
          <FlowerItem
            key={`fl-${idx}`}
            flower={fl}
            tier={tier}
            grown={isGrown}
            falling={isFalling}
            swaying={isSwaying}
            reduced={false}
            lean={leanConfig}
          />
        );
      })}

      {/* Floating Petals */}
      {petals.map((pt, idx) => (
        <div
          key={`pt-${idx}`}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: '50%',
            top: '47%',
            width: `${pt.size}vw`,
            transform: 'translate(-50%, -50%)',
            zIndex: pt.z,
          }}
        >
          <motion.img
            src={pt.src}
            alt=""
            draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={
              isGrown
                ? isFalling
                  ? {
                      x: pt.fx * w * 1.5,
                      y: pt.fy * h * 1.5,
                      scale: 0.45,
                      rotate: pt.rot + pt.driftRot,
                      opacity: 0,
                    }
                  : {
                      x: pt.fx * w,
                      y: pt.fy * h,
                      scale: [0.3, 1, 0.92],
                      rotate: pt.rot,
                      opacity: [0, pt.op, pt.op],
                    }
                : { x: 0, y: 0, scale: 0, opacity: 0 }
            }
            transition={
              isFalling
                ? { duration: 1.6, ease: EASINGS.settle, delay: pt.fallDelay }
                : {
                    duration: 0.8 + 0.4 * pseudoRandom(idx, 5),
                    ease: EASINGS.drift,
                    delay: pt.delay,
                  }
            }
          />
        </div>
      ))}

      {/* Rising luminous motes */}
      {!isLow &&
        hasReached('peak') &&
        !isFalling &&
        motes.map((mote, idx) => (
          <motion.div
            key={`mote-${idx}`}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${mote.left}%`,
              bottom: '14%',
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
              zIndex: 11,
            }}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, mote.op, 0],
              y: [0, -(mote.rise / 100) * h],
              x: [0, (mote.drift / 100) * w],
            }}
            transition={{
              duration: mote.dur,
              ease: 'easeOut',
              delay: mote.delay,
              repeat: Infinity,
              repeatDelay: mote.gap,
            }}
          />
        ))}
    </div>
  );
}
