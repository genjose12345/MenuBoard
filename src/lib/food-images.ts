/** Reliable food image URLs + fallbacks when Unsplash blocks on corporate networks */
export const FOOD_IMAGES = {
  logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200&q=80',
  classicBurger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80',
  baconBurger: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&h=600&q=80',
  veggieBurger: 'https://images.unsplash.com/photo-1572802415324-df79170c8e90?auto=format&fit=crop&w=800&h=600&q=80',
  chickenSandwich: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&h=600&q=80',
  chickenTenders: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7448?auto=format&fit=crop&w=800&h=600&q=80',
  nuggets: 'https://images.unsplash.com/photo-1562967910-60882a65945d?auto=format&fit=crop&w=800&h=600&q=80',
  fries: 'https://images.unsplash.com/photo-1573080496216-bf89696d472f?auto=format&fit=crop&w=800&h=600&q=80',
  onionRings: 'https://images.unsplash.com/photo-1630384086601-768efa027a2a?auto=format&fit=crop&w=800&h=600&q=80',
  shake: 'https://images.unsplash.com/photo-1572490122748-596534b17284?auto=format&fit=crop&w=800&h=600&q=80',
  soda: 'https://images.unsplash.com/photo-1581636629482-a5cf44884a80?auto=format&fit=crop&w=800&h=600&q=80',
  lemonade: 'https://images.unsplash.com/photo-1523673565545-6d7858262549?auto=format&fit=crop&w=800&h=600&q=80',
  combo: 'https://images.unsplash.com/photo-1594212699903-ec524a9e12ab?auto=format&fit=crop&w=800&h=600&q=80',
  fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=300&q=80',
} as const

export const ITEM_IMAGE_MAP: Record<string, string> = {
  'item-classic': FOOD_IMAGES.classicBurger,
  'item-bacon': FOOD_IMAGES.baconBurger,
  'item-veggie': FOOD_IMAGES.veggieBurger,
  'item-crispy': FOOD_IMAGES.chickenSandwich,
  'item-tenders': FOOD_IMAGES.chickenTenders,
  'item-nuggets': FOOD_IMAGES.nuggets,
  'item-fries': FOOD_IMAGES.fries,
  'item-rings': FOOD_IMAGES.onionRings,
  'item-shake': FOOD_IMAGES.shake,
  'item-soda': FOOD_IMAGES.soda,
  'item-lemonade': FOOD_IMAGES.lemonade,
  'item-combo': FOOD_IMAGES.combo,
  'taco-carne': 'https://images.unsplash.com/photo-1565299585323-38174c8daaef?auto=format&fit=crop&w=800&h=600&q=80',
  'taco-al-pastor': 'https://images.unsplash.com/photo-1599974579688-8dbddb0aaff4?auto=format&fit=crop&w=800&h=600&q=80',
  'taco-chicken': 'https://images.unsplash.com/photo-1624305820584-762254366e79?auto=format&fit=crop&w=800&h=600&q=80',
  'taco-veggie': 'https://images.unsplash.com/photo-1551506327-0c011dc11351?auto=format&fit=crop&w=800&h=600&q=80',
  'taco-chips': 'https://images.unsplash.com/photo-1513456852971-3ac41d588a55?auto=format&fit=crop&w=800&h=600&q=80',
  'taco-rice': 'https://images.unsplash.com/photo-1512058564366-18510ef2d12c?auto=format&fit=crop&w=800&h=600&q=80',
}

export function resolveFoodImage(itemId: string, imageUrl: string): string {
  return ITEM_IMAGE_MAP[itemId] ?? imageUrl
}
