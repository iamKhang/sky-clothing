"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, ShoppingCart } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const mainNav = [
  { title: "SHOP ALL", href: "/shop" },
  { title: "TOPS", href: "/tops" },
  { title: "BOTTOMS", href: "/bottoms" },
  { title: "OUTERWEAR", href: "/outerwear" },
  { title: "BAGS", href: "/bags" },
  { title: "ACCESSORIES", href: "/accessories" },
  { title: "SALE", href: "/sale" },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Mock search results
  const searchResults = [
    {
      id: 1,
      name: "HADES STRIPED SOLID SHIRT",
      price: 432000,
      originalPrice: 480000,
      image: "https://product.hstatic.net/1000306633/product/5_b24b96d2890043a78da683055f1d99ee.jpg"
    },
    {
      id: 2,
      name: "HADES STANDARD STRIPLE SHORTS",
      price: 323000,
      originalPrice: 380000,
      image: "https://product.hstatic.net/1000306633/product/5_b24b96d2890043a78da683055f1d99ee.jpg"
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                  <Menu size={24} />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  {mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 border-t pt-6">
                  <div className="flex flex-col space-y-3">
                    <Link href="/login" className="text-lg font-medium hover:text-primary">
                      ĐĂNG NHẬP
                    </Link>
                    <Link href="/register" className="text-lg font-medium hover:text-primary">
                      ĐĂNG KÝ
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Sky-Clothing</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login" className="text-sm font-medium hover:text-primary">
                ĐĂNG NHẬP
              </Link>
              <span className="text-sm font-medium">/</span>
              <Link href="/register" className="text-sm font-medium hover:text-primary">
                ĐĂNG KÝ
              </Link>
            </div>

            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search products</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>TÌM KIẾM</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  {searchQuery && (
                    <div className="space-y-4">
                      {searchResults.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 object-cover"
                          />
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {product.price.toLocaleString()}đ
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {product.originalPrice.toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>GIỎ HÀNG</SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="mt-4">
                    <p className="text-center text-muted-foreground">
                      Hiện chưa có sản phẩm
                    </p>
                  </div>
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-base font-medium">
                      <span>TOTAL</span>
                      <span>0đ</span>
                    </div>
                    <div className="grid gap-2">
                      <Button className="w-full">XEM GIỎ HÀNG</Button>
                      <Button variant="outline" className="w-full">
                        THANH TOÁN
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

