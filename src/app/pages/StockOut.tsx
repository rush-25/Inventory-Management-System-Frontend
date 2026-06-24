
import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const stockOutSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  reason: z.enum(['Sale', 'Damage', 'Internal Use', 'Return']),
  date: z.string().min(1, 'Date is required')
});

type StockOutFormData = z.infer<typeof stockOutSchema>;

export function StockOut() {
  const { products, addStockMovement } = useAppContext();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setError } = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema) as any,
    defaultValues: { date: new Date().toISOString().split('T')[0], reason: 'Sale' }
  });

  const selectedProductId = watch('productId');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const onSubmit = (data: StockOutFormData) => {
    if (selectedProduct && data.quantity > selectedProduct.stockQuantity) {
      setError('quantity', { message: 'Quantity exceeds available stock' });
      return;
    }

    addStockMovement({
      type: 'OUT',
      productId: data.productId,
      quantity: data.quantity,
      date: data.date,
      reason: data.reason
    });
    toast.success('Stock deducted successfully');
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stock Out</h1>
        <p className="text-slate-500 mt-1">Record sales, damages or returns.</p>
      </div>

      <Card>
        <CardHeader title="Deduct Stock" />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Product"
                className="md:col-span-2"
                options={products.filter(p => p.status === 'Active' && p.stockQuantity > 0).map(p => ({ label: `${p.productCode} - ${p.name} (Stock: ${p.stockQuantity})`, value: p.id }))}
                {...register('productId')}
                error={errors.productId?.message}
              />

              <Input 
                type="number" 
                label="Quantity" 
                {...register('quantity')} 
                error={errors.quantity?.message} 
              />

              <Select
                label="Reason"
                options={[
                  { label: 'Sale', value: 'Sale' },
                  { label: 'Damage', value: 'Damage' },
                  { label: 'Internal Use', value: 'Internal Use' },
                  { label: 'Return', value: 'Return' }
                ]}
                {...register('reason')}
                error={errors.reason?.message}
              />

              <Input 
                type="date" 
                label="Date" 
                className="md:col-span-2"
                {...register('date')} 
                error={errors.date?.message} 
              />
            </div>

            {selectedProduct && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-900">Current Stock</p>
                  <p className="text-2xl font-bold text-amber-700">{selectedProduct.stockQuantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-900">After Stock Out</p>
                  <p className={`text-2xl font-bold ${selectedProduct.stockQuantity - (watch('quantity') || 0) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedProduct.stockQuantity - (watch('quantity') || 0)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
              <Button type="submit">Save Stock Out</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
