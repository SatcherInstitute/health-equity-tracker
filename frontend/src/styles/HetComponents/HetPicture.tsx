import type { ImgHTMLAttributes } from 'react'

interface HetPictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

// Drop-in replacement for <img> that serves WebP to supporting browsers
// with the original format as fallback. Only applies to local PNG/JPG assets.
export default function HetPicture({ src, alt, ...imgProps }: HetPictureProps) {
  const isLocal = src.startsWith('/img/')
  // cspell:ignore jpe
  const webpSrc = isLocal ? src.replace(/\.(png|jpe?g)$/i, '.webp') : null

  if (!webpSrc || webpSrc === src) {
    return <img src={src} alt={alt} {...imgProps} />
  }

  return (
    <picture style={{ display: 'contents' }}>
      <source srcSet={webpSrc} type='image/webp' />
      <img src={src} alt={alt} {...imgProps} />
    </picture>
  )
}
