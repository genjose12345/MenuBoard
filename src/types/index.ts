export type PlanTier = 'starter' | 'pro'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type DisplayLayoutId =
  | 'grid'
  | 'combo-board'
  | 'hero-slideshow'
  | 'numbered-list'
  | 'premium-detail'

export interface RestaurantBranding {
  primaryColor: string
  displayLayout?: DisplayLayoutId
}

export interface NutritionFacts {
  servingSize?: string
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  sodiumMg?: number
  allergens?: string[]
}

export interface Restaurant {
  id: string
  slug: string
  name: string
  tagline?: string
  logoUrl?: string
  phone?: string
  branding: RestaurantBranding
  plan: PlanTier
  createdAt: string
  isDemo?: boolean
}

export interface MenuCategory {
  id: string
  restaurantId: string
  name: string
  sortOrder: number
  imageUrl?: string
  active: boolean
}

export interface MenuItem {
  id: string
  categoryId: string
  restaurantId: string
  name: string
  description: string
  priceCents: number
  imageUrl: string
  available: boolean
  featured: boolean
  sortOrder: number
  nutrition?: NutritionFacts
}

export interface ItemReview {
  id: string
  itemId: string
  restaurantId: string
  customerName?: string
  rating: number
  comment: string
  status: ReviewStatus
  createdAt: string
}

export interface RestaurantAccount {
  id: string
  userId: string
  restaurantId: string
}

export interface RestaurantMenu {
  restaurant: Restaurant
  categories: MenuCategory[]
  items: MenuItem[]
  reviews: ItemReview[]
}

export interface CreateRestaurantInput {
  name: string
  slug: string
  tagline?: string
  phone?: string
  plan?: PlanTier
}

export interface SubmitReviewInput {
  itemId: string
  restaurantId: string
  customerName?: string
  rating: number
  comment: string
}

export interface UserProfile {
  id: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}
