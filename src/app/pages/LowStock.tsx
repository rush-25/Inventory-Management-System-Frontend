import { useAppContext } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download } from 'lucide-react';
import { Link } from 'react-router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function LowStock() {
  const { stockBalances, stockLoading } = useAppContext();

  const lowStockItems = stockBalances.filter(
    b => b.stockStatus === 'Low Stock' || b.stockStatus === 'Out of Stock'
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Low Stock Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 34,
      head: [['Code', 'Item Name', 'Category', 'Current Stock', 'Reorder Level', 'Deficit', 'Status']],
      body: lowStockItems.map(b => [
        b.itemCode,
        b.itemName,
        b.categoryName ?? '',
        b.currentBalance,
        b.reorderLevel,
        Math.max(0, b.reorderLevel - b.currentBalance),
        b.stockStatus,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save('low-stock-report.pdf');
  };

  if (stockLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Loading stock data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alert</h1>
          <p className="text-slate-500 mt-1">Products that have reached or fallen below their reorder level.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
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
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-center">Reorder Level</th>
                  <th className="px-6 py-4 text-center">Deficit</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.map(b => (
                  <tr key={b.itemId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{b.itemCode}</td>
                    <td className="px-6 py-4">{b.itemName}</td>
                    <td className="px-6 py-4">{b.categoryName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${b.currentBalance === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {b.currentBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{b.reorderLevel}</td>
                    <td className="px-6 py-4 text-center font-medium text-red-600">
                      {Math.max(0, b.reorderLevel - b.currentBalance)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/stock-in">
                        <Button size="sm" variant="outline">Order</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
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
