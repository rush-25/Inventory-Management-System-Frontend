
import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { stockService, StockOutDto } from '../services/stockService';
import { Search } from 'lucide-react';

const stockOutSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  reason: z.enum(['Sale', 'Damage', 'Internal Use', 'Return']),
  date: z.string().min(1, 'Date is required')
});

type StockOutFormData = z.infer<typeof stockOutSchema>;

const reasonColors: Record<string, string> = {
  Sale: 'bg-emerald-100 text-emerald-700',
  Damage: 'bg-red-100 text-red-700',
  'Internal Use': 'bg-blue-100 text-blue-700',
  Return: 'bg-amber-100 text-amber-700',
};

export function StockOut() {
  const { products, addStockOut } = useAppContext();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, watch, setError } = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema) as any,
    defaultValues: { date: new Date().toISOString().split('T')[0], reason: 'Sale' }
  });

  const selectedProductId = watch('productId');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Fetch stock out history
  const { data: history = [], isLoading: historyLoading } = useQuery<StockOutDto[]>({
    queryKey: ['stockOutHistory'],
    queryFn: stockService.getStockOutHistory,
  });

  const filteredHistory = history.filter(h => {
    const q = search.toLowerCase();
    return (
      !q ||
      h.itemName?.toLowerCase().includes(q) ||
      h.reason?.toLowerCase().includes(q) ||
      String(h.stockOutId).includes(q)
    );
  });

  const onSubmit = async (data: StockOutFormData) => {
    if (selectedProduct && data.quantity > selectedProduct.stockQuantity) {
      setError('quantity', { message: 'Quantity exceeds available stock' });
      return;
    }

    try {
      await addStockOut({
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason,
        date: data.date,
      });
      toast.success('Stock deducted successfully');
      reset();
      qc.invalidateQueries({ queryKey: ['stockOutHistory'] });
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to deduct stock');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      {/* Stock Out History */}
      <Card>
        <CardHeader title="Recent Stock Out History" />
        <CardContent>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-slate-400">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No stock out records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Out ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">QTY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHistory.map(record => (
                    <tr key={record.stockOutId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono">#{record.stockOutId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{record.itemName ?? `Item #${record.itemId}`}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-red-500">-{record.quantity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reasonColors[record.reason] ?? 'bg-slate-100 text-slate-700'}`}>
                          {record.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(record.stockOutDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-right text-xs text-slate-400">{filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
