'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  name: string
  price: number
  discount?: number
  imgMain: string
  imgSub: string
}

export function ProductCard({ name, price, discount, imgMain, imgSub }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const discountedPrice = discount ? price * (1 - discount / 100) : price

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={isHovered ? imgSub : imgMain}
          alt={name}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 flex gap-4 transform transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
          <Button 
            className="flex-1 rounded-none h-12 bg-black hover:bg-black/90"
          >
            MUA NGAY
          </Button>
          <Button 
            className="flex-1 rounded-none h-12 bg-black hover:bg-black/90"
          >
            THÊM VÀO GIỎ
          </Button>
        </div>
        {discount && (
          <div className="absolute top-2 left-2">
            <span className="bg-black text-white px-2 py-1 text-sm">
              -{discount}%
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-medium text-sm truncate">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(discountedPrice)}
          </span>
          {discount && (
            <span className="text-sm text-muted-foreground line-through">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

