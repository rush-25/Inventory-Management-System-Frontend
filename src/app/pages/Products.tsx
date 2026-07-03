import { useState } from 'react';
import { useAppContext, Product } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const productSchema = z.object({
  productCode: z.string().min(2, 'Required'),
  barcode: z.string().min(2, 'Required'),
  name: z.string().min(2, 'Required'),
  brand: z.string().min(2, 'Required'),
  categoryId: z.string().min(1, 'Required'),
  supplierId: z.string().min(1, 'Required'),
  costPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0),
  imageUrl: z.string().url('Must be a valid URL'),
  status: z.enum(['Active', 'Inactive'])
});

type ProductFormData = z.infer<typeof productSchema>;

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'OnePlus'];

export function Products() {
  const { products, categories, suppliers, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useReactHookForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { status: 'Active', costPrice: 0, sellingPrice: 0, reorderLevel: 10 }
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    reset({ 
      productCode: `PRD-${String(products.length + 1).padStart(3, '0')}`,
      barcode: '', name: '', brand: 'Apple', categoryId: '', supplierId: '', 
      costPrice: 0, sellingPrice: 0, reorderLevel: 10, imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80', status: 'Active' 
    });
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setValue('productCode', product.productCode);
    setValue('barcode', product.barcode);
    setValue('name', product.name);
    setValue('brand', product.brand);
    setValue('categoryId', product.categoryId);
    setValue('supplierId', product.supplierId);
    setValue('costPrice', product.costPrice);
    setValue('sellingPrice', product.sellingPrice);
    setValue('reorderLevel', product.reorderLevel);
    setValue('imageUrl', product.imageUrl);
    setValue('status', product.status);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success('Product updated successfully');
      } else {
        await addProduct(data as any);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage inventory items, pricing, and stock.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, barcode or code..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[1200px]">
              <thead className="bg-slate-50 text-slate-900 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3">Code / Barcode</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Price (Cost / Sell)</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const cat = categories.find(c => c.id === product.categoryId);
                  const sup = suppliers.find(s => s.id === product.supplierId);
                  
                  return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{product.productCode}</div>
                      <div className="text-xs text-slate-500">{product.barcode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover border border-slate-200" />
                        <div>
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{cat?.name}</td>
                    <td className="px-4 py-3">{sup?.name}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-500">${product.costPrice}</div>
                      <div className="font-medium text-slate-900">${product.sellingPrice}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${product.stockQuantity <= product.reorderLevel ? (product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600') : 'text-emerald-600'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )})}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Product Code" {...register('productCode')} error={errors.productCode?.message} />
            <Input label="Barcode" {...register('barcode')} error={errors.barcode?.message} />
            
            <Input label="Product Name" className="md:col-span-2" {...register('name')} error={errors.name?.message} />
            
            <Select
              label="Brand"
              options={BRANDS.map(b => ({ label: b, value: b }))}
              {...register('brand')}
              error={errors.brand?.message}
            />
            
            <Select
              label="Category"
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              {...register('categoryId')}
              error={errors.categoryId?.message}
            />
            
            <Select
              label="Supplier"
              className="md:col-span-2"
              options={suppliers.map(s => ({ label: s.name, value: s.id }))}
              {...register('supplierId')}
              error={errors.supplierId?.message}
            />
            
            <Input type="number" step="0.01" label="Cost Price" {...register('costPrice')} error={errors.costPrice?.message} />
            <Input type="number" step="0.01" label="Selling Price" {...register('sellingPrice')} error={errors.sellingPrice?.message} />
            
            <Input type="number" label="Reorder Level" {...register('reorderLevel')} error={errors.reorderLevel?.message} />
            <Select
              label="Status"
              options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]}
              {...register('status')}
              error={errors.status?.message}
            />
            
            <Input label="Product Image URL" className="md:col-span-2" {...register('imageUrl')} error={errors.imageUrl?.message} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
