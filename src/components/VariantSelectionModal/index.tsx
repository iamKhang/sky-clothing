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

interface Color {
  colorId: string;
  color: string;
  productImages: string[];
  sizes: Size[];
}

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

interface ProductDetails {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  status: string | null;
  sizeChartUrl: string;
  category: string;
  collectionId: string | null;
  colors: Color[];
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

  // Update image when color is selected
  useEffect(() => {
    if (selectedColor && productDetails) {
      const colorData = productDetails.colors.find(c => c.color === selectedColor);
      if (colorData && colorData.productImages.length > 0) {
        setCurrentImage(colorData.productImages[0]);
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

      // Automatically select first color if available
      if (data.colors.length > 0) {
        const firstColor = data.colors[0].color;
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

    const selectedColorData = productDetails?.colors.find(c => c.color === selectedColor);
    const selectedSizeData = selectedColorData?.sizes.find(s => s.size === selectedSize);

    if (!selectedSizeData) {
      console.error('No size found with selected options');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          variantId: selectedSizeData.sizeId,
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
    }
  };

  const uniqueColors = productDetails?.colors.map(c => c.color) || [];
  const selectedColorData = productDetails?.colors.find(c => c.color === selectedColor);
  const uniqueSizes = selectedColorData?.sizes.map(s => s.size) || [];
  const selectedSizeData = selectedColorData?.sizes.find(s => s.size === selectedSize);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{productDetails?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4 py-4">
          {/* Image section */}
          <div className="relative aspect-square">
            {currentImage || productDetails?.mainImageUrl ? (
              <Image
                src={currentImage || productDetails?.mainImageUrl || ''}
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

          {/* Variant selection section */}
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
                  {uniqueSizes.map((size) => {
                    const sizeData = selectedColorData?.sizes.find(s => s.size === size);
                    const isAvailable = sizeData && sizeData.quantity > 0;
                    
                    return (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="peer sr-only"
                          disabled={!isAvailable}
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className={`flex items-center justify-center rounded-md border-2 border-muted px-3 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${
                            !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {size}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {selectedSizeData && (
              <div>
                <Label className="text-base font-semibold">
                  Số lượng (Còn {selectedSizeData.quantity} sản phẩm)
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
                      if (value >= 1 && value <= selectedSizeData.quantity) {
                        setQuantity(value);
                      }
                    }}
                    min="1"
                    max={selectedSizeData.quantity}
                    className="w-20 text-center border rounded-md px-3 py-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(selectedSizeData.quantity, quantity + 1))}
                    disabled={quantity >= selectedSizeData.quantity}
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
            {selectedSizeData && (
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng tiền:</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(productDetails!.price * quantity)}
                </span>
              </div>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedSizeData || quantity > (selectedSizeData?.quantity || 0)}
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
