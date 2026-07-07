import { useEffect, useMemo, useState } from 'react'
import type { MenuItem, RestaurantMenu } from '../../types'
import { MenuImage } from '../menu/MenuImage'
import { DisplayItemCard } from './DisplayItemCard'
import { formatPrice } from '../../lib/utils'
import { getAverageRating } from '../../lib/reviews'
import { StarRating } from '../menu/StarRating'

export interface LayoutProps {
  menu: RestaurantMenu
  accent: string
  variant: string
  onItemClick: (item: MenuItem) => void
}

function CategoryTabsInline({
  menu,
  accent,
  activeId,
  onSelect,
}: {
  menu: RestaurantMenu
  accent: string
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2">
      {menu.categories.filter((c) => c.active).map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
            activeId === cat.id ? 'text-white' : 'bg-slate-100 text-slate-700'
          }`}
          style={activeId === cat.id ? { backgroundColor: accent } : undefined}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

function ListRow({
  item,
  num,
  accent,
  onClick,
  dark,
}: {
  item: MenuItem
  num: number
  accent: string
  onClick: () => void
  dark?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
        dark ? 'hover:bg-white/10' : 'hover:bg-orange-50'
      }`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
        style={{ backgroundColor: dark ? '#334155' : accent }}
      >
        {num}
      </span>
      <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover bg-slate-200" />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-bold ${dark ? 'text-white' : 'text-slate-900'} ${!item.available ? 'opacity-50' : ''}`}>
          {item.name}
        </p>
        <p className="text-sm font-semibold text-orange-500">{formatPrice(item.priceCents)}</p>
      </div>
    </button>
  )
}

