"use client"

import Link from "next/link"
import { Minus, Plus, X } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCartStore()

  const calculateSubtotal = (price: number, quantity: number) => {
    return price * quantity
  }

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0
    return cart.totalAmount * 23500 // Sử dụng totalAmount từ cart
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleInputChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity)
    }
  }

  return (
    <div className="container mx-auto px-[5%] py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 mb-4 text-sm font-medium text-gray-500">
            <div className="col-span-6">SẢN PHẨM</div>
            <div className="col-span-2 text-right">GIÁ</div>
            <div className="col-span-2 text-center">SỐ LƯỢNG</div>
            <div className="col-span-2 text-right">TẠM TÍNH</div>
          </div>
          
          <div className="space-y-4">
            {cart?.items?.map((item) => (
              <div key={item.cartItemId} className="grid grid-cols-2 lg:grid-cols-12 gap-4 items-center border-b pb-4">
                <div className="col-span-2 lg:col-span-6 flex gap-4">
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => removeItem(item.cartItemId)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex gap-4 flex-1">
                    <div className="relative w-20 h-20">
                      <Image 
                        src={item.variant.productImages[0]} 
                        alt={item.variant.sku}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.variant.productName}</h3>
                      <p className="text-sm text-gray-500">
                        {item.variant.size} / {item.variant.color}
                      </p>
                      {item.variant.discountPercentage > 0 && (
                        <p className="text-sm text-red-500">
                          Giảm {item.variant.discountPercentage}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right lg:col-span-2">
                  {(item.variant.quantity * 23500).toLocaleString()}đ
                </div>
                
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-center border rounded-md">
                    <button 
                      className="p-2 hover:bg-gray-100"
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(item.cartItemId, e)}
                      className="w-12 text-center border-x"
                      min="1"
                      max={item.variant.quantity}
                    />
                    <button 
                      className="p-2 hover:bg-gray-100"
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right lg:col-span-2 font-medium">
                  {(item.itemTotal * 23500).toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                ← TIẾP TỤC XEM SẢN PHẨM
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto">
              CẬP NHẬT GIỎ HÀNG
            </Button>
          </div>
        </div>
        
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-gray-50 p-6 space-y-4">
            <h2 className="font-medium text-lg">CỘNG GIỎ HÀNG</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-medium">{calculateTotal().toLocaleString()}đ</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span>Giao hàng</span>
                <div className="text-right">
                  <p className="text-green-600">Giao hàng miễn phí</p>
                  <p className="text-sm text-gray-500">
                    Tùy chọn giao hàng sẽ được cập nhật trong quá trình thanh toán.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-medium">
              <span>Tổng</span>
              <span>{calculateTotal().toLocaleString()}đ</span>
            </div>
            
            <Button className="w-full bg-[#ee4d2d] hover:bg-[#e84426]">
              TIẾN HÀNH THANH TOÁN
            </Button>
            
            <div className="space-y-2">
              <p className="font-medium">Phiếu ưu đãi</p>
              <div className="flex gap-2">
                <Input placeholder="Mã ưu đãi" />
                <Button variant="outline">Áp dụng</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}