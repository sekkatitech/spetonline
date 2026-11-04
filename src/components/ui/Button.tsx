import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-spet-blue text-white hover:bg-spet-blue-dark',
  secondary: 'border border-spet-line bg-spet-surface text-spet-ink hover:border-spet-blue hover:text-spet-blue',
  ghost: 'text-spet-ink-2 hover:bg-spet-surface-2 hover:text-spet-blue',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[12px]',
  md: 'h-11 px-4 text-[13px]',
  lg: 'h-12 px-6 text-[15px]',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size, className })} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  to: string;
  state?: unknown;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}

export function ButtonLink({ to, variant = 'primary', size = 'md', className = '', children, ...props }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', className = '', children, ...props },
  ref
) {
  const dimensions = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const styles =
    variant === 'secondary'
      ? 'border border-spet-line bg-spet-surface text-spet-ink hover:border-spet-blue hover:text-spet-blue'
      : 'text-spet-ink-2 hover:bg-spet-surface-2 hover:text-spet-blue';

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex ${dimensions} shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
