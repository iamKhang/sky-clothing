'use client'

import axios from 'axios';
import { Paginate } from "@/components/Paginate";
import { ProductCard } from "@/components/ProductCart";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';

interface Product {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  maxDiscountPercentage: number;
  colors: string[];
}

interface ProductResponse {
  content: Product[];
  totalPages: number;
  number: number;
}

export default function CategoryProducts() {
  const params = useParams();
  const category = (params.category as string).slice(0, -1).toUpperCase();
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
    <div className="py-8 mx-10">
      <h1 className="text-2xl font-bold mb-6 capitalize">{category} Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              name={product.name}
              price={product.price * 23500} // Convert USD to VND
              discount={product.maxDiscountPercentage}
              imgMain={product.mainImageUrl}
              imgSub={product.subImageUrl}
              colors={product.colors}
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
    </div>
  );
}
