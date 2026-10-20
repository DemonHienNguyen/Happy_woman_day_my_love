/**
 * Web Audio API manager for optional intro and seamless looping background music
 */

export interface AudioEngine {
  start: () => void;
  setVolume: (vol: number, rampTime?: number) => void;
  setMuted: (muted: boolean) => void;
}

export function trimSilence(buffer: AudioBuffer): { start: number; end: number } {
  const channel = buffer.getChannelData(0);
  let start = 0;
  let end = channel.length - 1;
  while (start < end && Math.abs(channel[start]) < 1e-4) start++;
  while (end > start && Math.abs(channel[end]) < 1e-4) end--;
  return {
    start: start / buffer.sampleRate,
    end: (end + 1) / buffer.sampleRate,
  };
}

export function createMusicEngine(musicConfig: { intro?: string; loop?: string }): AudioEngine {
  const introUrl = musicConfig.intro;
  const loopUrl = musicConfig.loop;

  let ctx: AudioContext | null = null;
  let gainNode: GainNode | null = null;
  let buffersPromise: Promise<[AudioBuffer, AudioBuffer | null] | null> | null = null;
  let isPlaying = false;
  let currentVolume = 0.8;
  let isMuted = false;

  if (typeof window !== 'undefined' && loopUrl) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
      gainNode = ctx.createGain();
      gainNode.gain.value = currentVolume;
      gainNode.connect(ctx.destination);

      const fetchBuffer = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Audio request failed (${res.status} ${res.statusText}): ${url}`);
        }
        const arrayBuf = await res.arrayBuffer();
        return ctx!.decodeAudioData(arrayBuf);
      };

      buffersPromise = Promise.all([
        fetchBuffer(loopUrl).catch((error: unknown) => {
          console.error('Unable to load background music:', error);
          return null;
        }),
        introUrl
          ? fetchBuffer(introUrl).catch((error: unknown) => {
              console.warn('Unable to load intro music; continuing with the background track:', error);
              return null;
            })
          : Promise.resolve(null),
      ]).then(([loopBuffer, introBuffer]) => (loopBuffer ? [loopBuffer, introBuffer] : null));

      const handleVisibilityChange = () => {
        if (!isPlaying || !ctx) return;
        if (document.hidden) {
          ctx.suspend().catch((error) => {
            console.error('Unable to suspend audio while the page is hidden:', error);
          });
        } else {
          ctx.resume().catch((error) => {
            console.error('Unable to resume audio when the page is visible:', error);
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    } catch (error) {
      console.error('Unable to initialize Web Audio:', error);
    }
  }

  const rampVolume = (time: number) => {
    if (!ctx || !gainNode) return;
    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(isMuted ? 0 : currentVolume, now + time);
  };

  const start = () => {
    if (!ctx || !gainNode || isPlaying) return;
    isPlaying = true;
    ctx.resume().catch((error) => {
      console.error('Unable to resume audio playback:', error);
    });

    buffersPromise
      ?.then((buffers) => {
        if (!buffers || !ctx || !gainNode) return;
        const [loopBuf, introBuf] = buffers;
        let scheduleTime = ctx.currentTime + 0.05;

        if (introBuf) {
          const introRange = trimSilence(introBuf);
          const introSource = ctx.createBufferSource();
          introSource.buffer = introBuf;
          introSource.connect(gainNode);
          const dur = introRange.end - introRange.start;
          introSource.start(scheduleTime, introRange.start, dur);
          scheduleTime += dur;
        }

        const loopRange = trimSilence(loopBuf);
        const loopSource = ctx.createBufferSource();
        loopSource.buffer = loopBuf;
        loopSource.loop = true;
        loopSource.loopStart = loopRange.start;
        loopSource.loopEnd = loopRange.end;
        loopSource.connect(gainNode);
        loopSource.start(scheduleTime, loopRange.start);
      })
      .catch((error) => {
        console.error('Unable to start audio playback:', error);
      });
  };

  const setVolume = (vol: number, rampTime = 1.2) => {
    currentVolume = vol;
    rampVolume(rampTime);
  };

  const setMuted = (muted: boolean) => {
    isMuted = muted;
    if (!muted && ctx) {
      ctx.resume().catch((error) => {
        console.error('Unable to resume audio playback:', error);
      });
    }
    rampVolume(0.25);
  };

  return {
    start,
    setVolume,
    setMuted,
  };
}
