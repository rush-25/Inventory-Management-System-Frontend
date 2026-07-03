import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { FileBarChart, ArrowDownToLine, Layers, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../store/AppContext';
import { stockService } from '../services/stockService';
import { itemService } from '../services/itemService';
import { supplierService } from '../services/supplierService';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'inventory-summary' | 'stock-movement' | 'product-wise' | 'supplier-wise' | 'low-stock';

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`V2 Phone Arcade — Generated: ${new Date().toLocaleString()}`, 14, 24);
  doc.setTextColor(0, 0, 0);
};

export function Reports() {
  const { products } = useAppContext();
  const [loading, setLoading] = useState<ReportType | null>(null);

  const generate = async (type: ReportType) => {
    setLoading(type);
    try {
      switch (type) {
        case 'inventory-summary': await generateInventorySummary(); break;
        case 'stock-movement': await generateStockMovement(); break;
        case 'product-wise': await generateProductWise(); break;
        case 'supplier-wise': await generateSupplierWise(); break;
        case 'low-stock': await generateLowStock(); break;
      }
      toast.success('PDF report downloaded!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to generate report');
    } finally {
      setLoading(null);
    }
  };

  // ── 1. Inventory Summary ────────────────────────────────────────────────────
  const generateInventorySummary = async () => {
    const balances = await stockService.getBalance();
    const doc = new jsPDF();
    addHeader(doc, 'Inventory Summary Report');

    const totalItems = balances.length;
    const totalValue = products.reduce((s, p) => s + p.stockQuantity * p.costPrice, 0);
    const lowStockCount = balances.filter(b => b.stockStatus === 'Low Stock').length;
    const outOfStockCount = balances.filter(b => b.stockStatus === 'Out of Stock').length;
    const goodStockCount = balances.filter(b => b.stockStatus === 'Good Stock').length;

    // Summary box
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 38);
    const summaryRows = [
      ['Total Items', String(totalItems)],
      ['Total Inventory Value', `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['Good Stock Items', String(goodStockCount)],
      ['Low Stock Items', String(lowStockCount)],
      ['Out of Stock Items', String(outOfStockCount)],
    ];
    autoTable(doc, {
      startY: 42,
      head: [['Metric', 'Value']],
      body: summaryRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 1: { fontStyle: 'bold' } },
    });

    // Detail table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Code', 'Item Name', 'Category', 'In', 'Out', 'Balance', 'Status']],
      body: balances.map(b => [b.itemCode, b.itemName, b.categoryName ?? '', b.totalStockIn, b.totalStockOut, b.currentBalance, b.stockStatus]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 65, 85] },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          const val = String(data.cell.text);
          if (val === 'Out of Stock') data.cell.styles.textColor = [220, 38, 38];
          if (val === 'Low Stock') data.cell.styles.textColor = [217, 119, 6];
          if (val === 'Good Stock') data.cell.styles.textColor = [22, 163, 74];
        }
      },
    });

    doc.save('inventory-summary.pdf');
  };

  // ── 2. Stock Movement ───────────────────────────────────────────────────────
  const generateStockMovement = async () => {
    const balances = await stockService.getBalance();
    const doc = new jsPDF({ orientation: 'landscape' });
    addHeader(doc, 'Stock Movement Report');

    autoTable(doc, {
      startY: 34,
      head: [['Code', 'Item Name', 'Category', 'Total In', 'Total Out', 'Net Balance', 'Reorder Level', 'Status']],
      body: balances.map(b => [
        b.itemCode,
        b.itemName,
        b.categoryName ?? '',
        b.totalStockIn,
        b.totalStockOut,
        b.currentBalance,
        b.reorderLevel,
        b.stockStatus,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save('stock-movement-report.pdf');
  };

  // ── 3. Product Wise ─────────────────────────────────────────────────────────
  const generateProductWise = async () => {
    const items = await itemService.getAll();
    const balances = await stockService.getBalance();
    const balMap = new Map(balances.map(b => [b.itemId, b]));
    const doc = new jsPDF({ orientation: 'landscape' });
    addHeader(doc, 'Product Wise Report');

    autoTable(doc, {
      startY: 34,
      head: [['Code', 'Barcode', 'Item Name', 'Brand', 'Category', 'Supplier', 'Cost', 'Selling', 'Balance', 'Reorder', 'Status']],
      body: items.map(i => {
        const b = balMap.get(i.itemId);
        return [
          i.itemCode,
          i.barcode ?? '',
          i.itemName,
          i.brand ?? '',
          i.categoryName ?? '',
          i.supplierName ?? '',
          `$${i.costPrice}`,
          `$${i.sellingPrice}`,
          b?.currentBalance ?? 0,
          i.reorderLevel,
          b?.stockStatus ?? '',
        ];
      }),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [5, 150, 105] },
    });

    doc.save('product-wise-report.pdf');
  };

  // ── 4. Supplier Wise ────────────────────────────────────────────────────────
  const generateSupplierWise = async () => {
    const suppliersData = await supplierService.getAll();
    const balances = await stockService.getBalance();
    const items = await itemService.getAll();

    const doc = new jsPDF();
    addHeader(doc, 'Supplier Wise Report');

    let startY = 34;

    for (const supplier of suppliersData) {
      const supplierItems = items.filter(i => i.supplierId === supplier.supplierId);
      if (supplierItems.length === 0) continue;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`${supplier.supplierName} — ${supplier.contactNumber ?? ''} — ${supplier.email ?? ''}`, 14, startY);
      doc.setTextColor(0, 0, 0);

      const balMap = new Map(balances.map(b => [b.itemId, b]));
      const totalCost = supplierItems.reduce((sum, i) => {
        const b = balMap.get(i.itemId);
        return sum + (b?.totalStockIn ?? 0) * i.costPrice;
      }, 0);

      autoTable(doc, {
        startY: startY + 4,
        head: [['Code', 'Item Name', 'Cost Price', 'Stock In', 'Total Cost', 'Balance']],
        body: supplierItems.map(i => {
          const b = balMap.get(i.itemId);
          return [
            i.itemCode,
            i.itemName,
            `$${i.costPrice}`,
            b?.totalStockIn ?? 0,
            `$${((b?.totalStockIn ?? 0) * i.costPrice).toFixed(2)}`,
            b?.currentBalance ?? 0,
          ];
        }),
        foot: [['', 'Total Procurement Cost', '', '', `$${totalCost.toFixed(2)}`, '']],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [124, 58, 237] },
        footStyles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
      });

      startY = (doc as any).lastAutoTable.finalY + 12;

      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
    }

    doc.save('supplier-wise-report.pdf');
  };

  // ── 5. Low Stock ────────────────────────────────────────────────────────────
  const generateLowStock = async () => {
    const balances = await stockService.getLowStock();
    const doc = new jsPDF();
    addHeader(doc, 'Low Stock Report');

    autoTable(doc, {
      startY: 34,
      head: [['Code', 'Item Name', 'Category', 'Current Stock', 'Reorder Level', 'Deficit', 'Status']],
      body: balances.map(b => [
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
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === 'body') {
          const val = String(data.cell.text);
          if (val === 'Out of Stock') data.cell.styles.textColor = [220, 38, 38];
          if (val === 'Low Stock') data.cell.styles.textColor = [217, 119, 6];
        }
      },
    });

    doc.save('low-stock-report.pdf');
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const reportTypes = [
    {
      id: 'inventory-summary' as ReportType,
      title: 'Inventory Summary',
      icon: FileBarChart,
      desc: 'Overall snapshot of inventory value, stock levels, and product distribution.',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      id: 'stock-movement' as ReportType,
      title: 'Stock Movement',
      icon: Layers,
      desc: 'Full log of stock in/out quantities and net balances for every item.',
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      id: 'product-wise' as ReportType,
      title: 'Product Wise Report',
      icon: ArrowDownToLine,
      desc: 'Individual product details: pricing, brand, supplier, and current stock status.',
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      id: 'supplier-wise' as ReportType,
      title: 'Supplier Wise Report',
      icon: Users,
      desc: 'Stock received per supplier with total procurement cost analysis.',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      id: 'low-stock' as ReportType,
      title: 'Low Stock Report',
      icon: AlertTriangle,
      desc: 'All products below minimum threshold requiring immediate reorder.',
      color: 'text-amber-600 bg-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Generate and export detailed system reports as PDF.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.title}</h3>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{report.desc}</p>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => generate(report.id)}
                  disabled={loading === report.id}
                >
                  {loading === report.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    '⬇ Generate PDF'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
