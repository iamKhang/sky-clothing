import axios from 'axios';
import { ProductDetailClient } from './ProductDetailClient';
import { notFound } from 'next/navigation';

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

interface Color {
  colorId: string;
  color: string;
  productImages: string[];
  sizes: Size[];
}

interface Product {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  status: string;
  sizeChartUrl: string;
  category: string;
  collectionId: string | null;
  colors: Color[];
}

async function getProduct(productId: string): Promise<Product> {
  try {
    const { data } = await axios.get(`http://localhost:8080/api/products/${productId}`);
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);
  
  return {
    title: product.name,
    description: `${product.name} - Giá: ${product.price}VND`,
    openGraph: {
      images: [product.mainImageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);
  return <ProductDetailClient initialProduct={product} />;
}