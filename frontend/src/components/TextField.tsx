import type { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, id, error, className, ...props }: TextFieldProps) {
  const inputId = id ?? props.name
  return (
    <label className={clsx('field', className)} htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input id={inputId} className={clsx('field__input', { 'field__input--error': Boolean(error) })} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}

export default TextField
