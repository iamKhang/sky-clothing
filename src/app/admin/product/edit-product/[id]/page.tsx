"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

// Enums
const ProductStatus = {
  AVAILABLE: "AVAILABLE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
} as const;

const ProductCategory = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  OUTERWEAR: "OUTERWEAR",
  BAG: "BAG",
  ACCESSORIES: "ACCESSORIES",
} as const;

const ColorOptions = {
  WHITE: "WHITE",
  BLACK: "BLACK",
  RED: "RED",
  BLUE: "BLUE",
  GREEN: "GREEN",
  YELLOW: "YELLOW",
  ORANGE: "ORANGE",
  PINK: "PINK",
} as const;

// Interfaces
interface ProductVariant {
  variantId?: string;
  sku?: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
  productName?: string;
}

interface ProductDetail {
  productId?: string;
  name: string;
  mainImageUrl: string;
  subImageUrl: string;
  price: number;
  status: string;
  description: string;
  sizeChartUrl: string;
  category: string;
  collectionId: string | null;
  variants: ProductVariant[];
}

interface Collection {
  collectionId: string;
  collectionName: string;
}

interface TempVariant {
  color: string;
  sizes: {
    size: string;
    quantity: number;
    discountPercentage: number;
    variantId?: string;
    sku?: string;
  }[];
  productImages: string[];
}

// Constants
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Schema Validation
const variantSchema = z.object({
  color: z.string(),
  size: z.string(),
  quantity: z.number(),
  discountPercentage: z.number(),
  productImages: z.array(z.string()),
  sku: z.string().optional(),
  variantId: z.string().optional(),
  productName: z.string().optional()
});

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().min(1, "Mô tả sản phẩm là bắt buộc"),
  mainImageUrl: z.string(),
  subImageUrl: z.string(),
  sizeChartUrl: z.string(),
  status: z.nativeEnum(ProductStatus),
  price: z.number().positive("Giá phải lớn hơn 0"),
  category: z.nativeEnum(ProductCategory),
  collectionId: z.string().nullable(),
  variants: z.array(variantSchema),
});