export function GridLayout({ menu, accent, variant, onItemClick }: LayoutProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    menu.categories.find((c) => c.active)?.id ?? '',
  )
  const items = menu.items.filter((i) => i.categoryId === activeCategoryId)
  const isCompact = variant === 'compact'
  const cols = isCompact
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CategoryTabsInline menu={menu} accent={accent} activeId={activeCategoryId} onSelect={setActiveCategoryId} />
      <div className={`grid flex-1 gap-3 overflow-y-auto p-4 ${cols} ${isCompact ? 'auto-rows-min content-start' : 'auto-rows-fr'}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex ${isCompact ? 'min-h-0' : 'min-h-[320px]'} ${variant === 'spotlight' && item.featured ? 'sm:col-span-2' : ''}`}
          >
            <DisplayItemCard
              item={item}
              reviews={menu.reviews}
              accent={accent}
              onClick={() => onItemClick(item)}
              variant={isCompact ? 'mini' : 'grid'}
              showNutrition={variant === 'uniform'}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ComboBoardLayout({ menu, accent, variant, onItemClick }: LayoutProps) {
  const burgers = menu.items.filter((i) => i.categoryId === 'cat-burgers')
  const chicken = menu.items.filter((i) => i.categoryId === 'cat-chicken')
  const sides = menu.items.filter((i) => i.categoryId === 'cat-sides')
  const drinks = menu.items.filter((i) => i.categoryId === 'cat-drinks')
  const featured = useMemo(() => menu.items.filter((i) => i.featured), [menu.items])
  const [heroIndex, setHeroIndex] = useState(0)
  const hero = featured[heroIndex] ?? menu.items[0]
  const dark = variant === 'dark'

  useEffect(() => {
    if (variant !== 'wide' || featured.length <= 1) return
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % featured.length), 8000)
    return () => clearInterval(timer)
  }, [variant, featured.length])

  if (variant === 'wide') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
        <div className="relative h-[min(40vh,340px)] shrink-0 border-b border-white/10">
          {hero && (
            <DisplayItemCard item={hero} reviews={menu.reviews} accent={accent} onClick={() => onItemClick(hero)} variant="hero" />
          )}
          {featured.length > 1 && (
            <>
              <SlideDots count={featured.length} index={heroIndex} onSelect={setHeroIndex} />
              <div className="absolute bottom-16 right-4 flex gap-2">
                {featured.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition ${i === heroIndex ? 'border-orange-500' : 'border-white/30 opacity-70'}`}
                  >
                    <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-4">
          <div className="border-r border-white/10 p-3 lg:col-span-1">
            <SectionHeader title="Burgers" accent={accent} dark />
            {burgers.map((item, i) => (
              <TextListRow key={item.id} item={item} num={i + 1} onClick={() => onItemClick(item)} />
            ))}
          </div>
          <div className="border-r border-white/10 p-3 lg:col-span-1">
            <SectionHeader title="Chicken" accent={accent} dark />
            {chicken.map((item, i) => (
              <TextListRow key={item.id} item={item} num={burgers.length + i + 1} onClick={() => onItemClick(item)} />
            ))}
          </div>
          <div className="border-r border-white/10 p-3 lg:col-span-1">
            <SectionHeader title="Sides" accent={accent} dark />
            {sides.map((item, i) => (
              <TextListRow key={item.id} item={item} num={burgers.length + chicken.length + i + 1} onClick={() => onItemClick(item)} />
            ))}
          </div>
          <div className="p-3 lg:col-span-1">
            <SectionHeader title="Drinks" accent={accent} dark />
            {drinks.map((item, i) => (
              <TextListRow key={item.id} item={item} num={burgers.length + chicken.length + sides.length + i + 1} onClick={() => onItemClick(item)} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const centerSpan = 'lg:col-span-5'

  return (
    <div className={`grid flex-1 grid-cols-1 lg:grid-cols-12 ${dark ? 'bg-slate-900' : ''}`}>
      <div className={`border-r p-3 lg:col-span-3 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <SectionHeader title="Combos & Burgers" accent={accent} dark={dark} />
        {burgers.map((item, i) => (
          <ListRow key={item.id} item={item} num={i + 1} accent={accent} onClick={() => onItemClick(item)} dark={dark} />
        ))}
        <SectionHeader title="Chicken" accent={accent} dark={dark} className="mt-4" />
        {chicken.map((item, i) => (
          <ListRow key={item.id} item={item} num={burgers.length + i + 1} accent={accent} onClick={() => onItemClick(item)} dark={dark} />
        ))}
      </div>

      <div className={`flex flex-col gap-2 p-3 ${centerSpan} ${dark ? 'bg-black' : 'bg-slate-900'}`}>
        {featured.slice(0, 3).map((item) => (
          <div key={item.id} className="h-[min(28vh,220px)] min-h-[160px] flex-1 overflow-hidden rounded-2xl">
            <DisplayItemCard item={item} reviews={menu.reviews} accent={accent} onClick={() => onItemClick(item)} variant="hero" />
          </div>
        ))}
      </div>

      <div className={`border-l p-3 lg:col-span-3 ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <PanelList title="Sides" items={sides} accent={accent} onItemClick={onItemClick} startNum={burgers.length + chicken.length + 1} dark={dark} />
        <PanelList title="Drinks" items={drinks} accent={accent} onItemClick={onItemClick} startNum={burgers.length + chicken.length + sides.length + 1} dark={dark} />
      </div>
    </div>
  )
}

function TextListRow({ item, num, onClick }: { item: MenuItem; num: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-baseline gap-2 border-b border-white/5 py-2 text-left text-sm hover:bg-white/5"
    >
      <span className="w-6 shrink-0 font-black text-orange-400">{num}</span>
      <span className={`min-w-0 flex-1 font-medium text-white ${!item.available ? 'opacity-40 line-through' : ''}`}>{item.name}</span>
      <span className="shrink-0 font-bold text-orange-400">{formatPrice(item.priceCents)}</span>
    </button>
  )
}

function SectionHeader({ title, accent, dark, className }: { title: string; accent: string; dark?: boolean; className?: string }) {
  return (
    <h2
      className={`mb-2 rounded-lg px-3 py-2 text-center text-sm font-black uppercase text-white ${className ?? ''}`}
      style={{ backgroundColor: dark ? '#ea580c' : accent }}
    >
      {title}
    </h2>
  )
}

function PanelList({
  title,
  items,
  accent,
  onItemClick,
  startNum,
  dark,
}: {
  title: string
  items: MenuItem[]
  accent: string
  onItemClick: (item: MenuItem) => void
  startNum: number
  dark?: boolean
}) {
  return (
    <>
      <SectionHeader title={title} accent={accent} dark={dark} />
      <ul className="mb-4 space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onItemClick(item)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                dark ? 'text-slate-200 hover:bg-white/10' : 'hover:bg-slate-50'
              }`}
            >
              <span className={`font-medium ${!item.available ? 'opacity-50 line-through' : ''}`}>
                <span className="mr-2 font-black text-orange-500">{startNum + i}.</span>
                {item.name}
              </span>
              <span className="shrink-0 font-bold text-orange-500">{formatPrice(item.priceCents)}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export function HeroSlideshowLayout({ menu, accent, variant, onItemClick }: LayoutProps) {
  const featured = useMemo(() => menu.items.filter((i) => i.featured), [menu.items])
  const [slideIndex, setSlideIndex] = useState(0)
  const hero = featured[slideIndex] ?? menu.items[0]

  useEffect(() => {
    if (featured.length <= 1) return
    const timer = setInterval(() => setSlideIndex((i) => (i + 1) % featured.length), 8000)
    return () => clearInterval(timer)
  }, [featured.length])

  const menuList = (
    <div className="flex-1 overflow-y-auto bg-white p-4">
      {menu.categories.filter((c) => c.active).map((cat) => (
        <div key={cat.id} className="mb-4">
          <h3 className="mb-2 border-b-2 pb-1 text-lg font-black uppercase" style={{ borderColor: accent, color: accent }}>
            {cat.name}
          </h3>
          <div className="space-y-1">
            {menu.items.filter((i) => i.categoryId === cat.id).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick(item)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-2 text-left hover:border-orange-200 hover:bg-orange-50"
              >
                <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{item.name}</p>
                  <p className="truncate text-xs text-slate-500">{item.description}</p>
                </div>
                <span className="shrink-0 font-black text-orange-600">{formatPrice(item.priceCents)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (variant === 'banner') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="relative h-[min(32vh,280px)] shrink-0">
          {hero && <DisplayItemCard item={hero} reviews={menu.reviews} accent={accent} onClick={() => onItemClick(hero)} variant="hero" />}
          {featured.length > 1 && <SlideDots count={featured.length} index={slideIndex} onSelect={setSlideIndex} />}
        </div>
        {menuList}
      </div>
    )
  }

  if (variant === 'stacked') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Featured picks</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {featured.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSlideIndex(i)}
                className={`flex w-32 shrink-0 flex-col overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition ${
                  slideIndex === i ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200 hover:border-orange-300'
                }`}
              >
                <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                <span className="truncate px-2 py-1.5 text-xs font-bold text-slate-900">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative h-[min(30vh,260px)] shrink-0 overflow-hidden">
          {hero && (
            <DisplayItemCard item={hero} reviews={menu.reviews} accent={accent} onClick={() => onItemClick(hero)} variant="hero" />
          )}
        </div>
        {menuList}
      </div>
    )
  }

  return (
    <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
      <div className="relative max-h-[min(34vh,300px)] min-h-[200px] overflow-hidden lg:col-span-5 lg:max-h-none lg:min-h-0">
        {hero && <DisplayItemCard item={hero} reviews={menu.reviews} accent={accent} onClick={() => onItemClick(hero)} variant="hero" />}
        {featured.length > 1 && <SlideDots count={featured.length} index={slideIndex} onSelect={setSlideIndex} />}
      </div>
      <div className="min-h-0 lg:col-span-7">{menuList}</div>
    </div>
  )
}

function SlideDots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  return (
    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-orange-500' : 'w-2 bg-white/60'}`}
        />
      ))}
    </div>
  )
}

export function NumberedListLayout({ menu, accent, variant, onItemClick }: LayoutProps) {
  const chalk = variant === 'chalkboard'
  const twoCol = variant === 'columns'

  const sections = menu.categories.filter((c) => c.active).map((cat) => ({
    cat,
    items: menu.items.filter((i) => i.categoryId === cat.id),
  }))

  let num = 1

  if (chalk) {
    return (
      <div className="chalkboard-bg flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          <p className="chalk-text mb-6 text-center font-serif text-2xl italic">Today&apos;s Menu</p>
          {sections.map(({ cat, items }) => {
            const start = num
            num += items.length
            return (
              <section key={cat.id} className="mb-8">
                <h2 className="chalk-heading mb-4 border-b-2 border-dashed border-white/20 pb-2 font-serif text-xl italic">
                  {cat.name}
                </h2>
                <ul className="space-y-3">
                  {items.map((item, i) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onItemClick(item)}
                        className="chalk-row group flex w-full items-center gap-3 text-left"
                      >
                        <span className="chalk-num font-serif text-lg">{start + i}</span>
                        <span className={`chalk-text min-w-0 flex-1 font-serif text-lg ${!item.available ? 'opacity-40 line-through' : ''}`}>
                          {item.name}
                        </span>
                        <span className="chalk-dots hidden flex-1 border-b border-dotted border-white/30 sm:block" />
                        <span className="chalk-price font-serif text-lg font-bold">{formatPrice(item.priceCents)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 overflow-y-auto p-4 ${chalk ? 'bg-slate-900' : 'bg-amber-50'}`}>
      <div className={`mx-auto ${twoCol ? 'max-w-6xl grid gap-6 lg:grid-cols-2' : 'max-w-3xl'}`}>
        {sections.map(({ cat, items }) => {
          const start = num
          num += items.length
          return (
            <section key={cat.id} className="mb-4">
              <h2
                className={`mb-3 inline-block rounded-r-full px-5 py-2 text-xl font-black uppercase shadow-md ${
                  chalk ? 'bg-yellow-400 text-slate-900' : 'text-white'
                }`}
                style={chalk ? undefined : { backgroundColor: accent }}
              >
                {cat.name}
              </h2>
              <div className={`rounded-2xl border-2 p-3 ${chalk ? 'border-yellow-500/30 bg-slate-800' : 'border-amber-200 bg-white'}`}>
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onItemClick(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${
                      chalk ? 'hover:bg-white/5' : 'hover:bg-amber-50'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${chalk ? 'bg-yellow-400 text-slate-900' : 'bg-slate-900 text-white'}`}>
                      {start + i}
                    </span>
                    <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold ${chalk ? 'text-white' : 'text-slate-900'} ${!item.available ? 'opacity-50' : ''}`}>{item.name}</p>
                      {!item.available && <span className="text-xs font-bold text-red-400">SOLD OUT</span>}
                    </div>
                    <span className="text-xl font-black text-orange-500">{formatPrice(item.priceCents)}</span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export function PremiumDetailLayout({ menu, variant, onItemClick }: LayoutProps) {
  const [highlight, setHighlight] = useState(menu.items.find((i) => i.featured) ?? menu.items[0])
  const avg = highlight ? getAverageRating(menu.reviews, highlight.id) : null

  const sidebar = (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Full menu</h3>
      <div className="space-y-1">
        {menu.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setHighlight(item)
              onItemClick(item)
            }}
            className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition ${
              highlight?.id === item.id ? 'bg-orange-500/20 ring-1 ring-orange-500' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <MenuImage itemId={item.id} src={item.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover bg-slate-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{item.name}</p>
              <p className="text-xs font-semibold text-orange-400">{formatPrice(item.priceCents)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const heroBlock = highlight && (
    <div className="relative h-full overflow-hidden">
      <MenuImage itemId={highlight.id} src={highlight.imageUrl} alt={highlight.name} className="h-full w-full object-cover animate-ken-burns" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Chef&apos;s pick</p>
        <h2 className="mt-1 text-2xl font-black text-white lg:text-3xl">{highlight.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-white/80">{highlight.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-black text-orange-400">{formatPrice(highlight.priceCents)}</span>
          {avg !== null && <StarRating value={avg} showValue size="md" />}
        </div>
        {highlight.nutrition && variant === 'split' && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/70">
            {highlight.nutrition.calories != null && <span>{highlight.nutrition.calories} cal</span>}
            {highlight.nutrition.proteinG != null && <span>{highlight.nutrition.proteinG}g protein</span>}
            {highlight.nutrition.allergens && highlight.nutrition.allergens.length > 0 && (
              <span>Allergens: {highlight.nutrition.allergens.join(', ')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (variant === 'strip') {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
        <div className="relative h-[min(26vh,200px)] shrink-0 border-b border-white/10">{heroBlock}</div>
        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/10 px-3 py-2">
          {menu.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setHighlight(item)
                onItemClick(item)
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                highlight?.id === item.id ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {menu.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setHighlight(item)
                onItemClick(item)
              }}
              className={`flex flex-col overflow-hidden rounded-xl text-left transition ${
                highlight?.id === item.id ? 'ring-2 ring-orange-500' : 'hover:ring-1 hover:ring-white/20'
              }`}
            >
              <MenuImage itemId={item.id} src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full object-cover bg-slate-800" />
              <div className="bg-slate-900 p-2">
                <p className="truncate text-xs font-bold text-white">{item.name}</p>
                <p className="text-xs font-semibold text-orange-400">{formatPrice(item.priceCents)}</p>
                {item.nutrition?.calories && <p className="text-[10px] text-slate-500">{item.nutrition.calories} cal</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    const others = menu.items.filter((i) => i.id !== highlight?.id)
    return (
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto bg-slate-950 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {highlight && (
          <button
            type="button"
            onClick={() => onItemClick(highlight)}
            className="col-span-2 row-span-2 overflow-hidden rounded-xl ring-2 ring-orange-500"
          >
            <div className="relative h-full min-h-[220px]">
              <MenuImage itemId={highlight.id} src={highlight.imageUrl} alt={highlight.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-3">
                <p className="text-xs font-bold uppercase text-orange-400">Featured</p>
                <p className="font-bold text-white">{highlight.name}</p>
                <p className="text-lg font-black text-orange-400">{formatPrice(highlight.priceCents)}</p>
              </div>
            </div>
          </button>
        )}
        {others.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setHighlight(item)
              onItemClick(item)
            }}
            className={`overflow-hidden rounded-xl text-left transition ${
              highlight?.id === item.id ? 'ring-2 ring-orange-500' : 'hover:ring-1 hover:ring-white/20'
            }`}
          >
            <MenuImage itemId={item.id} src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover bg-slate-800" />
            <div className="bg-slate-900 p-2">
              <p className="truncate text-xs font-bold text-white">{item.name}</p>
              <p className="text-xs text-orange-400">{formatPrice(item.priceCents)}</p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid flex-1 grid-cols-1 overflow-hidden bg-slate-950 lg:grid-cols-5">
      <div className="relative min-h-[240px] lg:col-span-3 lg:min-h-0">{heroBlock}</div>
      {sidebar}
    </div>
  )
}
