export interface PhotoWish {
  src: string;
  wish?: string;
}

export interface Chapter {
  sprig: string;
  photos: PhotoWish[];
}

export interface PaletteConfig {
  id: string;
  bg: string;
  darkBg: string;
  glow: string;
  blooms: string[];
  petals: string[];
}

export interface GiftData {
  herName: string;
  signature: string;
  palette: 'pink' | 'mixed' | 'red' | 'yellow' | 'blue' | 'white';
  music: {
    intro?: string;
    loop: string;
  };
  cover: {
    greeting: string;
    line: string;
    button: string;
  };
  garden: {
    big: string;
    line: string;
    photo: string;
    focus: string;
  };
  chapters: Chapter[];
  bouquet: {
    intro: string;
    more: string;
    tag: string;
    line: string;
  };
  letter: {
    prompt: string;
    greeting: string;
    paragraphs: string[];
    closing: string;
    photo: string;
    stamp: string;
    postmark: string;
  };
  ending: {
    line: string;
    photo: string;
  };
}

export const PALETTES: Record<string, { bg: string; darkBg: string; glow: string; blooms: string[]; petals: string[] }> = {
  pink: {
    bg: 'linear-gradient(168deg, #fceeee 0%, #f7dede 55%, #ecd0d2 100%)',
    darkBg: 'linear-gradient(180deg, #2a1020 0%, #1f0b17 52%, #14070f 100%)',
    glow: 'rgba(255, 175, 190, 0.45)',
    blooms: [
      '/growing-garden/pink/bloom-cream-daisy-head-md-02.webp',
      '/growing-garden/pink/bloom-cream-daisy-head-md-03.webp',
      '/growing-garden/pink/bloom-pale-pink-lily-head-lg-01.webp',
      '/growing-garden/pink/bloom-soft-pink-zinnia-head-md-02.webp',
      '/growing-garden/pink/bloom-pale-pink-lily-head-lg-02.webp',
      '/growing-garden/pink/bloom-peach-cosmos-head-md-02.webp',
      '/growing-garden/pink/bloom-white-hibiscus-head-lg-01.webp',
      '/growing-garden/pink/bloom-pink-clematis-head-md-01.webp',
      '/growing-garden/pink/bloom-pink-daisy-head-md-01.webp',
    ],
    petals: [
      '/growing-garden/pink/petal-muted-rose-long-01.webp',
      '/growing-garden/pink/petal-blush-broad-02.webp',
      '/growing-garden/pink/petal-cream-pink-blush-01.webp',
      '/growing-garden/pink/petal-coral-curved-01.webp',
    ],
  },
  mixed: {
    bg: 'linear-gradient(168deg, #f7efe7 0%, #eedfd2 55%, #dfcbb9 100%)',
    darkBg: 'linear-gradient(180deg, #27171d 0%, #1b0f15 52%, #120a0e 100%)',
    glow: 'rgba(255, 195, 155, 0.42)',
    blooms: [
      '/growing-garden/mixed/bloom-white-peony-head-xl-01.webp',
      '/growing-garden/mixed/bloom-blue-hydrangea-head-lg-01.webp',
      '/growing-garden/mixed/bloom-blue-nigella-head-md-01.webp',
      '/growing-garden/mixed/bloom-yellow-craspedia-head-sm-01.webp',
      '/growing-garden/mixed/bloom-white-daisy-head-md-01.webp',
      '/growing-garden/mixed/bloom-cream-daisy-red-center-head-md-01.webp',
      '/growing-garden/mixed/bloom-peach-cosmos-head-md-01.webp',
      '/growing-garden/mixed/bloom-blush-lily-head-md-01.webp',
      '/growing-garden/mixed/bloom-blush-lily-head-md-02.webp',
      '/growing-garden/mixed/bloom-pink-daisy-head-md-02.webp',
      '/growing-garden/mixed/bloom-red-rose-head-lg-02.webp',
      '/growing-garden/mixed/bloom-red-rose-head-lg-03.webp',
      '/growing-garden/mixed/bloom-cream-rose-head-lg-02.webp',
      '/growing-garden/mixed/bloom-pink-cosmos-head-md-03.webp',
      '/growing-garden/mixed/bloom-pink-hydrangea-head-lg-01.webp',
      '/growing-garden/mixed/bloom-pink-zinnia-head-lg-01.webp',
      '/growing-garden/mixed/bloom-orange-lily-head-lg-01.webp',
    ],
    petals: [
      '/growing-garden/pink/petal-muted-rose-long-01.webp',
      '/growing-garden/pink/petal-blush-broad-02.webp',
      '/growing-garden/pink/petal-cream-pink-blush-01.webp',
      '/growing-garden/pink/petal-coral-curved-01.webp',
    ],
  },
  red: {
    bg: 'linear-gradient(168deg, #f9e9ea 0%, #f2d4d6 55%, #e4bcc0 100%)',
    darkBg: 'linear-gradient(180deg, #280b12 0%, #1c060c 52%, #110307 100%)',
    glow: 'rgba(235, 75, 95, 0.42)',
    blooms: [
      '/growing-garden/red/bloom-dahlia-head-lg-01.webp',
      '/growing-garden/red/bloom-cream-daisy-red-center-head-md-01.webp',
      '/growing-garden/red/bloom-anemone-head-md-01.webp',
      '/growing-garden/red/bloom-cream-daisy-red-center-head-md-02.webp',
      '/growing-garden/red/bloom-dahlia-head-lg-02.webp',
    ],
    petals: [
      '/growing-garden/red/petal-ruby-broad-01.webp',
      '/growing-garden/red/petal-wine-oval-01.webp',
      '/growing-garden/red/petal-cream-red-blush-01.webp',
      '/growing-garden/red/petal-scarlet-long-01.webp',
      '/growing-garden/red/petal-wine-oval-02.webp',
    ],
  },
  yellow: {
    bg: 'linear-gradient(168deg, #fdf8e6 0%, #faecc5 55%, #eed699 100%)',
    darkBg: 'linear-gradient(180deg, #261f0d 0%, #1a1508 52%, #110d05 100%)',
    glow: 'rgba(255, 215, 95, 0.45)',
    blooms: [
      '/growing-garden/yellow/bloom-chamomile-head-md-01.webp',
      '/growing-garden/yellow/bloom-yellow-zinnia-head-md-01.webp',
      '/growing-garden/yellow/bloom-marigold-head-md-01.webp',
      '/growing-garden/yellow/bloom-cream-daisy-yellow-center-head-md-01.webp',
      '/growing-garden/yellow/bloom-buttercup-head-md-01.webp',
    ],
    petals: [
      '/growing-garden/yellow/petal-gold-long-01.webp',
      '/growing-garden/yellow/petal-marigold-oval-01.webp',
      '/growing-garden/yellow/petal-butter-broad-01.webp',
      '/growing-garden/yellow/petal-cream-yellow-blush-01.webp',
    ],
  },
  blue: {
    bg: 'linear-gradient(168deg, #eaf1f8 0%, #d8e5f2 55%, #c0d3e5 100%)',
    darkBg: 'linear-gradient(180deg, #0e1b29 0%, #09131d 52%, #050c13 100%)',
    glow: 'rgba(125, 185, 255, 0.45)',
    blooms: [
      '/growing-garden/blue/bloom-blue-cornflower-head-lg-01.webp',
      '/growing-garden/blue/bloom-blue-cornflower-head-lg-02.webp',
      '/growing-garden/blue/bloom-blue-hydrangea-head-lg-01.webp',
      '/growing-garden/blue/bloom-blue-nigella-head-md-01.webp',
      '/growing-garden/blue/bloom-forget-me-not-cluster-head-md-02.webp',
      '/growing-garden/blue/bloom-white-daisy-head-md-01.webp',
    ],
    petals: [
      '/growing-garden/blue/petal-blue-broad-01.webp',
      '/growing-garden/blue/petal-blue-cream-broad-01.webp',
      '/growing-garden/blue/petal-blue-long-01.webp',
      '/growing-garden/blue/petal-cream-blue-broad-02.webp',
      '/growing-garden/blue/petal-cream-blue-long-01.webp',
    ],
  },
  white: {
    bg: 'linear-gradient(168deg, #eef1ea 0%, #e4ebe2 55%, #d6e0d3 100%)',
    darkBg: 'linear-gradient(180deg, #1e2b1e 0%, #162117 52%, #0f180f 100%)',
    glow: 'rgba(238, 240, 230, 0.55)',
    blooms: [
      '/growing-garden/white/bloom-white-peony-head-xl-01.webp',
      '/growing-garden/white/bloom-white-gardenia-head-lg-01.webp',
      '/growing-garden/white/bloom-white-daisy-head-md-01.webp',
    ],
    petals: [
      '/growing-garden/white/petal-white-calla-lily-spathe-lg-01.webp',
      '/growing-garden/white/petal-champagne-broad-01.webp',
      '/growing-garden/white/petal-ivory-broad-01.webp',
      '/growing-garden/white/petal-ivory-long-01.webp',
    ],
  },
};

