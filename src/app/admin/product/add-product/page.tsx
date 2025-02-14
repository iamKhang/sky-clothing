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
import Image from "next/image";
import { colorMapping } from "@/utils/colorMapping";

// Thay thế các enum cũ bằng các constant mới
const ProductStatus = {
  AVAILABLE: "AVAILABLE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
} as const;

// Mapping hiển thị cho status
const StatusDisplay: Record<string, string> = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of Stock",
  DISCONTINUED: "Discontinued",
};

// Cấu trúc category mới
const ProductCategory = {
  TOP: {
    name: "Top",
    subCategories: {
      TOP_TSHIRT: "T-Shirt",
      TOP_SHIRT: "Shirt",
      TOP_POLO: "Polo",
    },
  },
  BOTTOM: {
    name: "Bottom",
    subCategories: {
      BOTTOM_PANT: "Pant",
      BOTTOM_SHORTPANT: "Short Pant",
    },
  },
  OUTERWEAR: {
    name: "Outerwear",
    subCategories: {
      OUTERWEAR_HOODIE: "Hoodie",
      OUTERWEAR_HOODIE_ZIPPER: "Hoodie Zipper",
      OUTERWEAR_SWEATER: "Sweater",
      OUTERWEAR_JACKET: "Jacket",
      OUTERWEAR_VARSITY: "Varsity",
      OUTERWEAR_CARDIGAN: "Cardigan",
    },
  },
  ACCESSORIES: {
    name: "Accessories",
    subCategories: {
      ACCESSORIES_CAP: "Cap",
      ACCESSORIES_MINI_SHOULDER_BAG: "Mini Shoulder Bag",
      ACCESSORIES_TOTE_BAG: "Tote Bag",
      ACCESSORIES_WALLET: "Wallet",
      ACCESSORIES_SOCK: "Sock",
      ACCESSORIES_SANDAL: "Sandal",
    },
  },
} as const;

// Tạo mapping hiển thị cho màu sắc
const ColorDisplay: Record<string, string> = Object.keys(colorMapping).reduce((acc, key) => {
  // Chuyển đổi SNAKE_CASE thành Title Case
  acc[key] = key.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  return acc;
}, {} as Record<string, string>);

// Cập nhật interface để match với DTO
interface ProductSize {
  size: string;
  quantity: number;
  soldQuantity: number;
  discountPercentage: number;
  active: boolean;
  newProduct: boolean;
  bestSeller: boolean;
}

interface ProductColor {
  color: string;
  productImages: string[];
  sizes: ProductSize[];
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
  colors: ProductColor[];
}

// Cập nhật schema validation
const sizeSchema = z.object({
  size: z.string(),
  quantity: z.number(),
  soldQuantity: z.number(),
  discountPercentage: z.number(),
  active: z.boolean(),
  newProduct: z.boolean(),
  bestSeller: z.boolean()
});

const colorSchema = z.object({
  color: z.enum(Object.keys(colorMapping) as [string, ...string[]]),
  productImages: z.array(z.any()),
  sizes: z.array(sizeSchema)
});

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().min(1, "Mô tả sản phẩm là bắt buộc"),
  mainImageUrl: z.string(),
  subImageUrl: z.string(),
  sizeChartUrl: z.string(),
  status: z.enum(["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"]),
  price: z.number().positive("Giá phải lớn hơn 0"),
  category: z.string().refine((val) => {
    return Object.values(ProductCategory).some(mainCat => 
      Object.keys(mainCat.subCategories).includes(val)
    );
  }, "Danh mục không hợp lệ"),
  collectionId: z.string().nullable(),
  colors: z.array(colorSchema)
});

type ProductFormValues = z.infer<typeof productSchema>;

// Thêm interface cho Collection
interface Collection {
  collectionId: string;
  collectionName: string;
}

