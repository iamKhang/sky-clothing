'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUserStore } from '../../store/useUserStore';
import { useCartStore } from '../../store/useCartStore';
import Image from 'next/image';
import { colorMapping } from "@/utils/colorMapping";

interface Variant {
  variantId: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
  productName: string;
}

interface ProductDetails {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  status: string | null;
  description: string;
  sizeChartUrl: string;
  category: string;
  collectionId: string | null;
  variants: Variant[];
}

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  action: "buy" | "cart" | null;
}

export function VariantSelectionModal({ isOpen, onClose, productId, action }: VariantSelectionModalProps) {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
      // Reset states when modal opens
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [isOpen, productId]);

  // Cập nhật ảnh khi chọn màu
  useEffect(() => {
    if (selectedColor && productDetails) {
      const variantWithColor = productDetails.variants.find(v => v.color === selectedColor);
      if (variantWithColor && variantWithColor.productImages.length > 0) {
        setCurrentImage(variantWithColor.productImages[0]);
      }
    }
  }, [selectedColor, productDetails]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ProductDetails = await response.json();
      setProductDetails(data);

      // Tự động chọn màu đầu tiên nếu có
      if (data.variants.length > 0) {
        const firstColor = data.variants[0].color;
        setSelectedColor(firstColor);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleSubmit = async () => {
    const { user } = useUserStore.getState();
    const { fetchCart } = useCartStore.getState();
    const jwt = user?.jwt;

    if (!selectedColor || !selectedSize || !jwt) {
      console.error('Missing required fields');
      return;
    }

    const selectedVariant = productDetails?.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );

    console.log('Selected variant:', selectedVariant);

    if (!selectedVariant) {
      console.error('No variant found with selected options');
      return;
    }

    try {
      console.log('Sending request with:', {
        productVariantId: selectedVariant.variantId,
        quantity: quantity
      });

      const response = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          variantId: selectedVariant.variantId,
          quantity: quantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }

      await fetchCart(jwt);
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    }
  };

  const uniqueColors = Array.from(new Set(productDetails?.variants.map(variant => variant.color)));
  const filteredVariantsByColor = productDetails?.variants.filter(variant => variant.color === selectedColor);
  const uniqueSizes = Array.from(new Set(filteredVariantsByColor?.map(variant => variant.size)));
  const selectedVariant = productDetails?.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  // Log để debug
  useEffect(() => {
    if (selectedColor && selectedSize && productDetails) {
      console.log('Selected color:', selectedColor);
      console.log('Selected size:', selectedSize);
      console.log('Available variants:', productDetails.variants);
      console.log('Selected variant:', selectedVariant);
    }
  }, [selectedColor, selectedSize, productDetails]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{productDetails?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4 py-4">
          {/* Phần hình ảnh */}
          <div className="relative aspect-square">
            {currentImage || productDetails?.mainImageUrl ? (
              <Image
                src={currentImage || productDetails?.mainImageUrl}
                alt={productDetails?.name || "Product image"}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Phần chọn biến thể */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Màu sắc</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(null); // Reset size when color changes
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color 
                        ? 'border-black' 
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: colorMapping[color] }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {selectedColor && (
              <div>
                <Label className="text-base font-semibold">Kích thước</Label>
                <RadioGroup 
                  value={selectedSize || ''} 
                  onValueChange={setSelectedSize} 
                  className="flex flex-wrap gap-2 mt-2"
                >
                  {uniqueSizes.map((size) => (
                    <div key={size} className="flex items-center">
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex items-center justify-center rounded-md border-2 border-muted px-3 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {selectedVariant && (
              <div>
                <Label className="text-base font-semibold">
                  Số lượng (Còn {selectedVariant.quantity} sản phẩm)
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= selectedVariant.quantity) {
                        setQuantity(value);
                      }
                    }}
                    min="1"
                    max={selectedVariant.quantity}
                    className="w-20 text-center border rounded-md px-3 py-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(selectedVariant.quantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.quantity}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="w-full flex flex-col gap-2">
            {selectedVariant && (
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng tiền:</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(productDetails!.price * quantity * 23500)}
                </span>
              </div>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedVariant || quantity > selectedVariant.quantity}
              className="w-full"
            >
              {action === 'buy' ? 'Mua ngay' : 'Thêm vào giỏ hàng'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
