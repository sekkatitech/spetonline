import { useState } from 'react'

interface AppleImageProps {
  src?: string | null
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

/**
 * Product image with a literal empty state. The catalogue sometimes points at an
 * image that has been moved, and a blank white well gives no clue.
 */
export function AppleImage({ src, alt, className = '', priority = false }: AppleImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <span className="text-[12px] leading-[16px] text-apple-muted">Image unavailable</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
