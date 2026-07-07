import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showValue?: boolean
  interactive?: boolean
  onChange?: (value: number) => void
}

export function StarRating({
  value,
  max = 5,
  size = 'sm',
  showValue = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClass =
    size === 'xl' ? 'h-8 w-8' : size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-6 w-6' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const filled = i + 1 <= Math.round(value)
          const props = {
            className: cn(
              sizeClass,
              filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200',
              interactive && 'cursor-pointer transition hover:scale-110',
            ),
            'aria-label': interactive ? `Rate ${i + 1} stars` : undefined,
          }
          if (interactive && onChange) {
            return (
              <button key={i} type="button" onClick={() => onChange(i + 1)} {...props}>
                <Star className={sizeClass} />
              </button>
            )
          }
          return <Star key={i} {...props} />
        })}
      </div>
      {showValue && <span className="text-sm font-medium text-slate-700">{value.toFixed(1)}</span>}
    </div>
  )
}
