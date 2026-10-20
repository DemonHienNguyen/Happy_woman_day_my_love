import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_GIFT, GiftData, PALETTES } from './types/gift';
import { createMusicEngine, AudioEngine } from './components/AudioController';
import { CoverScreen } from './components/CoverScreen';
import { GrowingGarden } from './components/GrowingGarden';
import { GardenReveal } from './components/GardenReveal';
import { BouquetExperience } from './components/BouquetExperience';
import { LetterExperience } from './components/LetterExperience';
import { EndingScreen } from './components/EndingScreen';

const FADE_TRANSITION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.8, ease: 'easeInOut' as const },
};

const GARDEN_TIMELINE = {
  grow: 600,
  peak: 4000,
  fall: 10500,
  done: 13300,
};

export default function App() {
  // Read optional URL parameters
  const [gift] = useState<GiftData>(() => {
    if (typeof window === 'undefined') return DEFAULT_GIFT;
    const params = new URLSearchParams(window.location.search);
    const herName = params.get('herName');
    const signature = params.get('signature');
    const palette = params.get('palette') as GiftData['palette'] | null;

    return {
      ...DEFAULT_GIFT,
      herName: herName || DEFAULT_GIFT.herName,
      signature: signature || DEFAULT_GIFT.signature,
      palette: palette && PALETTES[palette] ? palette : DEFAULT_GIFT.palette,
    };
  });

  const palette = useMemo(() => {
    const pal = PALETTES[gift.palette] || PALETTES.mixed;
    return { id: gift.palette, ...pal };
  }, [gift.palette]);

  const [mode, setMode] = useState<'cover' | 'garden' | 'bouquet' | 'letter' | 'ending'>('cover');
  const [replayCount, setReplayCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Initialize background audio engine
  useEffect(() => {
    const engine = createMusicEngine(gift.music);
    audioEngineRef.current = engine;

    // Check query params for initial mute
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('muted') === '1') {
        engine.setMuted(true);
        setIsMuted(true);
      }
    }
  }, [gift.music]);

  // Adjust volume dynamically: softer during letter reading
  useEffect(() => {
    if (!audioEngineRef.current) return;
    audioEngineRef.current.setVolume(mode === 'letter' ? 0.35 : 0.8);
  }, [mode]);

  const handleOpenCover = () => {
    // Preload next image assets for silky transitions
    const chapterPhotos = gift.chapters.flatMap((c) => c.photos.map((p) => p.src));
    const allImagesToPreload = [gift.garden.photo, ...chapterPhotos, ...palette.blooms];
    allImagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    audioEngineRef.current?.start();
    setMode('garden');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngineRef.current?.setMuted(nextMuted);
  };

  const handleReplay = () => {
    setReplayCount((c) => c + 1);
    setMode('garden');
  };

  return (
    <main
      className="font-sans-gift fixed inset-0 overflow-hidden text-[#4a1c2c]"
      style={{
        background: mode === 'cover' || mode === 'garden' ? palette.darkBg : palette.bg,
      }}
    >
      <AnimatePresence mode="wait">
        {mode === 'cover' && (
          <motion.div key="cover" className="absolute inset-0" {...FADE_TRANSITION}>
            <CoverScreen gift={gift} palette={palette} onOpen={handleOpenCover} />
          </motion.div>
        )}

        {mode === 'garden' && (
          <motion.div key={`garden-${replayCount}`} className="absolute inset-0" {...FADE_TRANSITION}>
            <GrowingGarden
              palette={palette}
              skippable={false}
              leanAt={6600}
              timeline={GARDEN_TIMELINE}
              onComplete={() => {
                window.setTimeout(() => setMode('bouquet'), 1200);
              }}
            />
            <GardenReveal gift={gift} palette={palette} />
          </motion.div>
        )}

        {mode === 'bouquet' && (
          <motion.div key={`bouquet-${replayCount}`} className="absolute inset-0" {...FADE_TRANSITION}>
            <BouquetExperience gift={gift} palette={palette} onDone={() => setMode('letter')} />
          </motion.div>
        )}

        {mode === 'letter' && (
          <motion.div key={`letter-${replayCount}`} className="absolute inset-0" {...FADE_TRANSITION}>
            <LetterExperience gift={gift} palette={palette} onDone={() => setMode('ending')} />
          </motion.div>
        )}

        {mode === 'ending' && (
          <motion.div key={`ending-${replayCount}`} className="absolute inset-0" {...FADE_TRANSITION}>
            <EndingScreen gift={gift} palette={palette} onReplay={handleReplay} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Toggle Button (Matches target site) */}
      {gift.music && mode !== 'cover' && (
        <button
          type="button"
          aria-label={isMuted ? 'Bật nhạc' : 'Tắt nhạc'}
          onClick={handleToggleMute}
          className="fixed right-4 top-4 z-[80] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/30 text-lg backdrop-blur shadow-sm transition-all hover:bg-white/50 active:scale-95"
        >
          {isMuted ? '🔇' : '🎵'}
        </button>
      )}
    </main>
  );
}
