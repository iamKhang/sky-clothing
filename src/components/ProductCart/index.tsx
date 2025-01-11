"use client";

import { Button } from "@/components/ui/button";
import { colorMapping } from "@/utils/colorMapping";
import Image from "next/image";
import { useState } from "react";
import { VariantSelectionModal } from "../VariantSelectionModal"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from '../../store/useUserStore';

interface ProductCardProps {
  name: string;
  price: number;
  discount?: number;
  imgMain: string;
  imgSub: string;
  availableColors: string[];
  productId: string;
}

export function ProductCard({
  name,
  price,
  discount,
  imgMain,
  imgSub,
  availableColors,
  productId,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<"buy" | "cart" | null>(null);
  const router = useRouter();
  const { user } = useUserStore();

  const discountedPrice = discount ? price * (1 - discount / 100) : price;

  const handleAction = (actionType: "buy" | "cart") => {
    if (!user) {
      router.push('/login');
      return;
    }
    setAction(actionType);
    setIsModalOpen(true);
  };

  return (
    <>
      <Link href={`/products/${productId}`} className="block">
        <div
          className="group relative cursor-pointer w-full"
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
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 sm:gap-2 transform transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0">
              <Button 
                className="flex-1 rounded-none h-8 sm:h-10 md:h-12 bg-black hover:bg-black/90 text-[10px] sm:text-sm md:text-base px-1 sm:px-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction("buy");
                }}
              >
                MUA NGAY
              </Button>
              <Button 
                className="flex-1 rounded-none h-8 sm:h-10 md:h-12 bg-black hover:bg-black/90 text-[10px] sm:text-sm md:text-base px-1 sm:px-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction("cart");
                }}
              >
                THÊM VÀO GIỎ
              </Button>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 mt-2 justify-center">
            {availableColors.map((color) => (
              <div
                key={color}
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: colorMapping[color] }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-base">
            <h3 className="font-medium truncate">{name}</h3>
            <div className="flex items-center flex-wrap gap-1 sm:gap-2">
              <span className="font-bold py-1">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(discountedPrice)}
              </span>
              {discount && (
                <span className="text-muted-foreground line-through py-1 text-xs sm:text-sm">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(price)}
                </span>
              )}
              {discount && (
                <span className="bg-black text-white px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-sm">
                  -{discount}%
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <VariantSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        action={action}
      />
    </>
  );
}