export const DEFAULT_GIFT: GiftData = {
  herName: 'Chi :3',
  signature: 'Hỉn Thúi',
  palette: 'mixed',
  music: {
    intro: '/music/my_songs.mp3',
    loop: '/music/my_songs.mp3',
  },
  cover: {
    greeting: 'Gửi em,',
    line: 'nhân ngày 20 tháng 10',
    button: 'Chạm để mở quà',
  },
  garden: {
    big: '20 · 10',
    line: 'Giữa cả một rừng hoa, em vẫn là đoá đẹp nhất',
    photo: '/gift/photos/p01.jpg',
    focus: '30% 55%',
  },
  chapters: [
    {
      sprig: 'Những bông này, cho nụ cười của em',
      photos: [
        { src: '/gift/photos/p01.jpg', wish: 'Chúc em ngày nào cũng cười thật tươi như thế này.' },
        { src: '/gift/photos/p02.jpg' },
        { src: '/gift/photos/p03.jpg' },
        { src: '/gift/photos/p04.jpg' },
        { src: '/gift/photos/p05.jpg' },
        { src: '/gift/photos/p06.jpg' },
      ],
    },
    {
      sprig: 'Và những bông này, cho những ngày bình yên của em',
      photos: [
        { src: '/gift/photos/p07.jpg' },
        { src: '/gift/photos/p08.jpg' },
        { src: '/gift/photos/p09.jpg' },
        { src: '/gift/photos/p10.jpg' },
        { src: '/gift/photos/p11.jpg' },
        { src: '/gift/photos/p12.jpg', wish: 'Chúc em luôn khoẻ mạnh, bình an và được yêu thương thật nhiều.' },
      ],
    },
  ],
  bouquet: {
    intro: 'Anh gói tặng em một bó hoa…',
    more: '…và còn thật nhiều khoảnh khắc đẹp của em',
    tag: 'Gửi em, 20.10',
    line: 'Hoa ngoài tiệm sẽ héo. Bó này, anh giữ cho em mãi.',
  },
  letter: {
    prompt: 'Còn một điều anh muốn nói…',
    greeting: 'Em,',
    paragraphs: [
      'Hôm nay ai cũng tặng hoa cho phụ nữ. Anh cũng muốn tặng em, nhưng anh nghĩ em xứng đáng được nghe nhiều hơn một câu “chúc em xinh đẹp”.',
      'Thật ra anh đã có nhiều chuyện xảy ra về ngày hôm nay, anh không biết tại sao anh lại viết ra lời này nhưng anh cảm ơn em vì đã cùng với anh đi với nhau từ lúc cấp 3 đến tận bây giờ, cảm ơn em vì đã là người lắng nghe những câu chuyện của anh là người luôn bên cạnh anh mỗi khi anh buồn.',
      'Cảm ơn em vì đã chọn ở bên một người vụng về như anh. Và xin lỗi vì có những lúc anh vô tâm, làm em buồn mà không biết.',
      'Anh không hứa điều gì lớn lao. Anh chỉ hứa, từ nay mỗi ngày đều là 20/10 của em.',
    ],
    closing: 'Thương em,',
    photo: '/gift/photos/p01.jpg',
    stamp: '/gift/photos/p01.jpg',
    postmark: '20.10.2026',
  },
  ending: {
    line: 'Hoa ngoài kia sẽ héo. Còn em, anh sẽ tưới mỗi ngày.',
    photo: '/gift/photos/p09.jpg',
  },
};
