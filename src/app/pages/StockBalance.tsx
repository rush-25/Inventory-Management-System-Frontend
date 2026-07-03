import { useAppContext } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Printer, Search } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function StockBalance() {
  const { stockBalances, stockLoading } = useAppContext();
  const [search, setSearch] = useState('');

  const filtered = stockBalances.filter(b =>
    b.itemName.toLowerCase().includes(search.toLowerCase()) ||
    b.itemCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Stock Balance Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 34,
      head: [['Code', 'Item Name', 'Category', 'Total In', 'Total Out', 'Balance', 'Status']],
      body: filtered.map(b => [
        b.itemCode,
        b.itemName,
        b.categoryName ?? '',
        b.totalStockIn,
        b.totalStockOut,
        b.currentBalance,
        b.stockStatus,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save('stock-balance.pdf');
  };

  const statusBadge = (status: string) => {
    if (status === 'Out of Stock') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    if (status === 'Low Stock') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low Stock</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Good Stock</span>;
  };

  if (stockLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading stock data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Balance</h1>
          <p className="text-slate-500 mt-1">Real-time inventory levels across all products.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Total In</th>
                  <th className="px-6 py-4 text-center">Total Out</th>
                  <th className="px-6 py-4 text-center">Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(b => (
                  <tr key={b.itemId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{b.itemCode}</td>
                    <td className="px-6 py-4">{b.itemName}</td>
                    <td className="px-6 py-4">{b.categoryName}</td>
                    <td className="px-6 py-4 text-center text-blue-600">{b.totalStockIn}</td>
                    <td className="px-6 py-4 text-center text-amber-600">{b.totalStockOut}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{b.currentBalance}</td>
                    <td className="px-6 py-4 text-center">{statusBadge(b.stockStatus)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No items found.</td>
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
