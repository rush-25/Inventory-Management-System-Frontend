import { useAppContext } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileText } from 'lucide-react';
import { Link } from 'react-router';

export function LowStock() {
  const { products, categories, suppliers } = useAppContext();

  const lowStockProducts = products.filter(p => p.stockQuantity <= p.reorderLevel);

  const handleExport = (type: string) => {
    alert(`Exporting as ${type}... (Mock functionality)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alert</h1>
          <p className="text-slate-500 mt-1">Products that have reached or fallen below their reorder level.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport('Excel')}>
            <FileText className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('PDF')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-red-50 text-slate-900 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-center">Reorder Level</th>
                  <th className="px-6 py-4 text-center">Deficit</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockProducts.map(product => {
                  const cat = categories.find(c => c.id === product.categoryId);
                  const sup = suppliers.find(s => s.id === product.supplierId);
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.productCode}</td>
                      <td className="px-6 py-4">{product.name}</td>
                      <td className="px-6 py-4">{cat?.name}</td>
                      <td className="px-6 py-4">{sup?.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{product.reorderLevel}</td>
                      <td className="px-6 py-4 text-center font-medium text-red-600">
                        {product.reorderLevel - product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to="/stock-in">
                          <Button size="sm" variant="outline">Order</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      All products are sufficiently stocked.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
