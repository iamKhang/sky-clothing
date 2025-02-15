'use client'

import axios from 'axios';
import { Paginate } from "@/components/Paginate";
import { ProductCard } from "@/components/ProductCart";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import Marquee from "react-fast-marquee";

interface Product {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  maxDiscountPercentage: number;
  availableColors: string[];
}

interface ProductResponse {
  content: Product[];
  totalPages: number;
  number: number;
}

export default function CategoryProducts() {
  const params = useParams();
  const category = (params.category as string).toUpperCase();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function getProductsByCategory(page: number): Promise<ProductResponse> {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/products/category/${category}`,
        {
          params: {
            page,
            size: 10
          }
        }
      );
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProductsByCategory(currentPage - 1);
      setProducts(data.content);
      setTotalPages(data.totalPages);
    };
    fetchProducts();
  }, [currentPage, category]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="py-8 mx-4 sm:mx-6 md:mx-10">
        <h1 className="text-2xl font-bold mb-6 capitalize">{category} Products</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              name={product.name}
              price={product.price}
              discount={product.maxDiscountPercentage}
              imgMain={product.mainImageUrl}
              imgSub={product.subImageUrl}
              availableColors={product.availableColors}
              productId={product.productId}
            />
          ))}
        </div>
        <div className="mt-8">
          <Paginate
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        <div className="bg-white py-4 overflow-y-hidden">
          <Marquee gradient={false} speed={50} className="overflow-hidden">
            <span
              className="mx-8 text-6xl font-bold tracking-wider"
              style={{
                WebkitTextStroke: "1px black",
                WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              STREETWEAR BRAND LIMITED
            </span>
            <span
              className="mx-8 text-6xl font-bold tracking-wider"
              style={{
                WebkitTextStroke: "1px black",
                WebkitTextFillColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              STREETWEAR BRAND LIMITED
            </span>
          </Marquee>
        </div>
      </div>
    </div>
  );
}
