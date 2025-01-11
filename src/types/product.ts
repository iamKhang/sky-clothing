export interface ProductVariant {
  variantId: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
  productName: string;
}

export interface Product {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  status: string | null;
  description: string;
  sizeChartUrl: string;
  category: string;
  collectionId: string | null;
  variants: ProductVariant[];
} 