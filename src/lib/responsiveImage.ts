export type ImageIntent = 'lcp' | 'visible' | 'content';

export type ImageLoadingAttrs = {
  loading: 'eager' | 'lazy';
  fetchPriority: 'high' | 'low' | 'auto';
  decoding: 'sync' | 'async';
};

export type ResponsiveImage = {
  src: string;
  width: number;
  height: number;
  avifSrcSet: string;
  webpSrcSet: string;
};

export type PictureModule = {
  sources: { avif?: string; webp?: string };
  img: { src: string; w: number; h: number };
};

export function imageLoadingAttrs(intent: ImageIntent): ImageLoadingAttrs {
  switch (intent) {
    case 'lcp':
      return { loading: 'eager', fetchPriority: 'high', decoding: 'sync' };
    case 'visible':
      return { loading: 'eager', fetchPriority: 'low', decoding: 'async' };
    case 'content':
      return { loading: 'lazy', fetchPriority: 'auto', decoding: 'async' };
    default: {
      const exhaustive: never = intent;
      return exhaustive;
    }
  }
}

export function responsiveFromPicture(picture: PictureModule): ResponsiveImage {
  const avifSrcSet = picture.sources.avif ?? '';
  const webpSrcSet = picture.sources.webp ?? '';
  if (!avifSrcSet || !webpSrcSet || !picture.img.src) {
    throw new Error('La imagen responsive necesita srcset AVIF, srcset WebP y un src de respaldo');
  }
  return {
    src: picture.img.src,
    width: picture.img.w,
    height: picture.img.h,
    avifSrcSet,
    webpSrcSet,
  };
}
