"use client";

import { useCartStore } from "../../store/useCartStore";
import { useUserStore } from "../../store/useUserStore";
import { colorMapping } from "../../utils/colorMapping";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CircleUser,
  CircleX,
  Menu,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";

const mainNav = [
  { title: "SHOP ALL", href: "/" },
  { title: "TOPS", href: "/products/tops" },
  { title: "BOTTOMS", href: "/products/bottoms" },
  { title: "OUTERWEARS", href: "/products/outerwears" },
  { title: "BAGS", href: "/products/bags" },
  { title: "ACCESSORIES", href: "/products/accessories" },
  { title: "SALES", href: "/sales" },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { cart } = useCartStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user } = useUserStore();

  // Mock search results
  const searchResults = [
    {
      id: 1,
      name: "HADES STRIPED SOLID SHIRT",
      price: 432000,
      originalPrice: 480000,
      image:
        "https://product.hstatic.net/1000306633/product/5_b24b96d2890043a78da683055f1d99ee.jpg",
    },
    {
      id: 2,
      name: "HADES STANDARD STRIPLE SHORTS",
      price: 323000,
      originalPrice: 380000,
      image:
        "https://product.hstatic.net/1000306633/product/5_b24b96d2890043a78da683055f1d99ee.jpg",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
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
                    <Link
                      href="/login"
                      className="text-lg font-medium hover:text-primary"
                    >
                      ĐĂNG NHẬP
                    </Link>
                    <Link
                      href="/register"
                      className="text-lg font-medium hover:text-primary"
                    >
                      ĐĂNG KÝ
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Sky-Clothing</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2 ">
                  <span className="text-lg font-semibold text-slate-600 uppercase hover:text-black">
                    <span className="">Xin chao, </span>
                    {user.fullName}
                  </span>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-primary"
                  >
                    ĐĂNG NHẬP
                  </Link>
                  <span className="text-sm font-medium">/</span>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-primary"
                  >
                    ĐĂNG KÝ
                  </Link>
                </>
              )}
            </div>
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
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
                        <div
                          key={product.id}
                          className="flex items-center space-x-4"
                        >
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
            {/* Desktop Cart with Popover */}
            <div className="hidden md:block">
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    onMouseEnter={() => setIsPopoverOpen(true)}
                    onMouseLeave={() => setIsPopoverOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">Shopping cart</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[320px] p-0"
                  align="end"
                  onMouseEnter={() => setIsPopoverOpen(true)}
                  onMouseLeave={() => setIsPopoverOpen(false)}
                >
                  <div className="p-4 pb-2">
                    <h3 className="font-medium">Giỏ hàng</h3>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-4 pt-2">
                      {cart && cart.cartItems.length > 0 ? (
                        <div className="space-y-4">
                          {cart.cartItems.map((item) => (
                            <div
                              key={item.cartItemId}
                              className="flex items-start gap-3 [&:not(:last-child)]:border-b border-gray-100 pb-4"
                            >
                              <div className="relative h-16 w-16 overflow-hidden bg-muted">
                                <img
                                  src={item.productVariant.productImages[0]}
                                  alt={item.productVariant.sku}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col gap-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium line-clamp-1">
                                    {item.productVariant.productName}
                                  </span>
                                  {/* <button className="ml-2 h-5 w-5"> */}
                                  <CircleX className="h-5 w-5" />
                                  {/* </button> */}
                                </div>
                                <span className="text-muted-foreground">
                                  {item.productVariant.size}
                                </span>
                                <div className="flex justify-between">
                                  <span>
                                    {item.quantity} ×{" "}
                                    {item.productVariant.quantity.toLocaleString()}
                                    đ
                                  </span>
                                  <span className="font-medium">
                                    {(
                                      item.quantity *
                                      item.productVariant.quantity
                                    ).toLocaleString()}
                                    đ
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          Hiện chưa có sản phẩm
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                  {cart && cart.cartItems.length > 0 && (
                    <div className="border-t p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Tổng số phụ:</span>
                          <span className="font-medium">
                            {cart.cartItems
                              .reduce(
                                (total, item) =>
                                  total +
                                  item.productVariant.quantity * item.quantity,
                                0
                              )
                              .toLocaleString()}
                            đ
                          </span>
                        </div>
                        <div className="grid gap-2">
                          <Link href="/cart" className="block">
                            <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                              XEM GIỎ HÀNG
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full border-zinc-900"
                          >
                            THANH TOÁN
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            {/* Mobile Cart Link */}
            <div className="md:hidden">
              <Link href="/cart">
                <Button
                  variant="ghost"
                  className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
