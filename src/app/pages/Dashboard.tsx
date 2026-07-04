import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import {
  Package, FolderTree, Truck, DollarSign, AlertCircle, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../services/stockService';

// ─── date formatter ───────────────────────────────────────────────────────────

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { products, categories, suppliers, stockBalances } = useAppContext();

  // stat card data — unchanged from original
  const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const lowStock = stockBalances.filter(b => b.stockStatus === 'Low Stock').length;
  const outOfStock = stockBalances.filter(b => b.stockStatus === 'Out of Stock').length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-100 text-blue-600', path: '/products' },
    { label: 'Categories', value: categories.length, icon: FolderTree, color: 'bg-indigo-100 text-indigo-600', path: '/categories' },
    { label: 'Suppliers', value: suppliers.length, icon: Truck, color: 'bg-purple-100 text-purple-600', path: '/suppliers' },
    { label: 'Inventory Value', value: `LKR ${totalValue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', path: '/reports' },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'bg-amber-100 text-amber-600', path: '/low-stock' },
    { label: 'Out of Stock', value: outOfStock, icon: AlertCircle, color: 'bg-red-100 text-red-600', path: '/low-stock' },
  ];

  // recent stock-in / stock-out histories
  const { data: stockInHistory = [], isLoading: loadingIn } = useQuery({
    queryKey: ['stockInHistory'],
    queryFn: stockService.getStockInHistory,
  });

  const { data: stockOutHistory = [], isLoading: loadingOut } = useQuery({
    queryKey: ['stockOutHistory'],
    queryFn: stockService.getStockOutHistory,
  });

  const recentIn = [...stockInHistory]
    .sort((a, b) => new Date(b.stockInDate).getTime() - new Date(a.stockInDate).getTime())
    .slice(0, 5);

  const recentOut = [...stockOutHistory]
    .sort((a, b) => new Date(b.stockOutDate).getTime() - new Date(a.stockOutDate).getTime())
    .slice(0, 5);

  const lowStockItems = stockBalances
    .filter(b => b.stockStatus === 'Low Stock' || b.stockStatus === 'Out of Stock')
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back to V2 Phone Arcade Inventory Management.</p>
      </div>

      {/* Stats Grid — original 6 cards, untouched */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <Link key={idx} to={stat.path} className="block group">
            <Card className="h-full transition-all hover:shadow-md hover:border-blue-200">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Stock In & Recent Stock Out — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Stock In */}
        <Card>
          <CardHeader
            title="Recent Stock In"
            action={
              <Link to="/stock-in" className="text-sm text-blue-600 font-medium hover:underline">
                View All
              </Link>
            }
          />
          <CardContent className="p-0">
            {/* column headers */}
            <div className="flex items-center px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <span className="flex-1">Item</span>
              <span className="w-16 text-right">Qty</span>
              <span className="w-24 text-right">Date</span>
            </div>

            {loadingIn ? (
              <p className="p-6 text-center text-sm text-slate-400">Loading…</p>
            ) : recentIn.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No stock-in records found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentIn.map(item => (
                  <div key={item.stockInId} className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Package size={15} />
                      </div>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {item.itemName ?? `Item #${item.itemId}`}
                      </span>
                    </div>
                    <span className="w-16 text-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      +{item.quantity}
                    </span>
                    <span className="w-24 text-right text-xs text-slate-400 whitespace-nowrap">
                      {fmt(item.stockInDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Out */}
        <Card>
          <CardHeader
            title="Recent Stock Out"
            action={
              <Link to="/stock-out" className="text-sm text-blue-600 font-medium hover:underline">
                View All
              </Link>
            }
          />
          <CardContent className="p-0">
            {/* column headers */}
            <div className="flex items-center px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <span className="flex-1">Item</span>
              <span className="w-16 text-right">Qty</span>
              <span className="w-24 text-right">Date</span>
            </div>

            {loadingOut ? (
              <p className="p-6 text-center text-sm text-slate-400">Loading…</p>
            ) : recentOut.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No stock-out records found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOut.map(item => (
                  <div key={item.stockOutId} className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Package size={15} />
                      </div>
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {item.itemName ?? `Item #${item.itemId}`}
                      </span>
                    </div>
                    <span className="w-16 text-center text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      -{item.quantity}
                    </span>
                    <span className="w-24 text-right text-xs text-slate-400 whitespace-nowrap">
                      {fmt(item.stockOutDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts — full width */}
      <Card>
        <CardHeader
          title="Low Stock Alerts"
          action={
            <Link to="/low-stock" className="text-sm text-blue-600 font-medium hover:underline">
              View All
            </Link>
          }
        />
        <CardContent className="p-0">
          {/* column headers */}
          <div className="flex items-center px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
            <span className="flex-1">Item</span>
            <span className="w-20 text-right">Stock</span>
            <span className="w-20 text-right">Reorder</span>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">🎉 All products are well stocked.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.map(item => (
                <div key={item.itemId} className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                      <AlertTriangle size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.itemName}</p>
                      {item.categoryName && (
                        <p className="text-xs text-slate-400">{item.categoryName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`w-20 text-right text-sm font-bold ${item.currentBalance === 0 ? 'text-red-600' : 'text-amber-500'}`}>
                    {item.currentBalance}
                  </span>
                  <span className="w-20 text-right text-sm text-slate-500 font-medium">
                    {item.reorderLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
