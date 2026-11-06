import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

interface AppleFilmProps {
  src?: string | null
  /** Shown until the shopper presses play, and kept if the film can't load. */
  poster: string
  alt: string
  /** frame height classes, e.g. "h-[240px] md:h-[320px]" */
  frameClassName?: string
  /** The one hero film may loop silently; every other film waits for a press. */
  autoplay?: boolean
  /** Product stills read better contained; film stills fill the frame. */
  posterFit?: 'cover' | 'contain'
  className?: string
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * A bounded, poster-first product film. Nothing downloads until it is needed:
 * autoplay loops only when the shopper hasn't asked for reduced motion and
 * isn't on a data-saving connection, and every other film waits for a press.
 */
export function AppleFilm({
  src,
  poster,
  alt,
  frameClassName = 'h-[240px] md:h-[320px]',
  autoplay = false,
  posterFit = 'cover',
  className = '',
}: AppleFilmProps) {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [allowAutoplay, setAllowAutoplay] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!autoplay || !src) return
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    // Phones get the still and the play button; a full film download is not worth
    // the data on a small screen.
    const wideEnough = window.matchMedia?.('(min-width: 1024px)').matches !== false
    setAllowAutoplay(wideEnough && !prefersReducedMotion() && !connection?.saveData)
  }, [autoplay, src])

  const showVideo = Boolean(src) && !failed && (playing || allowAutoplay)

  return (
    <div className={`relative overflow-hidden rounded-[18px] bg-apple-surface ${frameClassName} ${className}`}>
      {showVideo ? (
        <video
          ref={videoRef}
          src={src ?? undefined}
          poster={poster}
          aria-label={alt}
          autoPlay
          muted={!playing}
          loop={!playing}
          playsInline
          controls={playing}
          preload={playing ? 'auto' : 'metadata'}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          src={poster}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full ${posterFit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      )}

      {src && !failed && !playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute bottom-4 left-4 inline-flex h-9 items-center gap-2 rounded-full bg-black/70 px-4 text-[13px] font-medium text-white transition-colors hover:bg-black"
        >
          <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
          Play film
          <span className="sr-only">: {alt}</span>
        </button>
      )}
    </div>
  )
}
