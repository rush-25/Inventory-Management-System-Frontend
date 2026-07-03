
import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const stockInSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  remarks: z.string().optional()
});

type StockInFormData = z.infer<typeof stockInSchema>;

export function StockIn() {
  const { suppliers, products, addStockIn } = useAppContext();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<StockInFormData>({
    resolver: zodResolver(stockInSchema) as any,
    defaultValues: { date: new Date().toISOString().split('T')[0] }
  });

  const selectedSupplierId = watch('supplierId');
  const selectedProductId = watch('productId');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Filter products by selected supplier
  const availableProducts = selectedSupplierId 
    ? products.filter(p => p.supplierId === selectedSupplierId)
    : products;

  const onSubmit = async (data: StockInFormData) => {
    try {
      await addStockIn({
        productId: data.productId,
        supplierId: data.supplierId,
        quantity: data.quantity,
        costPrice: data.costPrice,
        date: data.date,
      });
      toast.success('Stock added successfully');
      reset();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add stock');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stock In</h1>
        <p className="text-slate-500 mt-1">Receive new inventory from suppliers.</p>
      </div>

      <Card>
        <CardHeader title="New Stock Entry" />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Supplier"
                options={suppliers.filter(s => s.status === 'Active').map(s => ({ label: s.name, value: s.id }))}
                {...register('supplierId')}
                error={errors.supplierId?.message}
              />

              <Select
                label="Product"
                options={availableProducts.filter(p => p.status === 'Active').map(p => ({ label: `${p.productCode} - ${p.name}`, value: p.id }))}
                {...register('productId')}
                error={errors.productId?.message}
                disabled={!selectedSupplierId}
              />

              <Input 
                type="number" 
                label="Quantity" 
                {...register('quantity')} 
                error={errors.quantity?.message} 
              />

              <Input 
                type="number" 
                step="0.01" 
                label="Unit Cost Price" 
                {...register('costPrice')} 
                error={errors.costPrice?.message} 
              />

              <Input 
                type="date" 
                label="Stock In Date" 
                {...register('date')} 
                error={errors.date?.message} 
              />

              <Input 
                label="Remarks (Optional)" 
                placeholder="e.g. PO-12345"
                {...register('remarks')} 
                error={errors.remarks?.message} 
              />
            </div>

            {selectedProduct && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Current Stock Preview</p>
                  <p className="text-2xl font-bold text-blue-700">{selectedProduct.stockQuantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-900">After Stock In</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedProduct.stockQuantity + (watch('quantity') || 0)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
              <Button type="submit">Save Stock In</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
