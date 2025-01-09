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

// Enum cho status và category
const ProductStatus = {
  AVAILABLE: "AVAILABLE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
} as const;

const ProductCategory = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
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

// Schema validation
const variantSchema = z.object({
  sku: z.string().min(1, "SKU là bắt buộc"),
  color: z.nativeEnum(ColorOptions),
  size: z.nativeEnum(SizeOptions),
  quantity: z.number().min(0),
  discountPercentage: z.number().min(0).max(100),
  productImages: z.array(z.string()),
});

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().min(1, "Mô tả sản phẩm là bắt buộc"),
  mainImageUrl: z.string().url("URL hình ảnh chính không hợp lệ"),
  subImageUrl: z.string().url("URL hình ảnh phụ không hợp lệ"),
  sizeChartUrl: z.string().url("URL bảng size không hợp lệ"),
  status: z.nativeEnum(ProductStatus),
  price: z.number().positive("Giá phải lớn hơn 0"),
  category: z.nativeEnum(ProductCategory),
  collectionIds: z.array(z.string()),
  variants: z.array(variantSchema),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Thêm interface cho Collection
interface Collection {
  id: string;
  name: string;
}

export default function AddProductPage() {
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

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
      collectionIds: [],
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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const requestData = {
        ...data,
        collections: data.collectionIds.map(id => ({
          id,
          name: availableCollections.find(c => c.id === id)?.name
        }))
      };

      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi thêm sản phẩm");
      }

      form.reset();
      setSelectedCollections([]);
      setVariants([]);
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
                  <FormLabel>URL hình ảnh chính</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>URL hình ảnh phụ</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>URL bảng size</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                const collection = availableCollections.find(c => c.id === value);
                if (collection && !selectedCollections.some(sc => sc.id === collection.id)) {
                  const newSelectedCollections = [...selectedCollections, collection];
                  setSelectedCollections(newSelectedCollections);
                  form.setValue("collectionIds", newSelectedCollections.map(c => c.id));
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
                    key={collection.id} 
                    value={collection.id}
                    disabled={selectedCollections.some(sc => sc.id === collection.id)}
                  >
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center gap-1 bg-secondary p-2 rounded"
                >
                  <span>{collection.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newSelectedCollections = selectedCollections.filter(
                        (sc) => sc.id !== collection.id
                      );
                      setSelectedCollections(newSelectedCollections);
                      form.setValue(
                        "collectionIds",
                        newSelectedCollections.map((c) => c.id)
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
                      <FormLabel>Hình ảnh sản phẩm (URLs)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập URL và nhấn Enter để thêm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.currentTarget;
                              if (input.value) {
                                const newImages = [...field.value, input.value];
                                field.onChange(newImages);
                                input.value = "";
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((url, imageIndex) => (
                          <div
                            key={imageIndex}
                            className="flex items-center gap-1 bg-secondary p-2 rounded"
                          >
                            <span className="truncate max-w-[200px]">{url}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = field.value.filter(
                                  (_, i) => i !== imageIndex
                                );
                                field.onChange(newImages);
                              }}
                              className="text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
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
