import { ProductCard } from "@/components/ProductCart";

interface Product {
  productId: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  maxDiscountPercentage: number;
  colors: string[];
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('http://localhost:8080/api/products', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="py-8 mx-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.productId}
            name={product.name}
            price={product.price * 23500} // Convert USD to VND
            discount={product.maxDiscountPercentage}
            imgMain={product.mainImageUrl}
            imgSub={product.subImageUrl}
            colors={product.colors}
          />
        ))}
      </div>

      
    </div>
  );
}
