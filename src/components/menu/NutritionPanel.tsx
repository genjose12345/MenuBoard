import type { NutritionFacts } from '../../types'
import { Badge } from '../ui/badge'

interface NutritionPanelProps {
  nutrition?: NutritionFacts
}

export function NutritionPanel({ nutrition }: NutritionPanelProps) {
  if (!nutrition) {
    return <p className="text-sm text-slate-500">Nutrition information not available for this item.</p>
  }

  const rows = [
    { label: 'Serving size', value: nutrition.servingSize },
    { label: 'Calories', value: nutrition.calories?.toString() },
    { label: 'Protein', value: nutrition.proteinG != null ? `${nutrition.proteinG}g` : undefined },
    { label: 'Carbs', value: nutrition.carbsG != null ? `${nutrition.carbsG}g` : undefined },
    { label: 'Fat', value: nutrition.fatG != null ? `${nutrition.fatG}g` : undefined },
    { label: 'Sodium', value: nutrition.sodiumMg != null ? `${nutrition.sodiumMg}mg` : undefined },
  ].filter((r) => r.value)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">Nutrition Facts</h4>
      <dl className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between border-b border-slate-200 pb-2 text-sm last:border-0">
            <dt className="text-slate-600">{row.label}</dt>
            <dd className="font-semibold text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      {nutrition.allergens && nutrition.allergens.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Allergens</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {nutrition.allergens.map((a) => (
              <Badge key={a} variant="warning">
                {a}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
