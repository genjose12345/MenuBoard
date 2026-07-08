export const DEMO_RESTAURANT_IDS = new Set(['demo-burger', 'demo-taco'])

export function isDemoRestaurant(id: string): boolean {
  return DEMO_RESTAURANT_IDS.has(id)
}
