"use client";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { colorMapping } from "@/utils/colorMapping";
import { VariantSelectionModal } from "@/components/VariantSelectionModal";

interface Size {
  sizeId: string;
  sku: string;
  size: string;
  quantity: number;
  soldQuantity: number;
  discountPercentage: number;
  active: boolean;
  newProduct: boolean;
  bestSeller: boolean;
}

interface Color {
  colorId: string;
  color: string;
  productImages: string[];
  sizes: Size[];
}

interface Product {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  status: string;
  sizeChartUrl: string;
  category: string;
  collectionId: string | null;
  colors: Color[];
}

interface ProductDetailClientProps {
  initialProduct: Product;
}

export function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const [product] = useState<Product>(initialProduct);
  const [selectedColor, setSelectedColor] = useState<string>(
    initialProduct.colors[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"buy" | "cart" | null>(null);
  const { user } = useUserStore();
  const router = useRouter();

  const selectedColorData = product.colors.find(c => c.color === selectedColor);
  const currentImages = selectedColorData?.productImages || [product.mainImageUrl];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCurrentImageIndex(0); // Reset image index when color changes
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalAction("cart");
    setIsModalOpen(true);
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalAction("buy");
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Images */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <Image
              src={currentImages[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {currentImages.map((image, index) => (
              <div 
                key={index} 
                className={`relative aspect-square cursor-pointer ${
                  currentImageIndex === index ? 'border-2 border-black' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.price)}
              </span>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="font-medium mb-2">Màu sắc</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.colorId}
                  onClick={() => handleColorSelect(color.color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color.color ? "border-black" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: colorMapping[color.color] || color.color.toLowerCase() }}
                />
              ))}
            </div>
          </div>

          {/* Size Chart */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Bảng size</h3>
              {product.sizeChartUrl && (
                <button 
                  className="text-sm underline"
                  onClick={() => window.open(product.sizeChartUrl, '_blank')}
                >
                  Xem bảng size
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-white text-black border border-black hover:bg-gray-100"
            >
              Thêm vào giỏ
            </Button>
            <Button onClick={handleBuyNow} className="flex-1">
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      <VariantSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={product.productId}
        action={modalAction}
      />
    </div>
  );
} 