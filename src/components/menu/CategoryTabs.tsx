import type { MenuCategory } from '../../types'
import { cn } from '../../lib/utils'

interface CategoryTabsProps {
  categories: MenuCategory[]
  activeId: string
  onSelect: (id: string) => void
  accent?: string
  size?: 'default' | 'large'
}

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  accent = '#ea580c',
  size = 'default',
}: CategoryTabsProps) {
  const activeCategories = categories.filter((c) => c.active)

  return (
    <div
      className={cn(
        'sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur',
        size === 'large' && 'border-b-2',
      )}
    >
      <div
        className={cn(
          'flex gap-2 overflow-x-auto px-4 py-3',
          size === 'large' ? 'justify-center py-4' : '',
        )}
      >
        {activeCategories.map((cat) => {
          const active = cat.id === activeId
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={cn(
                'shrink-0 rounded-full font-semibold transition',
                size === 'large' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm',
                active ? 'text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              )}
              style={active ? { backgroundColor: accent } : undefined}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
