import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GiftData, PaletteConfig } from '../types/gift';
import { pseudoRandom } from '../utils/gardenMath';

interface LetterExperienceProps {
  gift: GiftData;
  palette: PaletteConfig;
  onDone: () => void;
}

const ENVELOPE_TEXTURE =
  'linear-gradient(160deg, #fdf4ee 0%, #f8e6dc 58%, #f2d9cd 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 4px)';

const LETTER_PAPER_STYLE = {
  backgroundColor: '#fdf6ec',
  backgroundImage:
    'radial-gradient(ellipse at 12% 0%, rgba(246,193,176,0.22) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(214,170,140,0.2) 0%, transparent 60%), url(/gift/paper-cream.webp)',
  backgroundSize: 'auto, auto, 420px',
};

// Envelope Front Side
function EnvelopeFront({ ew, gift }: { ew: number; gift: GiftData }) {
  const { stamp, postmark } = gift.letter;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[6px]"
      style={{
        background: ENVELOPE_TEXTURE,
        boxShadow: '0 26px 50px rgba(74,28,44,0.28), 0 2px 6px rgba(74,28,44,0.15)',
      }}
    >
      {/* Gold foil border line */}
      <div
        className="absolute inset-[4.5%] rounded-[3px]"
        style={{
          border: '1.5px solid rgba(196,154,92,0.75)',
          boxShadow: 'inset 0 0 0 3px rgba(196,154,92,0.12)',
        }}
      />

      {/* Sweeping shimmer light across envelope */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 w-1/2"
        style={{
          background:
            'linear-gradient(105deg, transparent 20%, rgba(255,244,214,0.55) 50%, transparent 80%)',
        }}
        initial={{ x: '-120%' }}
        animate={{ x: '260%' }}
        transition={{ duration: 1.8, delay: 0.9, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
      />

      {/* Recipient calligraphy */}
      <div className="absolute left-[12%] top-[44%] text-left">
        <p className="font-hand leading-none text-[#a2566a]" style={{ fontSize: 0.1 * ew }}>
          Gửi
        </p>
        <p className="font-hand leading-tight font-semibold text-[#7a2c40]" style={{ fontSize: 0.21 * ew }}>
          {gift.herName}
        </p>
        <div className="mt-1 h-px bg-[#c49a5c]/60" style={{ width: 0.42 * ew }} />
      </div>

      {/* Stamp with scalloped postage edges */}
      <div
        className="absolute bg-[#fffdf8] p-[6px]"
        style={{
          right: '9%',
          top: '11%',
          width: 0.2 * ew,
          aspectRatio: '4 / 5',
          transform: 'rotate(4deg)',
          boxShadow: '0 4px 10px rgba(74,28,44,0.18)',
        }}
      >
        <img src={stamp} alt="" draggable={false} className="h-full w-full object-cover rounded-[1px]" />
      </div>

      {/* Circular Postmark Cancellation Stamp */}
      <div
        className="pointer-events-none absolute border border-[#7a2c40]/40 rounded-full flex flex-col items-center justify-center text-center text-[#7a2c40]/60"
        style={{
          right: '16%',
          top: '24%',
          width: 0.22 * ew,
          height: 0.22 * ew,
          transform: 'rotate(-12deg)',
        }}
      >
        <div className="text-[7px] uppercase tracking-wider font-semibold">20 · 10</div>
        <div className="text-[8px] font-mono font-medium">{postmark}</div>
        <div className="text-[6px] tracking-widest uppercase">BƯU CHÍNH</div>
      </div>
    </div>
  );
}

// Envelope Back Side with Opening Flap
function EnvelopeBack({
  ew,
  mode,
  onOpen,
}: {
  ew: number;
  palette: PaletteConfig;
  mode: 'sealed' | 'opening' | 'closing';
  onOpen: () => void;
}) {
  const isOpening = mode === 'opening';
  const isClosing = mode === 'closing';

  return (
    <div
      role="button"
      aria-label="Mở thư"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      className="relative h-full w-full cursor-pointer"
      style={{ perspective: 900 }}
    >
      {/* Base Back Body */}
      <div
        className="absolute inset-0 rounded-[6px]"
        style={{
          background: ENVELOPE_TEXTURE,
          boxShadow: '0 26px 50px rgba(74,28,44,0.28), 0 2px 6px rgba(74,28,44,0.15)',
        }}
      />

      {/* Letter Paper inside sliding out */}
      <motion.div
        className="absolute inset-x-[7%] top-[6%] h-[88%] rounded-sm"
        style={{ ...LETTER_PAPER_STYLE, zIndex: 2, boxShadow: '0 -2px 8px rgba(74,28,44,0.12)' }}
        initial={isClosing ? { y: '-62%' } : { y: 0 }}
        animate={isOpening ? { y: '-62%' } : { y: 0 }}
        transition={{ duration: 0.8, delay: isClosing ? 0.2 : 1.3, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Envelope Pocket (triangular bottom fold) */}
      <div className="absolute inset-0 rounded-[6px]" style={{ zIndex: 3 }}>
        <div
          className="absolute inset-0 rounded-[6px]"
          style={{
            background: ENVELOPE_TEXTURE,
            clipPath: 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
          }}
        />
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0 100 L50 54 L100 100" fill="none" stroke="rgba(160,110,100,0.25)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Top Triangular Flap */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[58%]"
        style={{
          transformOrigin: 'top center',
          filter: 'drop-shadow(0 3px 4px rgba(74,28,44,0.18))',
        }}
        initial={isClosing ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 4 }}
        animate={isOpening ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 4 }}
        transition={
          isClosing
            ? { duration: 0.7, delay: 0.8, ease: 'easeIn' }
            : { duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }
        }
      >
        <div
          className="h-full w-full rounded-t-[6px]"
          style={{
            background: ENVELOPE_TEXTURE,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          }}
        />
        {/* Wax Seal Stamp on the Flap */}
        <motion.div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 flex items-center justify-center rounded-full bg-[#8a1e34] shadow-md border border-[#ad2d48]"
          style={{ width: 0.16 * ew, height: 0.16 * ew }}
          animate={isOpening ? { opacity: 0 } : { opacity: 1 }}
        >
          <span className="text-white text-base">💌</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 3D Tri-fold Unfolding Animation
function LetterUnfolding() {
  const panelStyle = (index: number) => ({
    ...LETTER_PAPER_STYLE,
    top: `${(100 / 3) * index}%`,
    height: 'calc(100% / 3 + 1px)',
  });

  return (
    <motion.div
      className="relative w-full max-w-[540px] h-[min(88vh,780px)]"
      style={{ perspective: 1400 }}
      initial={{ scale: 0.55, y: 120, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Center panel */}
      <div
        className="absolute inset-x-0"
        style={{ ...panelStyle(1), boxShadow: '0 30px 60px rgba(74,28,44,0.28)' }}
      />
      {/* Bottom panel unfolding down */}
      <motion.div
        className="absolute inset-x-0"
        style={{ ...panelStyle(2), transformOrigin: 'top center' }}
        initial={{ rotateX: 178 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: [0.3, 0, 0.2, 1] }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(122,44,64,0.18), rgba(122,44,64,0.05))',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        />
      </motion.div>
      {/* Top panel unfolding up */}
      <motion.div
        className="absolute inset-x-0"
        style={{ ...panelStyle(0), transformOrigin: 'bottom center' }}
        initial={{ rotateX: -178 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.7, delay: 1.05, ease: [0.3, 0, 0.2, 1] }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(122,44,64,0.18), rgba(122,44,64,0.05))',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
        />
      </motion.div>
    </motion.div>
  );
}

// Letter Paper Reading View with deckle edges and auto-scroll
function LetterReadingView({
  gift,
  palette,
  onClose,
}: {
  gift: GiftData;
  palette: PaletteConfig;
  onClose: () => void;
}) {
  const { greeting, closing, photo, paragraphs } = gift.letter;
  const [userInteracted, setUserInteracted] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Paragraph reading schedule
  const readingSchedule = useMemo(() => {
    return paragraphs.reduce(
      (acc, p) => ({
        starts: [...acc.starts, acc.end],
        end: acc.end + 0.05 * p.split(/\s+/).length + 0.5,
      }),
      { starts: [] as number[], end: 1.8 }
    );
  }, [paragraphs]);

  useEffect(() => {
    if (userInteracted) return;
    const container = scrollRef.current;
    const timers = readingSchedule.starts.map((startSec, idx) =>
      window.setTimeout(() => {
        const el = paragraphRefs.current[idx];
        if (!container || !el) return;
        const targetScroll = el.offsetTop + el.offsetHeight + 24;
        if (targetScroll > container.scrollTop + container.clientHeight) {
          container.scrollTo({
            top: Math.min(targetScroll - container.clientHeight, el.offsetTop - 16),
            behavior: 'smooth',
          });
        }
      }, 1000 * startSec)
    );

    timers.push(
      window.setTimeout(() => {
        container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }, (readingSchedule.end + 0.1) * 1000)
    );

    timers.push(
      window.setTimeout(() => {
        setCanClose(true);
      }, (readingSchedule.end + 2.2) * 1000)
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [userInteracted, readingSchedule]);

  // Deckle rough paper edge polygon
  const decklePolygon = useMemo(() => {
    const jitter = (index: number, salt: number) =>
      Math.round(70 * pseudoRandom(index, 11 + salt)) / 100;
    const points = [
      ...Array.from({ length: 28 }, (_, t) => `${(100 * t) / 28}% ${jitter(t, 1)}%`),
      ...Array.from({ length: 28 }, (_, t) => `${100 - jitter(t, 2)}% ${(100 * t) / 28}%`),
      ...Array.from({ length: 28 }, (_, t) => `${100 - (100 * t) / 28}% ${100 - jitter(t, 3)}%`),
      ...Array.from({ length: 28 }, (_, t) => `${jitter(t, 4)}% ${100 - (100 * t) / 28}%`),
    ];
    return `polygon(${points.join(', ')})`;
  }, []);

  const decorativeBlooms = palette.blooms.filter((b) => !/lily|iris|craspedia|cluster/.test(b));
  const driedBloom = decorativeBlooms.length ? decorativeBlooms[0] : palette.blooms[0];

  return (
    <div
      className="relative w-full max-w-[540px] h-[min(88vh,780px)] cursor-pointer"
      style={{ filter: 'drop-shadow(0 26px 40px rgba(74,28,44,0.26))' }}
      onClick={() => setUserInteracted(true)}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ ...LETTER_PAPER_STYLE, clipPath: decklePolygon }}
      >
        {/* Botanical dried flower on top-right */}
        <img
          src={driedBloom}
          alt=""
          draggable={false}
          className="pointer-events-none absolute -right-[7%] -top-[5%] w-[34%] max-w-none rotate-[18deg]"
          style={{ opacity: 0.42, filter: 'sepia(0.35) saturate(0.75)' }}
        />

        {/* Botanical greenery on bottom-left */}
        <img
          src="/gift/flowers/foliage-wide.webp"
          alt=""
          draggable={false}
          className="pointer-events-none absolute -bottom-[6%] -left-[10%] w-[44%] max-w-none rotate-[20deg]"
          style={{ opacity: 0.22, filter: 'sepia(0.4) saturate(0.7)' }}
        />

        {/* Scrollable Letter Content */}
        <div className="font-serif-gift relative flex h-full flex-col pb-[6%] text-[#4a1c2c]">
          <div
            ref={scrollRef}
            className="relative flex-1 overflow-y-auto px-[8%] pb-4 pt-[9%] no-scrollbar"
          >
            {/* Polaroid photo inside letter */}
            <motion.div
              className="relative mx-auto mb-[1.2em] mt-1 w-[46%] max-w-[210px] bg-white p-2 pb-7"
              style={{ boxShadow: '0 10px 22px rgba(74,28,44,0.22)' }}
              initial={{ opacity: 0, rotate: -12, y: -16 }}
              animate={{ opacity: 1, rotate: -3, y: 0 }}
              transition={{ duration: 0.9, delay: userInteracted ? 0 : 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Paper Washi tape */}
              <div
                aria-hidden="true"
                className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-1"
                style={{
                  background: 'rgba(235,210,190,0.65)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(2px)',
                }}
              />
              <img src={photo} alt="" draggable={false} className="aspect-[4/5] w-full object-cover" />
            </motion.div>

            {/* Letter Salutation */}
            <p className="font-hand mb-4 text-3xl font-semibold text-[#7a2c40]">
              {greeting}
            </p>

            {/* Paragraphs */}
            <div className="space-y-4 text-base leading-[1.8] text-[#4a1c2c]">
              {paragraphs.map((p, idx) => (
                <motion.p
                  key={idx}
                  ref={(el) => {
                    paragraphRefs.current[idx] = el;
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: userInteracted ? 0 : readingSchedule.starts[idx] }}
                  className="indent-6"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {/* Letter Sign-off */}
            <div className="mt-8 text-right pr-4">
              <p className="font-hand text-2xl text-[#a2566a]">{closing}</p>
              <p className="font-hand text-3xl font-semibold text-[#7a2c40]">{gift.signature}</p>
            </div>
          </div>

          {/* Action Button: Tiếp tục */}
          <div className="flex justify-center px-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full bg-[#7a2c40] px-7 py-3 text-sm font-medium tracking-wide text-white shadow-md transition-all hover:bg-[#8e334a] active:scale-95"
              style={{ boxShadow: '0 6px 20px rgba(122,44,64,0.3)' }}
            >
              {canClose || userInteracted ? 'Gấp thư lại & Tiếp tục 🌷' : 'Đọc tiếp 💌'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LetterExperience({ gift, palette, onDone }: LetterExperienceProps) {
  const [envelopeStage, setEnvelopeStage] = useState<'front' | 'flip' | 'back' | 'opening' | 'unfold' | 'reading' | 'closing'>('front');
  const [envelopeW] = useState(() => (typeof window !== 'undefined' ? Math.min(0.88 * window.innerWidth, 460) : 400));
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Auto transition flow: front -> flip -> back -> (user taps) opening -> unfold -> reading
  useEffect(() => {
    const stageTimeouts: Record<string, [typeof envelopeStage | 'done', number]> = {
      front: ['flip', 2800],
      opening: ['unfold', 2300],
      unfold: ['reading', 1900],
      closing: ['done', 3000],
    };

    const nextConfig = stageTimeouts[envelopeStage];
    if (!nextConfig) return;

    const timer = window.setTimeout(() => {
      if (nextConfig[0] === 'done') {
        onDoneRef.current();
      } else {
        setEnvelopeStage(nextConfig[0]);
      }
    }, nextConfig[1]);

    return () => window.clearTimeout(timer);
  }, [envelopeStage]);

  const handleOpenEnvelope = () => {
    if (envelopeStage === 'back') {
      setEnvelopeStage('opening');
    }
  };

  const isEnvelopePhase =
    envelopeStage === 'front' ||
    envelopeStage === 'flip' ||
    envelopeStage === 'back' ||
    envelopeStage === 'opening';

  return (
    <div className="absolute inset-0 select-none">
      {/* Background Petals */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,214,170,0.45) 0%, rgba(255,226,200,0.18) 40%, transparent 68%)',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Envelope Presentation */}
        {isEnvelopePhase && (
          <motion.div
            key="envelope"
            className="absolute inset-0 flex flex-col items-center justify-center px-5"
            exit={{ opacity: 0, y: 80, transition: { duration: 0.5, ease: 'easeIn' } }}
          >
            <motion.p
              className="font-serif-gift mb-10 text-center text-[clamp(1.6rem,7vw,2.4rem)] text-[#5b2a38]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: envelopeStage !== 'opening' ? 1 : 0, y: 0 }}
              transition={{ duration: 1, delay: envelopeStage === 'front' ? 1 : 0 }}
            >
              {gift.letter.prompt}
            </motion.p>

            <div style={{ width: envelopeW, height: envelopeW / 1.5, perspective: 1200 }}>
              <AnimatePresence
                mode="wait"
                onExitComplete={() => {
                  if (envelopeStage === 'flip') setEnvelopeStage('back');
                }}
              >
                {envelopeStage === 'front' && (
                  <motion.div
                    key="front"
                    className="h-full w-full cursor-pointer"
                    onClick={() => setEnvelopeStage('flip')}
                    initial={{ opacity: 0, y: -140, rotate: -10 }}
                    animate={{ opacity: 1, y: 0, rotate: -2 }}
                    exit={{ rotateY: 90, rotate: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
                    transition={{
                      type: 'spring',
                      stiffness: 55,
                      damping: 12,
                      opacity: { duration: 0.6 },
                    }}
                  >
                    <EnvelopeFront ew={envelopeW} gift={gift} />
                  </motion.div>
                )}

                {(envelopeStage === 'back' || envelopeStage === 'opening') && (
                  <motion.div
                    key="back"
                    className="h-full w-full"
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <EnvelopeBack
                      ew={envelopeW}
                      palette={palette}
                      mode={envelopeStage === 'opening' ? 'opening' : 'sealed'}
                      onOpen={handleOpenEnvelope}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* "Mở thư" button */}
            <motion.button
              type="button"
              onClick={handleOpenEnvelope}
              className="mt-12 cursor-pointer rounded-full bg-[#7a2c40] px-7 py-3.5 text-sm font-medium tracking-wide text-white"
              style={{ boxShadow: '0 10px 30px rgba(122,44,64,0.35)' }}
              initial={{ opacity: 0 }}
              animate={
                envelopeStage === 'back'
                  ? { opacity: 1, scale: [1, 1.05, 1] }
                  : { opacity: 0 }
              }
              transition={
                envelopeStage === 'back'
                  ? { opacity: { duration: 0.6, delay: 0.5 }, scale: { duration: 2, delay: 1, repeat: Infinity } }
                  : { duration: 0.3 }
              }
            >
              Mở thư 💌
            </motion.button>
          </motion.div>
        )}

        {/* 3D Unfolding Animation */}
        {envelopeStage === 'unfold' && (
          <motion.div
            key="unfold"
            className="absolute inset-0 flex items-center justify-center p-4"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <LetterUnfolding />
          </motion.div>
        )}

        {/* Letter Reading View */}
        {envelopeStage === 'reading' && (
          <motion.div
            key="reading"
            className="absolute inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.4, y: 160, transition: { duration: 0.6, ease: [0.5, 0, 0.75, 0] } }}
            transition={{ duration: 0.3 }}
          >
            <LetterReadingView
              gift={gift}
              palette={palette}
              onClose={() => setEnvelopeStage('closing')}
            />
          </motion.div>
        )}

        {/* Closing View */}
        {envelopeStage === 'closing' && (
          <motion.div
            key="closing"
            className="absolute inset-0 flex flex-col items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ width: envelopeW, height: envelopeW / 1.5, perspective: 1200 }}>
              <EnvelopeBack
                ew={envelopeW}
                palette={palette}
                mode="closing"
                onOpen={() => {}}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
