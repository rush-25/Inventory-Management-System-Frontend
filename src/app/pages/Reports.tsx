import { Card, CardContent } from '../components/ui/Card';
import { FileBarChart, ArrowDownToLine, Layers, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Reports() {
  const reportTypes = [
    { title: 'Inventory Summary', icon: FileBarChart, desc: 'Overall snapshot of inventory value, stock levels, and product distribution.', color: 'text-blue-600 bg-blue-100' },
    { title: 'Stock Movement', icon: Layers, desc: 'Detailed log of all stock in and out transactions with dates and reasons.', color: 'text-indigo-600 bg-indigo-100' },
    { title: 'Product Wise Report', icon: ArrowDownToLine, desc: 'Individual product performance, history, and current stock status.', color: 'text-emerald-600 bg-emerald-100' },
    { title: 'Supplier Wise Report', icon: Users, desc: 'Stock received categorized by suppliers along with cost analysis.', color: 'text-purple-600 bg-purple-100' },
    { title: 'Low Stock Report', icon: AlertTriangle, desc: 'List of all products below minimum threshold requiring reorder.', color: 'text-amber-600 bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Generate and export detailed system reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, idx) => (
          <Card key={idx} className="hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.title}</h3>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{report.desc}</p>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">Generate Report</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
