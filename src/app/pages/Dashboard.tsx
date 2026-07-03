import { useAppContext } from '../store/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  Package, FolderTree, Truck, DollarSign, AlertCircle, AlertTriangle, ArrowDownToLine
} from 'lucide-react';
import { Link } from 'react-router';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { useMemo } from 'react';

export function Dashboard() {
  const { products, categories, suppliers, stockBalances } = useAppContext();

  const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const lowStock = stockBalances.filter(b => b.stockStatus === 'Low Stock').length;
  const outOfStock = stockBalances.filter(b => b.stockStatus === 'Out of Stock').length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-100 text-blue-600', path: '/products' },
    { label: 'Categories', value: categories.length, icon: FolderTree, color: 'bg-indigo-100 text-indigo-600', path: '/categories' },
    { label: 'Suppliers', value: suppliers.length, icon: Truck, color: 'bg-purple-100 text-purple-600', path: '/suppliers' },
    { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', path: '/reports' },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'bg-amber-100 text-amber-600', path: '/low-stock' },
    { label: 'Out of Stock', value: outOfStock, icon: AlertCircle, color: 'bg-red-100 text-red-600', path: '/low-stock' },
  ];

  const monthlyMovementData = useMemo(() => {
    // Generate mock data for the chart since real data might be sparse
    return [
      { id: '1', name: 'Jan', in: 400, out: 240 },
      { id: '2', name: 'Feb', in: 300, out: 139 },
      { id: '3', name: 'Mar', in: 200, out: 980 },
      { id: '4', name: 'Apr', in: 278, out: 390 },
      { id: '5', name: 'May', in: 189, out: 480 },
      { id: '6', name: 'Jun', in: 239, out: 380 },
      { id: '7', name: 'Jul', in: 349, out: 430 },
    ];
  }, []);

  const valueTrendData = useMemo(() => {
    return [
      { id: '1', name: 'Week 1', value: 24000 },
      { id: '2', name: 'Week 2', value: 22000 },
      { id: '3', name: 'Week 3', value: 26000 },
      { id: '4', name: 'Week 4', value: 31000 },
    ];
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back to V2 Phone Arcade Inventory Management.</p>
      </div>

      {/* Stats Grid */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Monthly Stock Movement" />
          <CardContent>
            <div className="h-72 w-full min-h-[288px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                <BarChart id="monthly-movement" data={monthlyMovementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="in" name="Stock In" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="out" name="Stock Out" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Inventory Value Trend" />
          <CardContent>
            <div className="h-72 w-full min-h-[288px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={288}>
                <LineChart id="value-trend" data={valueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`$${value}`, 'Value']} />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Low Stock Items" action={<Link to="/stock-in" className="text-sm text-blue-600 font-medium hover:underline">Stock In</Link>} />
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {products.filter(p => p.stockQuantity <= p.reorderLevel).slice(0, 5).map(product => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <ArrowDownToLine size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.productCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">{product.stockQuantity} left</p>
                  </div>
                </div>
              ))}
              {products.filter(p => p.stockQuantity <= p.reorderLevel).length === 0 && (
                <p className="p-4 text-sm text-slate-400">All products well stocked.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Low Stock Alerts" action={<Link to="/low-stock" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>} />
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {products.filter(p => p.stockQuantity <= p.reorderLevel).slice(0, 5).map(product => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.stockQuantity} Left
                    </p>
                    <p className="text-xs text-slate-400">Reorder: {product.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
