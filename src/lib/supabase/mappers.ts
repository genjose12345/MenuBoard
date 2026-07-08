import type {
  DisplayLayoutId,
  ItemReview,
  MenuCategory,
  MenuItem,
  NutritionFacts,
  PlanTier,
  Restaurant,
  RestaurantBranding,
  ReviewStatus,
  UserProfile,
} from '../../types'

type Json = Record<string, unknown>

function brandingFromDb(value: Json | null): RestaurantBranding {
  const raw = value ?? {}
  return {
    primaryColor: typeof raw.primaryColor === 'string' ? raw.primaryColor : '#ea580c',
    displayLayout:
      typeof raw.displayLayout === 'string' ? (raw.displayLayout as DisplayLayoutId) : 'grid',
  }
}

function brandingToDb(branding: RestaurantBranding): Json {
  return {
    primaryColor: branding.primaryColor,
    displayLayout: branding.displayLayout ?? 'grid',
  }
}

export function restaurantFromDb(row: Json): Restaurant {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: row.tagline ? String(row.tagline) : undefined,
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    branding: brandingFromDb(row.branding as Json | null),
    plan: (row.plan as PlanTier) ?? 'starter',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    isDemo: Boolean(row.is_demo),
  }
}

export function restaurantToDb(restaurant: Restaurant): Json {
  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    tagline: restaurant.tagline ?? null,
    logo_url: restaurant.logoUrl ?? null,
    phone: restaurant.phone ?? null,
    branding: brandingToDb(restaurant.branding),
    plan: restaurant.plan,
    is_demo: restaurant.isDemo ?? false,
    created_at: restaurant.createdAt,
  }
}

export function categoryFromDb(row: Json): MenuCategory {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id),
    name: String(row.name),
    sortOrder: Number(row.sort_order ?? 0),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    active: Boolean(row.active ?? true),
  }
}

export function categoryToDb(category: MenuCategory): Json {
  return {
    id: category.id,
    restaurant_id: category.restaurantId,
    name: category.name,
    sort_order: category.sortOrder,
    image_url: category.imageUrl ?? null,
    active: category.active,
  }
}

export function itemFromDb(row: Json): MenuItem {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id),
    categoryId: String(row.category_id),
    name: String(row.name),
    description: String(row.description ?? ''),
    priceCents: Number(row.price_cents ?? 0),
    imageUrl: String(row.image_url ?? ''),
    available: Boolean(row.available ?? true),
    featured: Boolean(row.featured ?? false),
    sortOrder: Number(row.sort_order ?? 0),
    nutrition: (row.nutrition as NutritionFacts | null) ?? undefined,
  }
}

export function itemToDb(item: MenuItem): Json {
  return {
    id: item.id,
    restaurant_id: item.restaurantId,
    category_id: item.categoryId,
    name: item.name,
    description: item.description,
    price_cents: item.priceCents,
    image_url: item.imageUrl,
    available: item.available,
    featured: item.featured,
    sort_order: item.sortOrder,
    nutrition: item.nutrition ?? null,
  }
}

export function reviewFromDb(row: Json): ItemReview {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id),
    itemId: String(row.item_id),
    customerName: row.customer_name ? String(row.customer_name) : undefined,
    rating: Number(row.rating),
    comment: String(row.comment),
    status: row.status as ReviewStatus,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

export function reviewToDb(review: ItemReview): Json {
  return {
    id: review.id,
    restaurant_id: review.restaurantId,
    item_id: review.itemId,
    customer_name: review.customerName ?? null,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    created_at: review.createdAt,
  }
}

export function profileFromDb(row: Json): UserProfile {
  return {
    id: String(row.id),
    fullName: row.full_name ? String(row.full_name) : null,
    phone: row.phone ? String(row.phone) : null,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

export function profileToDb(profile: Partial<UserProfile> & { id: string }): Json {
  return {
    id: profile.id,
    full_name: profile.fullName ?? null,
    phone: profile.phone ?? null,
    avatar_url: profile.avatarUrl ?? null,
  }
}
