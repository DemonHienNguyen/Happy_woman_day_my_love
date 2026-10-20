import { motion } from 'motion/react';
import { GiftData, PaletteConfig } from '../types/gift';
import { pseudoRandom, round2 } from '../utils/gardenMath';

interface CoverScreenProps {
  gift: GiftData;
  palette: PaletteConfig;
  onOpen: () => void;
}

const STAR_MOTES = Array.from({ length: 18 }, (_, idx) => ({
  left: round2(6 + 88 * pseudoRandom(idx, 1)),
  top: round2(8 + 84 * pseudoRandom(idx, 2)),
  size: round2(2 + 4 * pseudoRandom(idx, 3)),
  dur: round2(2.4 + 2.4 * pseudoRandom(idx, 4)),
  delay: round2(3 * pseudoRandom(idx, 5)),
}));

export function CoverScreen({ gift, palette, onOpen }: CoverScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
      {/* Soft radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 48%, ${palette.glow} 0%, transparent 70%)`,
          opacity: 0.35,
        }}
      />

      {/* Twinkling ambient sparkles */}
      {STAR_MOTES.map((star, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            boxShadow: '0 0 8px rgba(255,230,220,0.9)',
          }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{
            duration: star.dur,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Greeting Calligraphy */}
      <motion.p
        className="font-hand relative text-[clamp(4rem,19vw,7rem)] leading-none text-[#fffdfa]"
        style={{ textShadow: '0 4px 20px rgba(74,28,44,0.4)' }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.4, ease: 'easeOut' }}
      >
        {gift.cover.greeting}
      </motion.p>

      {/* Subtitle */}
      <motion.p
        className="font-serif-gift relative mt-4 text-[clamp(1.3rem,6vw,2rem)] italic text-white/90"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.3, ease: 'easeOut' }}
      >
        {gift.cover.line}
      </motion.p>

      {/* Interactive Open Button */}
      <motion.button
        type="button"
        onClick={onOpen}
        className="relative mt-14 cursor-pointer rounded-full border border-white/40 bg-white/15 px-8 py-4 text-base font-medium tracking-wide backdrop-blur transition-all duration-300 hover:bg-white/25 active:scale-95"
        style={{ boxShadow: '0 0 40px rgba(255,200,210,0.35)' }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: [1, 1.05, 1],
        }}
        transition={{
          opacity: { duration: 1, delay: 2.4 },
          scale: { duration: 2.2, delay: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileTap={{ scale: 0.95 }}
      >
        {gift.cover.button} 🌷
      </motion.button>
    </div>
  );
}
