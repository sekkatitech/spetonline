import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useDialog } from '../ui/useDialog'
import { AppleImage } from './AppleImage'

interface AppleGalleryProps {
  images: string[]
  name: string
}

/** Main image with a thumbnail rail, keyboard stepping and a full-size view. */
export function AppleGallery({ images, name }: AppleGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useDialog(zoom, () => setZoom(false), panelRef, panelRef)

  const imageKey = images.join('|')
  useEffect(() => {
    setActive(0)
  }, [imageKey])

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[18px] bg-apple-surface text-[13px] text-apple-muted">
        Image unavailable
      </div>
    )
  }

  const current = images[Math.min(active, images.length - 1)]
  const step = (delta: number) => setActive((index) => (index + delta + images.length) % images.length)

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`View ${name} image ${active + 1} of ${images.length} at full size`}
        className="group block w-full overflow-hidden rounded-[18px] bg-apple-surface"
      >
        <div className="relative flex aspect-[4/3] items-center justify-center p-6 md:p-10">
          <AppleImage
            src={current}
            alt={`${name}, view ${active + 1}`}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex items-center gap-3">
          <div
            role="group"
            aria-label="Product images"
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                step(1)
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                step(-1)
              }
            }}
            className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] border bg-apple-surface p-1.5 transition-colors ${
                  index === active ? 'border-apple-ink' : 'border-apple-line-2 hover:border-apple-line'
                }`}
              >
                <AppleImage src={image} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-apple-ink-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-apple-surface-2"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-[12px] tabular-nums text-apple-muted">
              {active + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-apple-surface-2"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setZoom(false)}>
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} image ${active + 1} of ${images.length}`}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-full w-full items-center justify-center outline-hidden"
          >
            <img
              src={current}
              alt={`${name}, view ${active + 1}`}
              className="max-h-[86vh] w-auto max-w-full rounded-[12px] bg-white object-contain p-4"
            />
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Close image"
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
