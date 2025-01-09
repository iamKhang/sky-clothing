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
import { Plus, X, Upload } from "lucide-react";

// Enum cho status và category
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
} as const;

const SizeOptions = {
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
} as const;

// Cập nhật interface để match với DTO
interface ProductVariant {
  variantId?: string;  // optional vì là create mới
  sku: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
  productName?: string;  // optional vì sẽ được set từ tên sản phẩm
}

interface ProductDetail {
  productId?: string;  // optional vì là create mới
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

// Cập nhật schema validation
const variantSchema = z.object({
  sku: z.string().min(1, "SKU là bắt buộc"),
  color: z.nativeEnum(ColorOptions),
  size: z.nativeEnum(SizeOptions),
  quantity: z.number().min(0, "Số lượng không được âm"),
  discountPercentage: z.number().min(0, "Giảm giá không được âm").max(100, "Giảm giá không được vượt quá 100%"),
  productImages: z.array(z.any()),
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

type ProductFormValues = z.infer<typeof productSchema>;

// Thêm interface cho Collection
interface Collection {
  collectionId: string;
  collectionName: string;
}

export default function AddProductPage() {
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [subImageUrl, setSubImageUrl] = useState<string>('');
  const [sizeChartUrl, setSizeChartUrl] = useState<string>('');

  // Fetch collections khi component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/collections");
        if (!response.ok) {
          throw new Error("Không thể tải danh sách bộ sưu tập");
        }
        const data = await response.json();
        setAvailableCollections(data);
      } catch (error) {
        console.error("Lỗi khi tải collections:", error);
        alert("Không thể tải danh sách bộ sưu tập");
      }
    };

    fetchCollections();
  }, []);

  const form = useForm<ProductFormValues>({
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

  const addVariant = () => {
    const newVariant = {
      sku: "",
      color: "WHITE",
      size: "S",
      quantity: 0,
      discountPercentage: 0,
      productImages: [],
    };
    setVariants([...variants, newVariant]);
    form.setValue("variants", [...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    form.setValue("variants", newVariants);
  };

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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Upload main images
      if (mainImageFile) {
        const mainImageUrl = await handleFileUpload(mainImageFile);
        data.mainImageUrl = mainImageUrl;
      }
      if (subImageFile) {
        const subImageUrl = await handleFileUpload(subImageFile);
        data.subImageUrl = subImageUrl;
      }
      if (sizeChartFile) {
        const sizeChartUrl = await handleFileUpload(sizeChartFile);
        data.sizeChartUrl = sizeChartUrl;
      }

      // Upload variant images và format data
      const processedVariants = await Promise.all(
        data.variants.map(async (variant) => {
          let uploadedImages: string[] = [];
          if (variant.productImages?.length > 0) {
            const formData = new FormData();
            variant.productImages.forEach((file: File) => {
              formData.append('files', file);
            });

            const response = await fetch('http://localhost:8080/api/files/upload-multiple', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Failed to upload variant images');
            }

            const uploadedData = await response.json();
            uploadedImages = uploadedData.map((img: any) => img.fileUrl);
          }

          // Format variant theo DTO
          return {
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            quantity: variant.quantity,
            discountPercentage: variant.discountPercentage,
            productImages: uploadedImages,
            productName: data.name // Thêm tên sản phẩm vào variant
          };
        })
      );

      // Format request data theo ProductDetailDTO
      const requestData: ProductDetail = {
        name: data.name,
        description: data.description,
        mainImageUrl: data.mainImageUrl,
        subImageUrl: data.subImageUrl,
        sizeChartUrl: data.sizeChartUrl,
        price: data.price,
        status: data.status,
        category: data.category,
        collectionId: selectedCollections[0]?.collectionId || null, // Lấy collectionId đầu tiên hoặc null
        variants: processedVariants
      };

      console.log('Request data:', requestData);

      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      // Reset form và state
      form.reset();
      setSelectedCollections([]);
      setVariants([]);
      setMainImageFile(null);
      setSubImageFile(null);
      setSizeChartFile(null);
      
      alert("Thêm sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi:", error);
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm sản phẩm!");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thêm Sản Phẩm Mới</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Thông tin cơ bản */}
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

          {/* URLs */}
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
                        <img 
                          src={field.value} 
                          alt="Main preview" 
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh phụ</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSubImageFile(file);
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {field.value && (
                        <img 
                          src={field.value} 
                          alt="Sub preview" 
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizeChartUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bảng size</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSizeChartFile(file);
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {field.value && (
                        <img 
                          src={field.value} 
                          alt="Size chart preview" 
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status và Category */}
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
                if (collection && !selectedCollections.some(sc => sc.collectionId === collection.collectionId)) {
                  const newSelectedCollections = [...selectedCollections, collection];
                  setSelectedCollections(newSelectedCollections);
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
                    disabled={selectedCollections.some(sc => sc.collectionId === collection.collectionId)}
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
                      const newSelectedCollections = selectedCollections.filter(
                        (sc) => sc.collectionId !== collection.collectionId
                      );
                      setSelectedCollections(newSelectedCollections);
                      form.setValue(
                        "collectionId",
                        newSelectedCollections.length > 0 ? newSelectedCollections[0].collectionId : null
                      );
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
            <div className="flex justify-between items-center">
              <FormLabel>Biến thể sản phẩm</FormLabel>
              <Button type="button" onClick={addVariant}>
                Thêm biến thể
              </Button>
            </div>
            {variants.map((variant, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Biến thể #{index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeVariant(index)}
                  >
                    Xóa
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Màu sắc</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                  <FormField
                    control={form.control}
                    name={`variants.${index}.size`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kích cỡ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(SizeOptions).map(([key, value]) => (
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
                    name={`variants.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.discountPercentage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phần trăm giảm giá</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Product Images for variant */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.productImages`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hình ảnh biến thể</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              field.onChange(files);
                            }}
                          />
                          <div className="grid grid-cols-4 gap-2">
                            {field.value && field.value.map((file: File, imageIndex: number) => (
                              <div key={imageIndex} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${imageIndex}`}
                                  className="w-full h-24 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newImages = field.value.filter((_: File, i: number) => i !== imageIndex);
                                    field.onChange(newImages);
                                  }}
                                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Thêm sản phẩm
          </Button>
        </form>
      </Form>
    </div>
  );
}
