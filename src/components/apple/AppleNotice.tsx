import type { ReactNode } from 'react'

interface AppleNoticeProps {
  title: string
  description?: string
  action?: ReactNode
  /** `error` is used when a request failed, so nobody is told their filters matched nothing. */
  tone?: 'neutral' | 'error'
}

export function AppleNotice({ title, description, action, tone = 'neutral' }: AppleNoticeProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className={`font-display text-[20px] font-semibold ${tone === 'error' ? 'text-apple-alert' : 'text-apple-ink'}`}>
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-[46ch] text-[14px] leading-[22px] text-apple-ink-2">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