// Component cho bảng size của một màu
const ColorSizeTable = ({ 
  color, 
  variants, 
  setVariants, 
  index,
  form 
}: { 
  color: string;
  variants: TempVariant[];
  setVariants: (variants: TempVariant[]) => void;
  index: number;
  form: any;
}) => {
  return (
    <div className="mt-4">
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Size</th>
            <th className="border p-2">Số lượng</th>
            <th className="border p-2">Giảm giá (%)</th>
            <th className="border p-2">Mã SKU</th>
          </tr>
        </thead>
        <tbody>
          {ALL_SIZES.map((size, sizeIndex) => {
            const sizeData = variants[index].sizes.find(s => s.size === size) || {
              size,
              quantity: 0,
              discountPercentage: 0,
              sku: '',
              variantId: ''
            };
            
            return (
              <tr key={size}>
                <td className="border p-2">{size}</td>
                <td className="border p-2">
                  <Input
                    type="number"
                    value={sizeData.quantity}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                      const updatedVariants = [...variants];
                      const sizeIndex = updatedVariants[index].sizes.findIndex(s => s.size === size);
                      
                      if (sizeIndex === -1) {
                        updatedVariants[index].sizes.push({
                          size,
                          quantity: value,
                          discountPercentage: 0,
                          sku: sizeData.sku,
                          variantId: sizeData.variantId
                        });
                      } else {
                        updatedVariants[index].sizes[sizeIndex].quantity = value;
                      }
                      
                      setVariants(updatedVariants);
                      form.setValue(`variants.${index}.sizes`, updatedVariants[index].sizes);
                    }}
                    className="w-full"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    value={sizeData.discountPercentage}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      const updatedVariants = [...variants];
                      const sizeIndex = updatedVariants[index].sizes.findIndex(s => s.size === size);
                      
                      if (sizeIndex === -1) {
                        updatedVariants[index].sizes.push({
                          size,
                          quantity: 0,
                          discountPercentage: value,
                          sku: sizeData.sku,
                          variantId: sizeData.variantId
                        });
                      } else {
                        updatedVariants[index].sizes[sizeIndex].discountPercentage = value;
                      }
                      
                      setVariants(updatedVariants);
                      form.setValue(`variants.${index}.sizes`, updatedVariants[index].sizes);
                    }}
                    className="w-full"
                  />
                </td>
                <td className="border p-2 text-sm text-gray-500">
                  {sizeData.sku || 'Chưa có'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [variants, setVariants] = useState<TempVariant[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [variantImages, setVariantImages] = useState<{ [key: number]: File[] }>({});

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      mainImageUrl: "",
      subImageUrl: "",
      sizeChartUrl: "",
      status: "AVAILABLE",
      price: 0,
      category: "TOP",
      collectionId: null,
      variants: [],
    },
  });

  // Fetch collections và product data khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collections
        const collectionsResponse = await fetch("http://localhost:8080/api/collections");
        if (!collectionsResponse.ok) {
          throw new Error("Không thể tải danh sách bộ sưu tập");
        }
        const collectionsData = await collectionsResponse.json();
        setAvailableCollections(collectionsData);

        // Fetch product
        const productResponse = await fetch(`http://localhost:8080/api/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error("Không thể tải thông tin sản phẩm");
        }
        const productData = await productResponse.json();
        setProduct(productData);

        // Transform variants data
        const transformedVariants = transformVariantsForEdit(productData.variants);
        setVariants(transformedVariants);

        // Set selected collection
        if (productData.collectionId) {
          const collection = collectionsData.find(c => c.collectionId === productData.collectionId);
          if (collection) {
            setSelectedCollections([collection]);
          }
        }

        // Set form values
        form.reset({
          name: productData.name,
          description: productData.description,
          mainImageUrl: productData.mainImageUrl,
          subImageUrl: productData.subImageUrl,
          sizeChartUrl: productData.sizeChartUrl,
          status: productData.status || "AVAILABLE",
          price: productData.price,
          category: productData.category,
          collectionId: productData.collectionId,
          variants: transformedVariants,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Có lỗi xảy ra khi tải dữ liệu!");
      }
    };

    fetchData();
  }, [productId]);

  // Transform variants for editing
  const transformVariantsForEdit = (variants: ProductVariant[]): TempVariant[] => {
    const groupedVariants: { [key: string]: TempVariant } = {};
    
    variants.forEach(variant => {
      if (!groupedVariants[variant.color]) {
        groupedVariants[variant.color] = {
          color: variant.color,
          sizes: [],
          productImages: variant.productImages
        };
      }
      
      // Thêm size mới với đầy đủ thông tin bao gồm cả SKU
      groupedVariants[variant.color].sizes.push({
        size: variant.size,
        quantity: variant.quantity,
        discountPercentage: variant.discountPercentage,
        variantId: variant.variantId,
        sku: variant.sku // Thêm SKU vào đây
      });
    });
    
    // Sắp xếp sizes theo thứ tự định nghĩa trong ALL_SIZES
    Object.values(groupedVariants).forEach(variant => {
      variant.sizes.sort((a, b) => 
        ALL_SIZES.indexOf(a.size) - ALL_SIZES.indexOf(b.size)
      );
    });
    
    return Object.values(groupedVariants);
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Form submit handler
  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      // Upload images if changed
      if (mainImageFile) {
        data.mainImageUrl = await handleFileUpload(mainImageFile);
      }
      if (subImageFile) {
        data.subImageUrl = await handleFileUpload(subImageFile);
      }
      if (sizeChartFile) {
        data.sizeChartUrl = await handleFileUpload(sizeChartFile);
      }

      // Transform variants back to API format
      const transformedVariants = variants.flatMap(variant => 
        variant.sizes
          .filter(size => size.quantity > 0)
          .map(size => ({
            variantId: size.variantId,
            sku: size.sku,
            color: variant.color,
            size: size.size,
            quantity: size.quantity,
            discountPercentage: size.discountPercentage,
            productImages: variant.productImages,
            productName: data.name
          }))
      );

      const requestData: ProductDetail = {
        productId,
        name: data.name,
        description: data.description,
        mainImageUrl: data.mainImageUrl,
        subImageUrl: data.subImageUrl,
        sizeChartUrl: data.sizeChartUrl,
        price: data.price,
        status: data.status,
        category: data.category,
        collectionId: selectedCollections[0]?.collectionId || null,
        variants: transformedVariants
      };

      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      alert("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Có lỗi xảy ra khi cập nhật sản phẩm!");
    }
  };

  return (
    <div className="container max-w-[80%] mx-auto py-6 px-10">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>
      {product ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product ID (read-only) */}
            <div className="text-sm text-gray-500">
              Mã sản phẩm: {productId}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="mainImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh chính</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setMainImageFile(file);
                              field.onChange(URL.createObjectURL(file));
                            }
                          }}
                        />
                        {field.value && (
                          <Image 
                            src={field.value} 
                            alt="Main preview" 
                            width={128}
                            height={128}
                            className="object-cover rounded-md"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Similar fields for subImageUrl and sizeChartUrl */}
              {/* ... */}
            </div>

            {/* Status and Category */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ProductStatus).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ProductCategory).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Collections */}
            <div className="space-y-2">
              <FormLabel>Bộ sưu tập</FormLabel>
              <Select
                onValueChange={(value) => {
                  const collection = availableCollections.find(c => c.collectionId === value);
                  if (collection) {
                    setSelectedCollections([collection]);
                    form.setValue("collectionId", collection.collectionId);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bộ sưu tập" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCollections.map((collection) => (
                    <SelectItem 
                      key={collection.collectionId} 
                      value={collection.collectionId}
                    >
                      {collection.collectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCollections.map((collection) => (
                  <div
                    key={collection.collectionId}
                    className="flex items-center gap-1 bg-secondary p-2 rounded"
                  >
                    <span>{collection.collectionName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollections([]);
                        form.setValue("collectionId", null);
                      }}
                      className="text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Biến thể #{index + 1}</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name={`variants.${index}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Màu sắc</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            const updatedVariants = [...variants];
                            updatedVariants[index] = {
                              ...updatedVariants[index],
                              color: value
                            };
                            setVariants(updatedVariants);
                          }}
                          defaultValue={variant.color}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn màu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ColorOptions).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ColorSizeTable
                    color={variant.color}
                    variants={variants}
                    setVariants={setVariants}
                    index={index}
                    form={form}
                  />

                  {/* Variant Images */}
                  <FormField
                    control={form.control}
                    name={`variants.${index}.productImages`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hình ảnh biến thể</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {variant.productImages.map((image, imageIndex) => (
                            <div key={imageIndex} className="relative">
                              <Image
                                src={image}
                                alt={`Variant ${index} image ${imageIndex}`}
                                width={100}
                                height={100}
                                className="object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full">
              Cập nhật sản phẩm
            </Button>
          </form>
        </Form>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
} 