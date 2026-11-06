export function AppleBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[10px] bg-apple-line-2 ${className}`} />
}

export function AppleCardSkeleton() {
  return (
    <div>
      <AppleBlock className="aspect-square w-full rounded-[18px]" />
      <AppleBlock className="mt-4 h-4 w-3/4" />
      <AppleBlock className="mt-2 h-3 w-1/2" />
      <AppleBlock className="mt-3 h-4 w-1/3" />
      <AppleBlock className="mt-4 h-11 w-full rounded-full" />
      <AppleBlock className="mt-2 h-11 w-full rounded-full" />
    </div>
  )
}

export function AppleGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <AppleCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function AppleDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,652px)_minmax(0,1fr)] lg:gap-11" aria-hidden="true">
      <div>
        <AppleBlock className="aspect-[4/3] w-full rounded-[18px]" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <AppleBlock key={index} className="h-16 w-16 rounded-[8px]" />
          ))}
        </div>
      </div>
      <div>
        <AppleBlock className="h-8 w-4/5" />
        <AppleBlock className="mt-3 h-3 w-1/3" />
        <AppleBlock className="mt-8 h-7 w-2/5" />
        <AppleBlock className="mt-8 h-11 w-full rounded-full" />
        <AppleBlock className="mt-2 h-11 w-full rounded-full" />
        <AppleBlock className="mt-6 h-3 w-2/3" />
      </div>
    </div>
  )
}
