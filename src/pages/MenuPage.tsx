import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { getRestaurantMenu } from '../lib/api'
import type { MenuItem, RestaurantMenu } from '../types'
import { reviewsEnabled } from '../lib/plans'
import { CategoryTabs } from '../components/menu/CategoryTabs'
import { ItemDetailModal } from '../components/menu/ItemDetailModal'
import { MenuItemCard } from '../components/menu/MenuItemCard'

export function MenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const [menu, setMenu] = useState<RestaurantMenu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const load = useCallback(async () => {
    if (!slug) return
    try {
      const data = await getRestaurantMenu(slug)
      if (!data) {
        setError('Menu not found.')
        return
      }
      setMenu(data)
      const firstActive = data.categories.find((c) => c.active)
      setActiveCategoryId((prev) => prev || firstActive?.id || '')
    } catch {
      setError('Could not load menu. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const activeItems = useMemo(() => {
    if (!menu) return []
    return menu.items.filter((i) => i.categoryId === activeCategoryId)
  }, [menu, activeCategoryId])

  const featuredItems = useMemo(() => {
    if (!menu) return []
    return menu.items.filter((i) => i.featured && i.available)
  }, [menu])

  const accent = menu?.restaurant.branding.primaryColor ?? '#ea580c'

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading menu…</div>
  }

  if (error || !menu) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-600">{error ?? 'Menu not found.'}</p>
        <Link to="/" className="text-orange-600 hover:underline">
          Back home
        </Link>
      </div>
    )
  }

  const { restaurant, categories, reviews } = menu

  const showReviews = reviewsEnabled(restaurant.plan)

  return (
    <div className="min-h-screen bg-slate-50" style={{ ['--accent' as string]: accent }}>
      <header className="border-b border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          {restaurant.logoUrl && (
            <img src={restaurant.logoUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{restaurant.name}</h1>
            {restaurant.tagline && <p className="text-sm text-slate-500">{restaurant.tagline}</p>}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/\D/g, '')}`}
                className="mt-1 flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      </header>

      {!showReviews && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          Starter plan — customer reviews available on Pro. Calories shown only.
        </div>
      )}

      {featuredItems.length > 0 && (
        <section className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Featured</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {featuredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm"
                >
                  <img src={item.imageUrl} alt={item.name} className="h-24 w-36 object-cover" />
                  <p className="px-2 py-1 text-sm font-semibold">{item.name}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <CategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
        accent={accent}
      />

      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-6 sm:grid-cols-2">
        {activeItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            reviews={showReviews ? reviews : []}
            accent={accent}
            showReviews={showReviews}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          reviews={showReviews ? reviews : []}
          accent={accent}
          onClose={() => setSelectedItem(null)}
          onReviewSubmitted={() => void load()}
          allowReviews={showReviews}
          fullNutrition={restaurant.plan === 'pro'}
        />
      )}

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Powered by MenuBoard
      </footer>
    </div>
  )
}
