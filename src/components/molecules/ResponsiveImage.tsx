import {
  imageLoadingAttrs,
  type ImageIntent,
  type ResponsiveImage as ResponsiveImageSource,
} from '../../lib/responsiveImage';

type ResponsiveImageProps = {
  image: ResponsiveImageSource;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  intent?: ImageIntent;
};

export default function ResponsiveImage({
  image,
  alt,
  sizes,
  className,
  imgClassName,
  intent = 'content',
}: ResponsiveImageProps) {
  const attrs = imageLoadingAttrs(intent);

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={image.avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={image.webpSrcSet} sizes={sizes} />
      <img
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        className={imgClassName}
        loading={attrs.loading}
        fetchPriority={attrs.fetchPriority}
        decoding={attrs.decoding}
        draggable={false}
      />
    </picture>
  );
}
