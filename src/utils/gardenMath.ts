/**
 * Deterministic PRNG and radial garden flower placement calculations
 */

export function pseudoRandom(seed: number, mult = 1): number {
  const s = 43758.5453 * Math.sin((seed + 1) * 12.9898 * mult);
  return s - Math.floor(s);
}

export const round2 = (num: number): number => Math.round(100 * num) / 100;

export const LEAF_PATHS = [
  "M0 0 C 4.5 -4.2 4.9 4.8 0 10 C -4.9 4.8 -4.5 -4.2 0 0 Z",
  "M0 0 C 3.1 -5.4 3.1 6.4 0 11.6 C -3.1 6.4 -3.1 -5.4 0 0 Z",
];

const STEM_COLORS = ["#869377", "#7c8b6e", "#94917c"];
const LEAF_COLORS = ["#9aab86", "#879a72", "#7c9270", "#6e8763"];

const BIG_FLOWER_REGEX = /rose|peony|dahlia|sunflower|lily|hydrangea|ranunculus|anemone|zinnia|marigold|gardenia|chrysanthemum|tulip|camellia|poppy/;

const DIRECTIONS = [
  { deg: 90, order: 0 },
  { deg: 135, order: 1 },
  { deg: 180, order: 2 },
  { deg: 225, order: 3 },
  { deg: 270, order: 4 },
  { deg: 315, order: 5 },
  { deg: 0, order: 6 },
  { deg: 45, order: 7 },
];

const TIER_POINTS = {
  high: [
    [0.98, -0.72],
    [0.98, -0.24],
    [0.98, 0.26],
    [0.98, 0.72],
    [0.83, -0.5],
    [0.83, 0.5],
    [0.68, -0.55],
    [0.68, 0.05],
    [0.68, 0.55],
    [0.52, -0.28],
    [0.52, 0.32],
    [0.34, 0.1],
    [0.17, -0.15],
  ],
  mid: [
    [0.97, -0.66],
    [0.97, -0.2],
    [0.97, 0.26],
    [0.97, 0.68],
    [0.82, -0.46],
    [0.82, 0.46],
    [0.66, -0.52],
    [0.66, 0.08],
    [0.66, 0.55],
    [0.48, -0.24],
    [0.48, 0.34],
    [0.3, 0.06],
  ],
  low: [
    [0.95, -0.55],
    [0.95, 0.05],
    [0.95, 0.6],
    [0.76, -0.35],
    [0.76, 0.4],
    [0.56, 0],
    [0.38, -0.25],
  ],
};

const DENSITY_BY_DEG: Record<number, number> = {
  90: 1,
  135: 0.92,
  45: 0.92,
  180: 0.84,
  0: 0.84,
  225: 0.82,
  315: 0.82,
  270: 0.58,
};

const isDiagonal = (deg: number) => deg === 45 || deg === 135 || deg === 225 || deg === 315;

export const EASINGS = {
  enter: [0.22, 1, 0.36, 1] as [number, number, number, number],
  drift: [0.33, 1, 0.68, 1] as [number, number, number, number],
  settle: [0.65, 0, 0.35, 1] as [number, number, number, number],
  fall: [0.3, 0, 0.72, 0.25] as [number, number, number, number],
  bloom: [0.3, 1.18, 0.5, 1] as [number, number, number, number],
};

export interface GardenFlower {
  hx: number;
  hy: number;
  headPx: number;
  headOp: number;
  layer: 'bg' | 'mid' | 'fg';
  stemRestOp: number;
  angleDeg: number;
  stemLen: number;
  boxW: number;
  stemW: number;
  stemTone: string;
  stemPath: string;
  leaves: Array<{
    yFrac: number;
    side: number;
    rot: number;
    scale: number;
    tone: string;
    shape: number;
    op: number;
  }>;
  z: number;
  src: string;
  growDelay: number;
  enterDur: number;
  enterRot: number;
  fallX: number;
  fallY: number;
  fallRot: number;
  fallDelay: number;
  fallDur: number;
  swayDur: number;
  windAmp: number;
  sway: boolean;
}

