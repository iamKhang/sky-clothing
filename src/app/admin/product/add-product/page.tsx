'use client'

import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import { Plus, X } from 'lucide-react'

const colorOptions = [
  { label: 'Red', value: 'RED', hex: '#C62300' },
  { label: 'Green', value: 'GREEN', hex: '#3E7B27' },
  { label: 'Blue', value: 'BLUE', hex: '#81BFDA' },
  { label: 'Yellow', value: 'YELLOW', hex: '#FFB200' },
  { label: 'Black', value: 'BLACK', hex: '#2A3335' },
  { label: 'White', value: 'WHITE', hex: '#FFFFFF' },
  { label: 'Orange', value: 'ORANGE', hex: '#EB5B00' },
  { label: 'Pink', value: 'PINK', hex: '#D91656' },
] as const

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const
const categoryOptions = ['TOP', 'BOTTOM', 'OUTERWEAR', 'BAG', 'ACCESSORIES'] as const
const collectionOptions = ['Summer Collection', 'Winter Collection', 'Spring Collection', 'Fall Collection'] as const

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  mainImageUrl: z.string().url('Invalid URL for main image').optional(),
  subImageUrl: z.string().url('Invalid URL for sub image').optional(),
  sizeChartUrl: z.string().url('Invalid URL for size chart').optional(),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'COMING_SOON']),
  price: z.number().positive('Price must be positive'),
  category: z.enum(categoryOptions),
  collections: z.array(z.string()).min(1, 'Select at least one collection'),
  variants: z.array(z.object({
    color: z.enum(colorOptions.map(c => c.value)),
    images: z.array(z.string().url('Invalid image URL')),
    sizes: z.array(z.object({
      size: z.enum(sizeOptions),
      quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
      discountPercentage: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
    })).min(1, 'At least one size is required'),
  })).min(1, 'At least one variant is required'),
})

type ProductFormData = z.infer<typeof productSchema>

export default function AddProductPage() {
  const [isUploading, setIsUploading] = useState(false)

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'AVAILABLE',
      variants: [],
      collections: [],
    }
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })

  const onSubmit = (data: ProductFormData) => {
    console.log(data)
    // Here you would typically send this data to your API
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        // For demonstration, we're using a placeholder URL
        setValue(field, URL.createObjectURL(file))
      } catch (error) {
        console.error('Error uploading image:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Enter the details for the new product</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register('description')} />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                            <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Collections</Label>
                  <div className="flex flex-wrap gap-2">
                    {collectionOptions.map((collection) => (
                      <div key={collection} className="flex items-center space-x-2">
                        <Controller
                          name="collections"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={collection}
                              checked={field.value?.includes(collection)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, collection])
                                  : field.onChange(field.value?.filter((value) => value !== collection))
                              }}
                            />
                          )}
                        />
                        <label htmlFor={collection} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{collection}</label>
                      </div>
                    ))}
                  </div>
                  {errors.collections && <p className="text-red-500 text-sm">{errors.collections.message}</p>}
                </div>
              </TabsContent>
              <TabsContent value="images" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainImageUrl">Main Image</Label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'mainImageUrl')} 
                      disabled={isUploading} 
                    />
                    {watch('mainImageUrl') && (
                      <div className="mt-2">
                        <Image src={watch('mainImageUrl')} alt="Main product image" width={200} height={200} className="object-cover rounded" />
                      </div>
                    )}
                    {errors.mainImageUrl && <p className="text-red-500 text-sm">{errors.mainImageUrl.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subImageUrl">Sub Image</Label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'subImageUrl')} 
                      disabled={isUploading} 
                    />
                    {watch('subImageUrl') && (
                      <div className="mt-2">
                        <Image src={watch('subImageUrl')} alt="Sub product image" width={200} height={200} className="object-cover rounded" />
                      </div>
                    )}
                    {errors.subImageUrl && <p className="text-red-500 text-sm">{errors.subImageUrl.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizeChartUrl">Size Chart URL</Label>
                  <Input id="sizeChartUrl" {...register('sizeChartUrl')} />
                  {errors.sizeChartUrl && <p className="text-red-500 text-sm">{errors.sizeChartUrl.message}</p>}
                </div>
              </TabsContent>
              <TabsContent value="variants" className="space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {variantFields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Color Variant {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Controller
                            name={`variants.${index}.color`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colorOptions.map((color) => (
                                    <SelectItem key={color.value} value={color.value}>
                                      <div className="flex items-center space-x-2">
                                        <span>{color.label}</span>
                                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: color.hex }}></span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Images</Label>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const currentImages = watch(`variants.${index}.images`) || [];
                                  setValue(`variants.${index}.images`, [...currentImages, reader.result as string]);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            disabled={isUploading} 
                            multiple
                          />
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <Controller
                              name={`variants.${index}.images`}
                              control={control}
                              render={({ field }) => (
                                <>
                                  {field.value?.map((image, imgIndex) => (
                                    <div key={imgIndex} className="relative">
                                      <Image src={image} alt={`Variant image ${imgIndex + 1}`} width={100} height={100} className="object-cover rounded" />
                                      <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="icon"
                                        className="absolute top-0 right-0 h-6 w-6" 
                                        onClick={() => {
                                          const newImages = [...field.value];
                                          newImages.splice(imgIndex, 1);
                                          field.onChange(newImages);
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Sizes</Label>
                          <Controller
                            name={`variants.${index}.sizes`}
                            control={control}
                            render={({ field }) => (
                              <div className="space-y-2">
                                {field.value?.map((size, sizeIndex) => (
                                  <div key={sizeIndex} className="flex items-center space-x-2">
                                    <Select
                                      value={size.size}
                                      onValueChange={(value) => {
                                        const newSizes = [...field.value];
                                        newSizes[sizeIndex].size = value;
                                        field.onChange(newSizes);
                                      }}
                                    >
                                      <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Size" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sizeOptions.map((sizeOption) => (
                                          <SelectItem key={sizeOption} value={sizeOption}>{sizeOption}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="number"
                                      placeholder="Quantity"
                                      value={size.quantity}
                                      onChange={(e) => {
                                        const newSizes = [...field.value];
                                        newSizes[sizeIndex].quantity = parseInt(e.target.value);
                                        field.onChange(newSizes);
                                      }}
                                      className="w-[100px]"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Discount %"
                                      value={size.discountPercentage}
                                      onChange={(e) => {
                                        const newSizes = [...field.value];
                                        newSizes[sizeIndex].discountPercentage = parseFloat(e.target.value);
                                        field.onChange(newSizes);
                                      }}
                                      className="w-[100px]"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        const newSizes = field.value.filter((_, i) => i !== sizeIndex);
                                        field.onChange(newSizes);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange([
                                      ...field.value,
                                      { size: sizeOptions[0], quantity: 0, discountPercentage: 0 }
                                    ]);
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Add Size
                                </Button>
                              </div>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="button" variant="destructive" onClick={() => removeVariant(index)}>
                          Remove Variant
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </ScrollArea>
                <Button
                  type="button"
                  onClick={() => 
                    appendVariant({ 
                      color: colorOptions[0].value, 
                      images: [], 
                      sizes: [{ size: sizeOptions[0], quantity: 0, discountPercentage: 0 }]
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Color Variant
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button type="submit">Add Product</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

