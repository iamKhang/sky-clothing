import { ProductCard } from "@/components/ProductCart";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    name: 'HADES OUTLAW LOGO HOODIE',
    price: 750500,
    discount: 5,
    imgMain: 'https://product.hstatic.net/1000306633/product/hd_t11.1538_82e8c51563d8455682b2b4d94e5c69e5.jpg',
    imgSub: 'https://product.hstatic.net/1000306633/product/untitled_capture4022_507c8fdc2e9442ab9bc449f28ca6218f.jpg'
  },
  {
    name: 'HADES OUTLAW LOGO HOODIE',
    price: 750500,
    discount: 10,
    imgMain: 'https://product.hstatic.net/1000306633/product/hd_t11.1538_82e8c51563d8455682b2b4d94e5c69e5.jpg',
    imgSub: 'https://product.hstatic.net/1000306633/product/untitled_capture4022_507c8fdc2e9442ab9bc449f28ca6218f.jpg'
  },
  {
    name: 'HADES OUTLAW LOGO HOODIE',
    price: 750500,
    discount: 15,
    imgMain: 'https://product.hstatic.net/1000306633/product/hd_t11.1538_82e8c51563d8455682b2b4d94e5c69e5.jpg',
    imgSub: 'https://product.hstatic.net/1000306633/product/untitled_capture4022_507c8fdc2e9442ab9bc449f28ca6218f.jpg'
  },
  {
    name: 'HADES OUTLAW LOGO HOODIE',
    price: 750500,
    discount: 20,
    imgMain: 'https://product.hstatic.net/1000306633/product/hd_t11.1538_82e8c51563d8455682b2b4d94e5c69e5.jpg',
    imgSub: 'https://product.hstatic.net/1000306633/product/untitled_capture4022_507c8fdc2e9442ab9bc449f28ca6218f.jpg'
  }
]

export default function Home() {
  return (
    <div className="container py-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={index} {...product} />
      ))}
    </div>
  </div>
  );
}
