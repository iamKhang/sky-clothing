"use client";

import { Button } from "@/components/ui/button";
import { colorMapping } from "@/utils/colorMapping";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  price: number;
  discount?: number;
  imgMain: string;
  imgSub: string;
  colors: string[];
}

export function ProductCard({
  name,
  price,
  discount,
  imgMain,
  imgSub,
  colors,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const discountedPrice = discount ? price * (1 - discount / 100) : price;

  return (
    <div
      className="group relative cursor-pointer"
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
          <Button className="flex-1 rounded-none h-12 bg-black hover:bg-black/90 text-xs sm:text-sm md:text-base">
            MUA NGAY
          </Button>
          <Button className="flex-1 rounded-none h-12 bg-black hover:bg-black/90 text-xs sm:text-sm md:text-base">
            THÊM VÀO GIỎ
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mt-2 justify-center">
        {colors.map((color) => (
          <div
            key={color}
            className="w-4 h-4 rounded-full border border-gray-200"
            style={{ backgroundColor: colorMapping[color] }}
            title={color}
          />
        ))}
      </div>
      <div className="mt-4 text-xs sm:text-sm md:text-base">
        <h3 className="font-medium truncate">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-bold py-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(discountedPrice)}
          </span>
          {discount && (
            <span className="text-muted-foreground line-through py-1">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(price)}
            </span>
          )}
          {discount && (
            <span className="bg-black text-white px-2 py-1 text-xs sm:text-sm md:text-base">
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