export function generateGardenFlowers(
  tier: 'low' | 'mid' | 'high',
  width: number,
  height: number,
  blooms: string[]
): GardenFlower[] {
  const bigBlooms = blooms.filter((b) => BIG_FLOWER_REGEX.test(b));
  const medBlooms = blooms.filter((b) => !BIG_FLOWER_REGEX.test(b));
  const bloomPool = {
    big: bigBlooms.length ? bigBlooms : blooms,
    med: medBlooms.length ? medBlooms : blooms,
  };

  const cx = 0.5 * width;
  const cy = 0.46 * height;
  const unit = Math.min(width, height) / 100;
  const points = TIER_POINTS[tier] || TIER_POINTS.mid;
  const isPortrait = height > 1.15 * width;
  const maxPerSector = tier === 'low' ? 5 : tier === 'mid' ? 12 : 9999;
  const sectorFactor = (deg: number) =>
    isPortrait && tier !== 'low' ? (deg === 0 || deg === 180 ? 1.3 : isDiagonal(deg) ? 1.25 : 1) : 1;

  const flowers: GardenFlower[] = [];
  let globalIndex = 0;

  for (const dir of DIRECTIONS) {
    const totalPoints = Math.max(
      1,
      Math.min(
        points.length,
        Math.round(points.length * (DENSITY_BY_DEG[dir.deg] ?? 1) * sectorFactor(dir.deg) * (tier === 'low' ? 0.8 : 1))
      )
    );

    for (let i = 0; i < totalPoints; i++) {
      const idx = globalIndex++;
      const [radialDist, angularJitter] = points[i];
      const rand1 = pseudoRandom(idx, 31);
      const layer: 'bg' | 'mid' | 'fg' =
        radialDist >= 0.72
          ? rand1 < 0.5
            ? 'bg'
            : 'mid'
          : radialDist <= 0.45
            ? rand1 < 0.5
              ? 'fg'
              : rand1 < 0.85
                ? 'mid'
                : 'bg'
            : rand1 < 0.12
              ? 'bg'
              : rand1 < 0.74
                ? 'mid'
                : 'fg';

      const spread = isPortrait
        ? dir.deg === 0 || dir.deg === 180
          ? 42
          : isDiagonal(dir.deg)
            ? 30
            : 24
        : 24;

      const angleRad = ((dir.deg + angularJitter * spread + (pseudoRandom(idx, 2) - 0.5) * 6) * Math.PI) / 180;
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);

      // Raycast to screen boundary
      let maxDist = Infinity;
      if (cosA > 1e-6) maxDist = Math.min(maxDist, (width - cx) / cosA);
      else if (cosA < -1e-6) maxDist = Math.min(maxDist, -cx / cosA);
      if (sinA > 1e-6) maxDist = Math.min(maxDist, (height - cy) / sinA);
      else if (sinA < -1e-6) maxDist = Math.min(maxDist, -cy / sinA);
      if (!Number.isFinite(maxDist)) maxDist = Math.max(width, height);

      const layerScale = layer === 'fg' ? 0.96 : radialDist >= 0.9 ? 1 : 0.9;
      const dist = radialDist * maxDist * layerScale;
      const isBig = pseudoRandom(idx, 3) > 0.5;
      const headPx =
        ((layer === 'bg' ? 8.5 : layer === 'fg' ? 19 : 13) +
          3.5 * (isBig ? 1 : 0) +
          3.5 * pseudoRandom(idx, 5) +
          (1 - radialDist) * 4) *
        unit;

      const stemLen = 1.12 * maxDist - dist;
      const boxW = Math.max(24, 0.95 * headPx);
      const curveOffset = (pseudoRandom(idx, 4) - 0.5) * boxW * 0.9;
      const fallDist = maxDist - dist + 1.6 * headPx + pseudoRandom(idx, 11) * unit * 6;

      const leaves = Array.from(
        { length: isBig && pseudoRandom(idx, 41) > 0.45 ? 2 : 1 },
        (_, leafIdx) => {
          const lSeed = 4 * idx + leafIdx;
          const side = leafIdx % 2 === 0 ? 1 : -1;
          return {
            yFrac: 0.78 + 0.85 * leafIdx,
            side,
            rot: side * (40 + 26 * pseudoRandom(lSeed, 17)),
            scale: 0.78 + 0.34 * pseudoRandom(lSeed, 19),
            tone: LEAF_COLORS[Math.floor(pseudoRandom(lSeed, 23) * LEAF_COLORS.length)],
            shape: Math.floor(pseudoRandom(lSeed, 29) * LEAF_PATHS.length),
            op: round2(0.65 + 0.2 * pseudoRandom(lSeed, 37)),
          };
        }
      );

      const src = isBig
        ? bloomPool.big[((idx % maxPerSector) * 2 + 1) % bloomPool.big.length]
        : bloomPool.med[((idx % maxPerSector) * 3 + 1) % bloomPool.med.length];

      flowers.push({
        hx: round2(cx + cosA * dist),
        hy: round2(cy + sinA * dist),
        headPx: round2(headPx),
        headOp: round2(
          layer === 'bg'
            ? 0.78 + 0.08 * pseudoRandom(idx, 6)
            : layer === 'mid'
              ? 0.88 + 0.06 * pseudoRandom(idx, 6)
              : 1
        ),
        layer,
        stemRestOp: round2(0.55 - (1 - radialDist) * 0.18),
        angleDeg: round2((180 * Math.atan2(-cosA, sinA)) / Math.PI),
        stemLen: round2(stemLen),
        boxW: round2(boxW),
        stemW: round2(Math.max(1.1, 0.032 * headPx)),
        stemTone: STEM_COLORS[idx % STEM_COLORS.length],
        stemPath: `M${round2(boxW / 2)} ${round2(stemLen)} C ${round2(boxW / 2 + 0.55 * curveOffset)} ${round2(
          0.7 * stemLen
        )}, ${round2(boxW / 2 + curveOffset)} ${round2(0.32 * stemLen)}, ${round2(
          boxW / 2 + 0.4 * curveOffset
        )} ${round2(0.18 * headPx)}`,
        leaves,
        z:
          (layer === 'bg' ? 3 : layer === 'mid' ? 8 : 14) +
          Math.round((1 - radialDist) * 2) +
          (isBig ? 1 : 0),
        src,
        growDelay: round2((1 - radialDist) * 1.6 + 0.05 * dir.order + 0.25 * pseudoRandom(idx, 9)),
        enterDur: round2(0.7 + (1 - radialDist) * 0.5 + 0.2 * pseudoRandom(idx, 10)),
        enterRot: round2((pseudoRandom(idx, 12) - 0.5) * 18),
        fallX: round2(cosA * fallDist),
        fallY: round2(sinA * fallDist),
        fallRot: round2((pseudoRandom(idx, 13) - 0.5) * 26),
        fallDelay: round2(0.6 * radialDist + 0.28 * pseudoRandom(idx, 16)),
        fallDur: round2(1.25 + (1 - radialDist) * 0.5 + 0.35 * pseudoRandom(idx, 17)),
        swayDur: round2(2 + pseudoRandom(idx, 18)),
        windAmp: round2(2 + 1.8 * pseudoRandom(idx, 19) + 0.8 * (layer === 'fg' ? 1 : 0)),
        sway: false,
      });
    }
  }

  const swayCount = tier === 'high' ? flowers.length : tier === 'mid' ? 9 : 0;
  flowers
    .filter((f) => f.layer === 'fg' || (f.layer === 'mid' && tier === 'high'))
    .sort((a, b) => b.headPx - a.headPx)
    .slice(0, swayCount)
    .forEach((f) => {
      f.sway = true;
    });

  return flowers;
}