// Thêm constant cho tất cả các size
const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Component cho bảng size của một màu
const ColorSizeTable = ({ 
  color, 
  variants, 
  setVariants, 
  index,
  form 
}: { 
  color: string;
  variants: ProductSize[];
  setVariants: (variants: ProductSize[]) => void;
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
          </tr>
        </thead>
        <tbody>
          {variants.map((sizeData, sizeIndex) => (
            <tr key={sizeData.size}>
              <td className="border p-2">{sizeData.size}</td>
              <td className="border p-2">
                <Input
                  type="number"
                  value={sizeData.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                    const updatedVariants = [...variants];
                    updatedVariants[sizeIndex] = {
                      ...updatedVariants[sizeIndex],
                      quantity: value
                    };
                    setVariants(updatedVariants);
                    form.setValue(`colors.${index}.sizes`, updatedVariants);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-2">
                <Input
                  type="number"
                  value={sizeData.discountPercentage || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    const updatedVariants = [...variants];
                    updatedVariants[sizeIndex] = {
                      ...updatedVariants[sizeIndex],
                      discountPercentage: value
                    };
                    setVariants(updatedVariants);
                    form.setValue(`colors.${index}.sizes`, updatedVariants);
                  }}
                  className="w-full"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Thêm interface cho dữ liệu tạm thời
interface TempVariant {
  color: string;
  productImages: string[];
  sizes: {
    size: string;
    quantity: number;
    soldQuantity: number;
    discountPercentage: number;
    active: boolean;
    newProduct: boolean;
    bestSeller: boolean;
  }[];
}

// Thêm interface cho response upload
interface FileUploadResponse {
  fileName: string | null;
  fileUrl: string;
  message: string;
}

// Add this interface near the top with other interfaces
interface VariantImageMap {
  [key: number]: {
    files: File[];
    previewUrls: string[];
  };
}

export default function AddProductPage() {
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [variants, setVariants] = useState<TempVariant[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [subImageUrl, setSubImageUrl] = useState<string>('');
  const [sizeChartUrl, setSizeChartUrl] = useState<string>('');
  const [variantImages, setVariantImages] = useState<VariantImageMap>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");

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
      colors: [],
    },
  });

  const addVariant = () => {
    const newVariant: TempVariant = {
      color: "",
      productImages: [],
      sizes: ALL_SIZES.map(size => ({
        size,
        quantity: 0,
        soldQuantity: 0,
        discountPercentage: 0,
        active: true,
        newProduct: true,
        bestSeller: false
      }))
    };
    
    setVariants([...variants, newVariant]);
    form.setValue("colors", [...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    // Log để debug
    console.log('Current variants before removing:', variants);
    
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    form.setValue("colors", newVariants);
    
    // Log để debug
    console.log('Updated variants after removing:', newVariants);
  };

  // Cập nhật hàm handleFileUpload
  const handleFileUpload = async (file: File, productName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', productName);

    try {
      const response = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: FileUploadResponse = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log('Form data before processing:', data);
      console.log('Current variants state:', variants);

      // 1. Upload main images first
      if (mainImageFile) {
        const mainImageUrl = await handleFileUpload(mainImageFile, data.name);
        data.mainImageUrl = mainImageUrl;
      }
      if (subImageFile) {
        const subImageUrl = await handleFileUpload(subImageFile, data.name);
        data.subImageUrl = subImageUrl;
      }
      if (sizeChartFile) {
        const sizeChartUrl = await handleFileUpload(sizeChartFile, data.name);
        data.sizeChartUrl = sizeChartUrl;
      }

      // 2. Process variants sequentially
      const processedColors = [];
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        console.log(`Processing variant ${i} with color ${variant.color}:`, variant);
        
        let uploadedImages: string[] = [];
        
        // Upload images for current variant
        if (variantImages[i]?.files.length > 0) {
          try {
            // Upload images one by one
            for (const file of variantImages[i].files) {
              const imageUrl = await handleFileUpload(file, data.name);
              uploadedImages.push(imageUrl);
            }
            console.log(`Successfully uploaded ${uploadedImages.length} images for variant ${i}`);
          } catch (error) {
            console.error(`Error uploading images for variant ${i}:`, error);
            throw new Error(`Failed to upload images for ${variant.color} variant`);
          }
        }

        // Create color object with sizes
        const colorData: ProductColor = {
          color: variant.color,
          productImages: uploadedImages,
          sizes: variant.sizes.map(size => ({
            ...size,
            active: true,
            newProduct: true,
            bestSeller: false
          }))
        };

        processedColors.push(colorData);
      }

      // Format request data
      const requestData: ProductDetail = {
        name: data.name,
        description: data.description,
        mainImageUrl: data.mainImageUrl,
        subImageUrl: data.subImageUrl,
        sizeChartUrl: data.sizeChartUrl,
        price: data.price,
        status: data.status,
        category: data.category,
        collectionId: selectedCollections[0]?.collectionId || null,
        colors: processedColors
      };

      console.log('Final request data:', requestData);

      // Send request to create product
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

      // Reset form and state
      form.reset();
      setSelectedCollections([]);
      setVariants([]);
      setMainImageFile(null);
      setSubImageFile(null);
      setSizeChartFile(null);
      setVariantImages({});
      
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
                  <div>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="Nhập giá"
                        list="price-suggestions"
                      />
                    </FormControl>
                    <datalist id="price-suggestions">
                      <option value="5000" />
                      <option value="50000" />
                      <option value="500000" />
                    </datalist>
                  </div>
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
                          {StatusDisplay[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          setSelectedMainCategory(value);
                          field.onChange(""); // Reset subcategory when main category changes
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục chính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ProductCategory).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedMainCategory && (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục phụ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ProductCategory[selectedMainCategory as keyof typeof ProductCategory].subCategories)
                              .map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                
                <FormField
                  control={form.control}
                  name={`colors.${index}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Màu sắc</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const updatedVariants = [...variants];
                          updatedVariants[index] = {
                            ...updatedVariants[index],
                            color: value,
                            sizes: ALL_SIZES.map(size => ({
                              size,
                              quantity: 0,
                              soldQuantity: 0,
                              discountPercentage: 0,
                              active: true,
                              newProduct: true,
                              bestSeller: false
                            }))
                          };
                          setVariants(updatedVariants);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn màu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(colorMapping)
                            .filter(([key, _]) => 
                              !variants.some((v, i) => i !== index && v.color === key)
                            )
                            .map(([key, hexCode]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300" 
                                    style={{ backgroundColor: hexCode }}
                                  />
                                  <span>{ColorDisplay[key]}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {variant.color && (
                  <ColorSizeTable
                    color={variant.color}
                    variants={variants[index].sizes}
                    setVariants={(updatedVariants) => setVariants(prev => [
                      ...prev.slice(0, index),
                      {
                        ...prev[index],
                        sizes: updatedVariants
                      },
                      ...prev.slice(index + 1)
                    ])}
                    index={index}
                    form={form}
                  />
                )}

                {/* Product Images for variant */}
                <FormField
                  control={form.control}
                  name={`colors.${index}.productImages`}
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
                              const previewUrls = files.map(file => URL.createObjectURL(file));
                              
                              // Lưu files và preview URLs vào state
                              setVariantImages(prev => ({
                                ...prev,
                                [index]: {
                                  files,
                                  previewUrls
                                }
                              }));
                              
                              // Cập nhật variant state với preview URLs
                              const updatedVariants = [...variants];
                              updatedVariants[index] = {
                                ...updatedVariants[index],
                                productImages: previewUrls
                              };
                              setVariants(updatedVariants);
                              
                              field.onChange(previewUrls);
                              console.log(`Images added to variant ${index}:`, files.map(file => file.name));
                            }}
                          />
                          <div className="grid grid-cols-4 gap-2">
                            {variantImages[index]?.previewUrls.map((previewUrl, imageIndex) => (
                              <div key={imageIndex} className="relative">
                                <Image
                                  src={previewUrl}
                                  alt={`Preview ${imageIndex}`}
                                  className="w-full h-24 object-cover rounded"
                                  width={100}
                                  height={100}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Remove the file and preview URL
                                    const newFiles = variantImages[index].files.filter((_, i) => i !== imageIndex);
                                    const newPreviewUrls = variantImages[index].previewUrls.filter((_, i) => i !== imageIndex);
                                    
                                    setVariantImages(prev => ({
                                      ...prev,
                                      [index]: {
                                        files: newFiles,
                                        previewUrls: newPreviewUrls
                                      }
                                    }));
                                    
                                    // Update variant state
                                    const updatedVariants = [...variants];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      productImages: newPreviewUrls
                                    };
                                    setVariants(updatedVariants);
                                    
                                    field.onChange(newPreviewUrls);
                                    console.log(`Image removed from variant ${index}:`, imageIndex);
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
