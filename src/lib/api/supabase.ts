import type {
  CreateRestaurantInput,
  ItemReview,
  MenuCategory,
  MenuItem,
  Restaurant,
  RestaurantMenu,
  SubmitReviewInput,
} from '../../types'
import { getSupabase } from '../supabase/client'
import {
  categoryFromDb,
  categoryToDb,
  itemFromDb,
  itemToDb,
  restaurantFromDb,
  restaurantToDb,
  reviewFromDb,
  reviewToDb,
} from '../supabase/mappers'

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function throwIfError(error: { message: string } | null, fallback = 'Database request failed'): void {
  if (error) throw new Error(error.message || fallback)
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await getSupabase().from('restaurants').select('*').order('created_at')
  throwIfError(error)
  return (data ?? []).map((row) => restaurantFromDb(row))
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await getSupabase()
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  throwIfError(error)
  return data ? restaurantFromDb(data) : null
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await getSupabase()
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  throwIfError(error)
  return data ? restaurantFromDb(data) : null
}

export async function getUserRestaurantId(): Promise<string | null> {
  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user) return null

  const { data, error } = await getSupabase()
    .from('restaurant_accounts')
    .select('restaurant_id')
    .eq('user_id', user.id)
    .maybeSingle()
  throwIfError(error)
  return data?.restaurant_id ?? null
}

export async function getRestaurantMenu(slug: string): Promise<RestaurantMenu | null> {
  const restaurant = await getRestaurantBySlug(slug)
  if (!restaurant) return null

  const [categoriesRes, itemsRes, reviewsRes] = await Promise.all([
    getSupabase()
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order'),
    getSupabase()
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order'),
    getSupabase()
      .from('item_reviews')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false }),
  ])

  throwIfError(categoriesRes.error)
  throwIfError(itemsRes.error)
  throwIfError(reviewsRes.error)

  return {
    restaurant,
    categories: (categoriesRes.data ?? []).map((row) => categoryFromDb(row)),
    items: (itemsRes.data ?? []).map((row) => itemFromDb(row)),
    reviews: (reviewsRes.data ?? []).map((row) => reviewFromDb(row)),
  }
}

export async function createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
  const existing = await getRestaurantBySlug(input.slug)
  if (existing) throw new Error('That menu URL is already taken.')

  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user) throw new Error('You must be logged in to create a restaurant.')

  const owned = await getUserRestaurantId()
  if (owned) throw new Error('You already have a restaurant linked to this account.')

  const restaurant: Restaurant = {
    id: input.slug,
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    phone: input.phone,
    branding: { primaryColor: '#ea580c', displayLayout: 'grid' },
    plan: input.plan ?? 'starter',
    createdAt: new Date().toISOString(),
    isDemo: false,
  }

  const { error: restaurantError } = await getSupabase()
    .from('restaurants')
    .insert(restaurantToDb(restaurant))
  throwIfError(restaurantError, 'Could not create restaurant.')

  const { error: accountError } = await getSupabase()
    .from('restaurant_accounts')
    .insert({ user_id: user.id, restaurant_id: restaurant.id })
  if (accountError) {
    await getSupabase().from('restaurants').delete().eq('id', restaurant.id)
    throw new Error(accountError.message || 'Could not link restaurant to your account.')
  }

  return restaurant
}

export async function updateRestaurant(restaurant: Restaurant): Promise<Restaurant> {
  const { data, error } = await getSupabase()
    .from('restaurants')
    .update(restaurantToDb(restaurant))
    .eq('id', restaurant.id)
    .select('*')
    .single()
  throwIfError(error, 'Could not update restaurant.')
  return restaurantFromDb(data)
}

export async function upsertCategory(category: MenuCategory): Promise<MenuCategory> {
  const { data: existing } = await getSupabase()
    .from('menu_categories')
    .select('id')
    .eq('id', category.id)
    .maybeSingle()

  if (existing) {
    const { data, error } = await getSupabase()
      .from('menu_categories')
      .update(categoryToDb(category))
      .eq('id', category.id)
      .select('*')
      .single()
    throwIfError(error)
    return categoryFromDb(data)
  }

  const { data, error } = await getSupabase()
    .from('menu_categories')
    .insert(categoryToDb(category))
    .select('*')
    .single()
  throwIfError(error)
  return categoryFromDb(data)
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase().from('menu_categories').delete().eq('id', id)
  throwIfError(error)
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  const { data: existing } = await getSupabase()
    .from('menu_items')
    .select('id')
    .eq('id', item.id)
    .maybeSingle()

  if (existing) {
    const { data, error } = await getSupabase()
      .from('menu_items')
      .update(itemToDb(item))
      .eq('id', item.id)
      .select('*')
      .single()
    throwIfError(error)
    return itemFromDb(data)
  }

  const { data, error } = await getSupabase()
    .from('menu_items')
    .insert(itemToDb(item))
    .select('*')
    .single()
  throwIfError(error)
  return itemFromDb(data)
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await getSupabase().from('menu_items').delete().eq('id', id)
  throwIfError(error)
}

export async function createCategory(
  restaurantId: string,
  name: string,
  sortOrder: number,
): Promise<MenuCategory> {
  const category: MenuCategory = {
    id: generateId('cat'),
    restaurantId,
    name,
    sortOrder,
    active: true,
  }
  return upsertCategory(category)
}

export async function createMenuItem(
  restaurantId: string,
  categoryId: string,
  partial: Omit<MenuItem, 'id' | 'restaurantId' | 'categoryId' | 'sortOrder'> & { sortOrder?: number },
): Promise<MenuItem> {
  const item: MenuItem = {
    id: generateId('item'),
    restaurantId,
    categoryId,
    sortOrder: partial.sortOrder ?? 0,
    name: partial.name,
    description: partial.description,
    priceCents: partial.priceCents,
    imageUrl: partial.imageUrl,
    available: partial.available,
    featured: partial.featured,
    nutrition: partial.nutrition,
  }
  return upsertMenuItem(item)
}

export async function submitReview(input: SubmitReviewInput): Promise<ItemReview> {
  const review: ItemReview = {
    id: generateId('rev'),
    itemId: input.itemId,
    restaurantId: input.restaurantId,
    customerName: input.customerName?.trim() || undefined,
    rating: input.rating,
    comment: input.comment.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const { data, error } = await getSupabase()
    .from('item_reviews')
    .insert(reviewToDb(review))
    .select('*')
    .single()
  throwIfError(error, 'Could not submit review.')
  return reviewFromDb(data)
}

export async function moderateReview(
  id: string,
  status: 'approved' | 'rejected',
): Promise<ItemReview> {
  const { data, error } = await getSupabase()
    .from('item_reviews')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  throwIfError(error)
  return reviewFromDb(data)
}

export async function getReviewsByRestaurant(restaurantId: string): Promise<ItemReview[]> {
  const { data, error } = await getSupabase()
    .from('item_reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
  throwIfError(error)
  return (data ?? []).map((row) => reviewFromDb(row))
}

export async function linkRestaurantToUser(): Promise<void> {
  // Handled inside createRestaurant for Supabase
}
