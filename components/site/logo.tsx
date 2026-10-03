import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'light';
}

export function Logo({ className, showText = true, variant = 'default' }: LogoProps) {
  const textColor =
    variant === 'light'
      ? 'text-white'
      : 'text-foreground';

  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2', className)}
      aria-label="SarkariSetu home"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M3 11L12 4L21 11V20C21 20.5523 20.5523 21 20 21H4C3.4477 21 3 20.5523 3 20V11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9 21V15C9 14.4477 9.4477 14 10 14H14C14.5523 14 15 14.4477 15 15V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M3 11H21" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      {showText && (
        <span className={cn('font-display text-lg font-bold tracking-tight', textColor)}>
          Sarkari<span className="text-primary">Setu</span>
        </span>
      )}
    </Link>
  );
}
