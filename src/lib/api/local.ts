import type {
  CreateRestaurantInput,
  ItemReview,
  MenuCategory,
  MenuItem,
  Restaurant,
  RestaurantMenu,
  SubmitReviewInput,
} from '../../types'

const API_BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed: ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export async function getRestaurants(): Promise<Restaurant[]> {
  return request<Restaurant[]>('/restaurants')
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const rows = await request<Restaurant[]>(`/restaurants?slug=${encodeURIComponent(slug)}`)
  return rows[0] ?? null
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    return await request<Restaurant>(`/restaurants/${id}`)
  } catch {
    return null
  }
}

export async function getRestaurantMenu(slug: string): Promise<RestaurantMenu | null> {
  const restaurant = await getRestaurantBySlug(slug)
  if (!restaurant) return null

  const [categories, items, reviews] = await Promise.all([
    request<MenuCategory[]>(`/menu_categories?restaurantId=${encodeURIComponent(restaurant.id)}`),
    request<MenuItem[]>(`/menu_items?restaurantId=${encodeURIComponent(restaurant.id)}`),
    request<ItemReview[]>(`/item_reviews?restaurantId=${encodeURIComponent(restaurant.id)}`),
  ])

  return {
    restaurant,
    categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
    reviews,
  }
}

export async function createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
  const existing = await getRestaurantBySlug(input.slug)
  if (existing) throw new Error('That menu URL is already taken.')

  const restaurant: Restaurant = {
    id: input.slug,
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    phone: input.phone,
    branding: { primaryColor: '#ea580c', displayLayout: 'grid' },
    plan: input.plan ?? 'starter',
    createdAt: new Date().toISOString(),
  }

  return request<Restaurant>('/restaurants', {
    method: 'POST',
    body: JSON.stringify(restaurant),
  })
}

export async function updateRestaurant(restaurant: Restaurant): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/${restaurant.id}`, {
    method: 'PUT',
    body: JSON.stringify(restaurant),
  })
}

export async function upsertCategory(category: MenuCategory): Promise<MenuCategory> {
  try {
    await request<MenuCategory>(`/menu_categories/${category.id}`)
    return request<MenuCategory>(`/menu_categories/${category.id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    })
  } catch {
    return request<MenuCategory>('/menu_categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await request<void>(`/menu_categories/${id}`, { method: 'DELETE' })
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  try {
    await request<MenuItem>(`/menu_items/${item.id}`)
    return request<MenuItem>(`/menu_items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    })
  } catch {
    return request<MenuItem>('/menu_items', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  await request<void>(`/menu_items/${id}`, { method: 'DELETE' })
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
  return request<MenuCategory>('/menu_categories', {
    method: 'POST',
    body: JSON.stringify(category),
  })
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
  return request<MenuItem>('/menu_items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
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
  return request<ItemReview>('/item_reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  })
}

export async function moderateReview(
  id: string,
  status: 'approved' | 'rejected',
): Promise<ItemReview> {
  return request<ItemReview>(`/item_reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function getReviewsByRestaurant(restaurantId: string): Promise<ItemReview[]> {
  return request<ItemReview[]>(`/item_reviews?restaurantId=${encodeURIComponent(restaurantId)}`)
}

export async function linkRestaurantToUser(): Promise<void> {
  // No-op for local API
}

export async function getUserRestaurantId(): Promise<string | null> {
  return null
}
