import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'success' | 'secondary' | 'ghost'

const styles: Record<Variant, string> = {
  primary: 'press bg-lake text-on-lake border-lake-edge hover:brightness-105',
  success: 'press bg-good-fill text-white border-good-edge hover:brightness-105',
  secondary: 'press bg-surface text-ink border-2 border-line border-b-edge hover:bg-sunken',
  ghost: 'text-muted hover:text-ink hover:bg-sunken',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl px-5 text-[17px] font-extrabold tracking-wide disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
