import { isSupabaseConfigured } from '../supabase/client'
import * as localApi from './local'
import * as supabaseApi from './supabase'

const api = isSupabaseConfigured() ? supabaseApi : localApi

export const getRestaurants = api.getRestaurants
export const getRestaurantBySlug = api.getRestaurantBySlug
export const getRestaurantById = api.getRestaurantById
export const getRestaurantMenu = api.getRestaurantMenu
export const createRestaurant = api.createRestaurant
export const updateRestaurant = api.updateRestaurant
export const upsertCategory = api.upsertCategory
export const deleteCategory = api.deleteCategory
export const upsertMenuItem = api.upsertMenuItem
export const deleteMenuItem = api.deleteMenuItem
export const createCategory = api.createCategory
export const createMenuItem = api.createMenuItem
export const submitReview = api.submitReview
export const moderateReview = api.moderateReview
export const getReviewsByRestaurant = api.getReviewsByRestaurant
export const getUserRestaurantId = api.getUserRestaurantId
export const linkRestaurantToUser = api.linkRestaurantToUser

export { isSupabaseConfigured }
