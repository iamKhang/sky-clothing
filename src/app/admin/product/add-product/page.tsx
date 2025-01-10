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
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
  productName?: string;
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
  color: z.string(),
  size: z.string(),
  quantity: z.number(),
  discountPercentage: z.number(),
  productImages: z.array(z.any()),
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
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;
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
          {ALL_SIZES.map((size, sizeIndex) => (
            <tr key={size}>
              <td className="border p-2">{size}</td>
              <td className="border p-2">
                <Input
                  type="number"
                  value={variants[index].sizes[sizeIndex]?.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                    const updatedVariants = [...variants];
                    updatedVariants[index].sizes[sizeIndex].quantity = value;
                    setVariants(updatedVariants);
                    form.setValue(`variants.${index}.sizes`, updatedVariants[index].sizes);
                  }}
                  className="w-full"
                />
              </td>
              <td className="border p-2">
                <Input
                  type="number"
                  value={variants[index].sizes[sizeIndex]?.discountPercentage || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    const updatedVariants = [...variants];
                    updatedVariants[index].sizes[sizeIndex].discountPercentage = value;
                    setVariants(updatedVariants);
                    form.setValue(`variants.${index}.sizes`, updatedVariants[index].sizes);
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
  sizes: {
    size: string;
    quantity: number;
    discountPercentage: number;
  }[];
  productImages: string[];
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
  const [variantImages, setVariantImages] = useState<{ [key: number]: File[] }>({});

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
    const newVariant: ProductVariant = {
      color: "",
      size: "",
      quantity: 0,
      discountPercentage: 0,
      productImages: []
    };
    
    console.log('Current variants before adding:', variants);
    setVariants([...variants, newVariant]);
    form.setValue("variants", [...variants, newVariant]);
    console.log('Updated variants after adding:', [...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    // Log để debug
    console.log('Current variants before removing:', variants);
    
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    form.setValue("variants", newVariants);
    
    // Log để debug
    console.log('Updated variants after removing:', newVariants);
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
      // Log toàn bộ form data trước khi xử lý
      console.log('Form data before processing:', data);
      console.log('Current variants state:', variants);

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

      // Chuyển đổi variants từ dạng bảng sang dạng API yêu cầu
      const processedVariants = await Promise.all(
        variants.flatMap(async (variant) => {
          console.log(`Processing variant with color ${variant.color}:`, variant);
          
          let uploadedImages: string[] = [];
          // Upload ảnh cho variant
          if (variantImages[variants.indexOf(variant)]?.length > 0) {
            const formData = new FormData();
            variantImages[variants.indexOf(variant)].forEach((file: File) => {
              formData.append('files', file);
            });

            try {
              const response = await fetch('http://localhost:8080/api/files/upload-multiple', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error('Failed to upload variant images');
              }

              const uploadedData = await response.json();
              uploadedImages = uploadedData.map((img: { fileUrl: string }) => img.fileUrl);
            } catch (error) {
              console.error('Error uploading variant images:', error);
              throw error;
            }
          }

          // Chuyển đổi mỗi size thành một variant riêng và trả về mảng phẳng
          return variant.sizes
            .filter(size => size.quantity > 0) // Chỉ lấy các size có số lượng > 0
            .map(size => ({
              color: variant.color,
              size: size.size,
              quantity: size.quantity,
              discountPercentage: size.discountPercentage,
              productImages: uploadedImages,
              productName: data.name
            }));
        })
      );

      // Làm phẳng mảng variants
      const flattenedVariants = processedVariants.flat();

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
        collectionId: selectedCollections[0]?.collectionId || null,
        variants: flattenedVariants // Sử dụng mảng phẳng
      };

      console.log('Final request data:', requestData);

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
                            color: value,
                            sizes: ALL_SIZES.map(size => ({
                              size,
                              quantity: 0,
                              discountPercentage: 0
                            }))
                          };
                          setVariants(updatedVariants);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn màu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ColorOptions)
                            .filter(([_, value]) => 
                              !variants.some((v, i) => i !== index && v.color === value)
                            )
                            .map(([key, value]) => (
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

                {variant.color && (
                  <ColorSizeTable
                    color={variant.color}
                    variants={variants}
                    setVariants={setVariants}
                    index={index}
                    form={form}
                  />
                )}

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
                              // Lưu files vào state variantImages
                              setVariantImages(prev => ({
                                ...prev,
                                [index]: files
                              }));
                              field.onChange(files);
                              
                              // Cập nhật variant state
                              const updatedVariants = [...variants];
                              updatedVariants[index] = {
                                ...updatedVariants[index],
                                productImages: files
                              };
                              setVariants(updatedVariants);
                              
                              console.log(`Images added to variant ${index}:`, files);
                            }}
                          />
                          <div className="grid grid-cols-4 gap-2">
                            {variantImages[index]?.map((file: File, imageIndex: number) => (
                              <div key={imageIndex} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${imageIndex}`}
                                  className="w-full h-24 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Xóa ảnh khỏi variantImages
                                    const newFiles = variantImages[index].filter((_, i) => i !== imageIndex);
                                    setVariantImages(prev => ({
                                      ...prev,
                                      [index]: newFiles
                                    }));
                                    
                                    // Cập nhật variant state
                                    const updatedVariants = [...variants];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      productImages: newFiles
                                    };
                                    setVariants(updatedVariants);
                                    
                                    field.onChange(newFiles);
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
