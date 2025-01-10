"use client";

import { useCartStore } from "../../store/useCartStore";
import { useUserStore } from "../../store/useUserStore";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CircleX,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Image from "next/image";
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
  const { user, logout } = useUserStore();

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                  <nav className="flex flex-col p-6">
                    {mainNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="py-3 text-base font-medium hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    ))}
                    <div className="h-px bg-border my-4" />
                    {!user ? (
                      <>
                        <Link
                          href="/login"
                          className="py-3 text-base font-medium hover:text-primary transition-colors"
                        >
                          ĐĂNG NHẬP
                        </Link>
                        <Link
                          href="/register"
                          className="py-3 text-base font-medium hover:text-primary transition-colors"
                        >
                          ĐĂNG KÝ
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={logout}
                        className="flex items-center py-3 text-base font-medium hover:text-primary transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        ĐĂNG XUẤT
                      </button>
                    )}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight">Sky-Clothing</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <>
                {/* Desktop - Hover */}
                <div className="hidden md:block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-transparent"
                        onMouseEnter={() => setIsPopoverOpen(true)}
                        onMouseLeave={() => setIsPopoverOpen(false)}
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-48" 
                      align="end"
                      onMouseEnter={() => setIsPopoverOpen(true)}
                      onMouseLeave={() => setIsPopoverOpen(false)}
                    >
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Xin chào,</p>
                        <p className="text-sm font-bold truncate">{user.fullName}</p>
                        <div className="h-px bg-border my-2" />
                        <button
                          onClick={logout}
                          className="flex items-center text-sm text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Mobile - Link to profile */}
                <div className="md:hidden">
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="hover:bg-transparent">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  ĐĂNG NHẬP
                </Link>
                <span className="text-muted-foreground">/</span>
                <Link
                  href="/register"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  ĐĂNG KÝ
                </Link>
              </div>
            )}

            {/* Search */}
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-transparent">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-[600px]">
                <SheetHeader className="mb-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <CircleX className="h-5 w-5" />
                    </Button>
                  </div>
                </SheetHeader>
                {/* Search Results */}
                {searchQuery && (
                  <ScrollArea className="h-[500px]">
                    <div className="grid gap-4">
                      {/* Your search results here */}
                    </div>
                  </ScrollArea>
                )}
              </SheetContent>
            </Sheet>

            {/* Cart */}
            <>
              {/* Desktop - Hover */}
              <div className="hidden md:block">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent relative"
                      onMouseEnter={() => setIsPopoverOpen(true)}
                      onMouseLeave={() => setIsPopoverOpen(false)}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80" 
                    align="end"
                    onMouseEnter={() => setIsPopoverOpen(true)}
                    onMouseLeave={() => setIsPopoverOpen(false)}
                  >
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Giỏ hàng</h4>
                        <span className="text-sm text-muted-foreground">
                          {totalItems} sản phẩm
                        </span>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="grid gap-4">
                          {cart?.items?.map((item) => (
                            <div
                              key={item.cartItemId}
                              className="flex items-center gap-4"
                            >
                              <div className="relative h-16 w-16 overflow-hidden rounded">
                                <Image
                                  src={item.variant.productImages[0]}
                                  alt={item.variant.productName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 grid gap-1">
                                <h5 className="font-medium leading-none">
                                  {item.variant.productName}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {item.variant.size} / {item.variant.color}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                  <span>{item.quantity} × ${item.variant.quantity}</span>
                                  <span className="font-medium">${item.itemTotal}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {cart?.items?.length > 0 && (
                        <div className="grid gap-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Tổng cộng</span>
                            <span className="font-bold">${cart.totalAmount}</span>
                          </div>
                          <div className="grid gap-2">
                            <Link href="/cart">
                              <Button className="w-full" variant="default">
                                Xem giỏ hàng
                              </Button>
                            </Link>
                            <Button variant="outline" className="w-full">
                              Thanh toán
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* Mobile - Direct link to cart */}
              <div className="md:hidden">
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent relative"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </>
          </div>
        </div>
      </div>
    </header>
  );
}
