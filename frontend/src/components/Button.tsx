import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className, children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        'button',
        {
          'button--primary': variant === 'primary',
          'button--secondary': variant === 'secondary',
          'button--ghost': variant === 'ghost',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
