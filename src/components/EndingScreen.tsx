import { motion } from 'motion/react';
import { GiftData, PaletteConfig } from '../types/gift';

interface EndingScreenProps {
  gift: GiftData;
  palette: PaletteConfig;
  onReplay: () => void;
}

export function EndingScreen({ gift, palette, onReplay }: EndingScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[min(3.5vh,2rem)] px-6 py-[3vh] text-center landscape:flex-row landscape:gap-[6vw]">
      {/* Soft radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 38%, ${palette.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Arch portrait framed photo */}
      <motion.div
        className="relative w-[min(58vw,34vh,340px)] shrink-0 overflow-hidden border-[5px] border-[#fffdf8] shadow-2xl landscape:w-[min(30vw,54vh,360px)]"
        style={{
          aspectRatio: '3 / 4',
          borderRadius: '999px 999px 14px 14px',
          boxShadow: '0 22px 50px rgba(74,28,44,0.3)',
        }}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={gift.ending.photo}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Messages and signature */}
      <div className="relative flex flex-col items-center">
        <motion.p
          className="font-serif-gift relative text-[clamp(1.2rem,min(6vw,3.4vh),2.2rem)] italic text-[#4a1c2c] landscape:text-[clamp(1.1rem,min(3vw,5vh),2.2rem)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
        >
          Chúc mừng 20/10,
        </motion.p>

        <motion.p
          className="font-hand relative text-balance text-[clamp(3rem,min(20vw,10vh),7rem)] font-bold leading-tight text-[#a52038] landscape:text-[clamp(2.6rem,min(9vw,14vh),7rem)]"
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: 1.8, ease: 'easeOut' }}
        >
          {gift.herName} 🌷
        </motion.p>

        <motion.p
          className="font-serif-gift relative mt-[min(2vh,1rem)] max-w-md text-[clamp(1.05rem,min(5.2vw,2.8vh),1.7rem)] leading-snug text-[#5b2a38] landscape:text-[clamp(1rem,min(2.4vw,4.4vh),1.7rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 3.4 }}
        >
          {gift.ending.line}
        </motion.p>

        <motion.p
          className="font-hand relative mt-1 text-[clamp(1.8rem,min(9vw,4.6vh),2.6rem)] text-[#a2566a] landscape:text-[clamp(1.6rem,min(4vw,7vh),2.6rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4.6 }}
        >
          — {gift.signature}
        </motion.p>

        {/* Replay Button */}
        <motion.button
          type="button"
          onClick={onReplay}
          className="relative mt-[min(4vh,2.5rem)] cursor-pointer rounded-full border border-[#a2566a]/40 bg-white/50 px-8 py-3 text-sm font-medium tracking-wide text-[#7a2c40] backdrop-blur transition-all duration-300 hover:bg-white/80 active:scale-95"
          style={{ boxShadow: '0 4px 14px rgba(74,28,44,0.1)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 6 }}
        >
          ↻ Xem lại
        </motion.button>
      </div>
    </div>
  );
}
