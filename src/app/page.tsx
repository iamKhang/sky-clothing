import { ProductCard } from "@/components/ProductCart";
import { PaginationHandler } from "@/components/PaginationHandler";
import axios from "axios";
import Marquee from "react-fast-marquee";
import banner from "../../public/backgrounds/YE_25_2x1Website_banner.jpg";

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

async function getProducts(page: number): Promise<ProductResponse> {
  try {
    const { data } = await axios.get(`http://localhost:8080/api/products`, {
      params: {
        page,
        size: 10,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const data = await getProducts(currentPage - 1);
  const products = data.content;
  const totalPages = data.totalPages;

  return (
    <div>
      <img src={banner.src} alt="Banner" className="w-full h-auto mb-8" />
      <div className="py-8 mx-4 sm:mx-6 md:mx-10">
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
          <PaginationHandler
            currentPage={currentPage}
            totalPages={totalPages}
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
