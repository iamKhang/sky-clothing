"use client";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { Product } from "@/types/product";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, use } from "react";

export default function ProductDetail({
  params,
}: {
  params: { productId: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { user } = useUserStore();
  const router = useRouter();

  const unwrappedParams = React.use(params);
  const productId = unwrappedParams.productId;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/products/${productId}`
        );
        const data = await response.json();
        setProduct(data);

        // Set default color and size if available
        if (data.variants.length > 0) {
          setSelectedColor(data.variants[0].color);
          setSelectedSize(data.variants[0].size);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId]); // Dependency: productId

  if (!product) return <div>Loading...</div>;

  // Get unique colors and sizes và sắp xếp chúng
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => v.color))
  ).sort((a, b) => a.localeCompare(b)); // Sắp xếp màu theo alphabet

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']; // Định nghĩa thứ tự size
  const uniqueSizes = Array.from(
    new Set(product.variants.map((v) => v.size))
  ).sort((a, b) => {
    return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
  });

  // Get current variant
  const currentVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Add to cart logic here
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Buy now logic here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Images */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <Image
              src={product.mainImageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {product.variants
              .filter((v) => v.color === selectedColor)
              .map((variant, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={variant.productImages[0]}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover cursor-pointer"
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
              {currentVariant?.discountPercentage > 0 && (
                <span className="bg-black text-white px-2 py-1">
                  -{currentVariant.discountPercentage}%
                </span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="font-medium mb-2">Màu sắc</h3>
            <div className="flex gap-2">
              {uniqueColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "border-black" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Kích thước</h3>
              <button className="text-sm underline">Bảng size</button>
            </div>
            <div className="flex gap-2">
              {uniqueSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-medium mb-2">Số lượng</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 border border-gray-200 flex items-center justify-center"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 border border-gray-200 flex items-center justify-center"
              >
                +
              </button>
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

          {/* Product Description */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-2">Thông tin sản phẩm</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}