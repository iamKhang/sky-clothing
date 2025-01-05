'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUserStore } from '../../store/useUserStore'; // Adjust the import path as necessary
import { useCartStore } from '../../store/useCartStore'; // Adjust the import path as necessary

interface Variant {
  variantId: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
}

interface ProductDetails {
  name: string;
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

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`);
      const data = await response.json();
      setProductDetails(data);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleSubmit = async () => {
    const { user } = useUserStore.getState();
    const { fetchCart } = useCartStore.getState();
    const jwt = user?.jwt;

    if (selectedColor && selectedSize && jwt) {
      const selectedVariant = productDetails?.variants.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      if (selectedVariant) {
        console.log(`Selected variant: ${JSON.stringify(selectedVariant)}`);
        console.log(`Action: ${action}`);

        try {
          const response = await fetch('http://localhost:8080/api/cart/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
              productVariantId: selectedVariant.variantId,
              quantity: quantity
            })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log('Response data:', data);

          // Refresh the cart
          await fetchCart(jwt);
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
    onClose();
  };

  const uniqueColors = Array.from(new Set(productDetails?.variants.map(variant => variant.color)));
  const filteredVariantsByColor = productDetails?.variants.filter(variant => variant.color === selectedColor);
  const uniqueSizes = Array.from(new Set(filteredVariantsByColor?.map(variant => variant.size)));
  const selectedVariant = productDetails?.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn biến thể sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="mb-4">
            <Label className="text-base font-semibold">Màu sắc</Label>
            <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2 mt-2">
              {uniqueColors.map((color) => (
                <div key={color} className="flex items-center">
                  <RadioGroupItem
                    value={color}
                    id={`color-${color}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`color-${color}`}
                    className="flex items-center justify-center rounded-md border-2 border-muted px-3 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    {color}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label className="text-base font-semibold">Kích thước</Label>
            <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2 mt-2">
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

          <div className="mb-4">
            <Label className="text-base font-semibold">Số lượng</Label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              max={selectedVariant?.quantity || 1}
              disabled={!selectedVariant || selectedVariant.quantity === 0}
              className="border rounded-md px-3 py-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!selectedVariant || selectedVariant.quantity === 0}>
            {action === 'buy' ? 'Mua ngay' : 'Thêm vào giỏ hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
