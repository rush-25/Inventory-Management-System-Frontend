
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
import { stockService, StockInDto } from '../services/stockService';
import { Search } from 'lucide-react';

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
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

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

  // Fetch stock in history
  const { data: history = [], isLoading: historyLoading } = useQuery<StockInDto[]>({
    queryKey: ['stockInHistory'],
    queryFn: stockService.getStockInHistory,
  });

  const filteredHistory = history.filter(h => {
    const q = search.toLowerCase();
    return (
      !q ||
      h.itemName?.toLowerCase().includes(q) ||
      h.supplierName?.toLowerCase().includes(q) ||
      String(h.stockInId).includes(q)
    );
  });

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
      qc.invalidateQueries({ queryKey: ['stockInHistory'] });
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add stock');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      {/* Stock In History */}
      <Card>
        <CardHeader title="Recent Stock In History" />
        <CardContent>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-slate-400">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No stock in records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock In ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">QTY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHistory.map(record => (
                    <tr key={record.stockInId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono">#{record.stockInId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{record.itemName ?? `Item #${record.itemId}`}</td>
                      <td className="px-4 py-3 text-slate-600">{record.supplierName ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-600">+{record.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">LKR {record.costPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        LKR {(record.quantity * record.costPrice).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(record.stockInDate).toLocaleDateString()}
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
