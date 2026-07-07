import { useState } from 'react'
import { ITEM_IMAGE_MAP, FOOD_IMAGES } from '../../lib/food-images'
import { cn } from '../../lib/utils'

interface MenuImageProps {
  src: string
  alt: string
  className?: string
  itemId?: string
}

export function MenuImage({ src, alt, className, itemId }: MenuImageProps) {
  const resolved = itemId ? (ITEM_IMAGE_MAP[itemId] ?? src) : src
  const [url, setUrl] = useState(resolved)

  return (
    <img
      src={url}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      onError={() => {
        if (url !== FOOD_IMAGES.fallback) setUrl(FOOD_IMAGES.fallback)
      }}
    />
  )
}