export function generateDriftingPetals(tier: 'low' | 'mid' | 'high', petals: string[]) {
  const count = tier === 'low' ? 5 : tier === 'mid' ? 8 : 20;
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 200;
    return {
      src: petals[seed % petals.length],
      fx: (pseudoRandom(seed, 7) - 0.5) * 0.9,
      fy: (pseudoRandom(seed, 8) - 0.5) * 0.76,
      size: 3.5 + 3 * pseudoRandom(seed, 9),
      rot: (pseudoRandom(seed, 10) - 0.5) * 280,
      op: 0.5 + 0.3 * pseudoRandom(seed, 11),
      delay: 0.6 * pseudoRandom(seed, 12),
      z: pseudoRandom(seed, 13) > 0.5 ? 10 : 5,
      driftRot: (160 + 200 * pseudoRandom(seed, 14)) * (pseudoRandom(seed, 15) > 0.5 ? 1 : -1),
      fallDelay: 0.4 * pseudoRandom(seed, 16),
    };
  });
}

export function generateGlowMotes(tier: 'low' | 'mid' | 'high') {
  const count = tier === 'high' ? 14 : tier === 'mid' ? 5 : 0;
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 300;
    return {
      left: 6 + 88 * pseudoRandom(seed, 3),
      size: 3 + 5 * pseudoRandom(seed, 4),
      delay: 1.6 * pseudoRandom(seed, 5),
      dur: 3.4 + 2.6 * pseudoRandom(seed, 6),
      rise: 18 + 24 * pseudoRandom(seed, 7),
      drift: (pseudoRandom(seed, 8) - 0.5) * 10,
      op: 0.3 + 0.35 * pseudoRandom(seed, 9),
      gap: 1.2 * pseudoRandom(seed, 11),
    };
  });
}
