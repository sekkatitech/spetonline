import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type AppleButtonVariant = 'primary' | 'secondary' | 'plain'
export type AppleButtonSize = 'sm' | 'md' | 'lg'

const SIZES: Record<AppleButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-[14px]',
  lg: 'h-12 px-8 text-[15px]',
}

const VARIANTS: Record<AppleButtonVariant, string> = {
  primary:
    'bg-apple-blue text-white hover:bg-apple-blue-dark disabled:bg-apple-line-2 disabled:text-apple-ink-2/60',
  secondary:
    'border border-apple-line bg-transparent text-apple-ink hover:border-apple-ink disabled:border-apple-line-2 disabled:text-apple-muted',
  plain: 'text-apple-blue hover:underline disabled:text-apple-muted',
}

export function appleButtonStyles({
  variant = 'primary',
  size = 'md',
  className = '',
}: { variant?: AppleButtonVariant; size?: AppleButtonSize; className?: string } = {}) {
  const sizing = variant === 'plain' ? 'px-0 text-[14px]' : SIZES[size]
  return [
    'inline-flex select-none items-center justify-center gap-2 rounded-full font-medium',
    'transition-colors disabled:cursor-not-allowed',
    sizing,
    VARIANTS[variant],
    className,
  ].join(' ')
}

interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppleButtonVariant
  size?: AppleButtonSize
  children: ReactNode
}

export function AppleButton({ variant, size, className = '', children, type = 'button', ...props }: AppleButtonProps) {
  return (
    <button type={type} className={appleButtonStyles({ variant, size, className })} {...props}>
      {children}
    </button>
  )
}

interface AppleLinkButtonProps {
  to: string
  variant?: AppleButtonVariant
  size?: AppleButtonSize
  className?: string
  children: ReactNode
  'aria-label'?: string
}

export function AppleLinkButton({ to, variant, size, className = '', children, ...props }: AppleLinkButtonProps) {
  return (
    <Link to={to} className={appleButtonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  )
}
