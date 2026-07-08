import { useState } from 'react'
import type { MenuCategory, MenuItem, NutritionFacts, Restaurant } from '../../types'
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  upsertCategory,
  upsertMenuItem,
} from '../../lib/api'
import { formatPrice } from '../../lib/utils'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

interface MenuEditorProps {
  restaurant: Restaurant
  categories: MenuCategory[]
  items: MenuItem[]
  onUpdated: () => void
  readOnly?: boolean
}

const emptyNutrition: NutritionFacts = {
  servingSize: '',
  calories: undefined,
  proteinG: undefined,
  carbsG: undefined,
  fatG: undefined,
  sodiumMg: undefined,
  allergens: [],
}

export function MenuEditor({ restaurant, categories, items, onUpdated, readOnly = false }: MenuEditorProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const [draft, setDraft] = useState<Partial<MenuItem> & { allergensText?: string }>({})

  function startEdit(item: MenuItem) {
    setEditingItemId(item.id)
    setDraft({
      ...item,
      allergensText: item.nutrition?.allergens?.join(', ') ?? '',
    })
  }

  function startNewItem(categoryId: string) {
    setEditingItemId('new')
    setDraft({
      categoryId,
      name: '',
      description: '',
      priceCents: 899,
      imageUrl: 'https://picsum.photos/seed/new-item/600/400',
      available: true,
      featured: false,
      nutrition: { ...emptyNutrition },
      allergensText: '',
    })
  }

  async function handleSaveItem() {
    if (!draft.name?.trim() || !draft.categoryId) return
    const nutrition: NutritionFacts = {
      servingSize: draft.nutrition?.servingSize,
      calories: draft.nutrition?.calories ? Number(draft.nutrition.calories) : undefined,
      proteinG: draft.nutrition?.proteinG ? Number(draft.nutrition.proteinG) : undefined,
      carbsG: draft.nutrition?.carbsG ? Number(draft.nutrition.carbsG) : undefined,
      fatG: draft.nutrition?.fatG ? Number(draft.nutrition.fatG) : undefined,
      sodiumMg: draft.nutrition?.sodiumMg ? Number(draft.nutrition.sodiumMg) : undefined,
      allergens: draft.allergensText
        ? draft.allergensText.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
    }

    if (editingItemId === 'new') {
      const catItems = items.filter((i) => i.categoryId === draft.categoryId)
      await createMenuItem(restaurant.id, draft.categoryId, {
        name: draft.name.trim(),
        description: draft.description?.trim() ?? '',
        priceCents: Number(draft.priceCents) || 0,
        imageUrl: draft.imageUrl?.trim() ?? '',
        available: draft.available ?? true,
        featured: draft.featured ?? false,
        nutrition,
        sortOrder: catItems.length,
      })
      setMessage('Item added.')
    } else if (editingItemId) {
      const existing = items.find((i) => i.id === editingItemId)
      if (!existing) return
      await upsertMenuItem({
        ...existing,
        name: draft.name.trim(),
        description: draft.description?.trim() ?? '',
        priceCents: Number(draft.priceCents) || 0,
        imageUrl: draft.imageUrl?.trim() ?? '',
        available: draft.available ?? true,
        featured: draft.featured ?? false,
        nutrition,
      })
      setMessage('Item saved.')
    }
    setEditingItemId(null)
    setDraft({})
    onUpdated()
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    await createCategory(restaurant.id, newCategoryName.trim(), categories.length)
    setNewCategoryName('')
    setMessage('Category added.')
    onUpdated()
  }

  async function moveCategory(cat: MenuCategory, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex((c) => c.id === cat.id)
    const swap = sorted[idx + direction]
    if (!swap) return
    await Promise.all([
      upsertCategory({ ...cat, sortOrder: swap.sortOrder }),
      upsertCategory({ ...swap, sortOrder: cat.sortOrder }),
    ])
    onUpdated()
  }

  return (
    <div className="space-y-6">
      {message && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">{message}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!readOnly && (
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
            />
            <Button type="button" onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          )}
          <ul className="space-y-2">
            {[...categories]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((cat) => (
                <li
                  key={cat.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="font-medium">{cat.name}</span>
                  {!readOnly && (
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => moveCategory(cat, -1)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => moveCategory(cat, 1)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await deleteCategory(cat.id)
                        onUpdated()
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  )}
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      {[...categories]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cat) => {
          const catItems = items.filter((i) => i.categoryId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder)
          return (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{cat.name}</CardTitle>
                {!readOnly && (
                <Button type="button" size="sm" variant="outline" onClick={() => startNewItem(cat.id)}>
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-orange-600">{formatPrice(item.priceCents)}</p>
                        <div className="mt-1 flex gap-1">
                          {!item.available && <Badge variant="danger">Sold out</Badge>}
                          {item.featured && <Badge variant="default">Featured</Badge>}
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await deleteMenuItem(item.id)
                          onUpdated()
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}

      {editingItemId && !readOnly && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle>{editingItemId === 'new' ? 'New item' : 'Edit item'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 md:col-span-2">
              <div>
                <Label>Name</Label>
                <Input value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={draft.description ?? ''}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={((draft.priceCents ?? 0) / 100).toFixed(2)}
                onChange={(e) =>
                  setDraft({ ...draft, priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })
                }
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={draft.imageUrl ?? ''}
                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.available ?? true}
                  onChange={(e) => setDraft({ ...draft, available: e.target.checked })}
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured ?? false}
                  onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                />
                Featured
              </label>
            </div>
            <div className="md:col-span-2">
              <h4 className="mb-2 font-semibold">Nutrition</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label>Serving size</Label>
                  <Input
                    value={draft.nutrition?.servingSize ?? ''}
                    onChange={(e) =>
                      setDraft({ ...draft, nutrition: { ...draft.nutrition, servingSize: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <Label>Calories</Label>
                  <Input
                    type="number"
                    value={draft.nutrition?.calories ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nutrition: { ...draft.nutrition, calories: Number(e.target.value) || undefined },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={draft.nutrition?.proteinG ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nutrition: { ...draft.nutrition, proteinG: Number(e.target.value) || undefined },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={draft.nutrition?.carbsG ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nutrition: { ...draft.nutrition, carbsG: Number(e.target.value) || undefined },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={draft.nutrition?.fatG ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nutrition: { ...draft.nutrition, fatG: Number(e.target.value) || undefined },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Sodium (mg)</Label>
                  <Input
                    type="number"
                    value={draft.nutrition?.sodiumMg ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nutrition: { ...draft.nutrition, sodiumMg: Number(e.target.value) || undefined },
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Allergens (comma-separated)</Label>
                  <Input
                    value={draft.allergensText ?? ''}
                    onChange={(e) => setDraft({ ...draft, allergensText: e.target.value })}
                    placeholder="gluten, dairy, nuts"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="button" onClick={handleSaveItem}>
                Save item
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingItemId(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
