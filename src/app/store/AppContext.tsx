/**
 * AppContext – real API-backed context using React Query.
 *
 * All pages that previously imported from './store/AppContext' continue to
 * work because we re-export the same hook names and type names, but now
 * they are backed by the live backend.
 */
import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';


import { categoryService, CategoryDto } from '../services/categoryService';
import { supplierService, SupplierDto } from '../services/supplierService';
import { itemService, ItemDto } from '../services/itemService';
import { stockService, StockBalanceDto } from '../services/stockService';

// ─── Exported types (shape kept compatible with the old mock types) ────────────

export type Category = {
  id: string;        // string representation of CategoryId
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  _raw: CategoryDto; // original backend DTO for mutation calls
};

export type Supplier = {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  _raw: SupplierDto;
};

export type Product = {
  id: string;
  productCode: string;
  barcode: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  imageUrl: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  _raw: ItemDto;
};

export type StockBalance = StockBalanceDto;

// ─── Context type ─────────────────────────────────────────────────────────────

interface AppContextType {
  // Data
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  stockBalances: StockBalance[];
  // Loading states
  categoriesLoading: boolean;
  suppliersLoading: boolean;
  productsLoading: boolean;
  stockLoading: boolean;
  // Category mutations
  addCategory: (data: { name: string; description: string; status: 'Active' | 'Inactive' }) => Promise<void>;
  updateCategory: (id: string, data: { name: string; description: string; status: 'Active' | 'Inactive' }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Supplier mutations
  addSupplier: (data: { name: string; contactNumber: string; email: string; address: string; status: 'Active' | 'Inactive' }) => Promise<void>;
  updateSupplier: (id: string, data: { name: string; contactNumber: string; email: string; address: string; status: 'Active' | 'Inactive' }) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  // Product mutations
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'stockQuantity' | 'categoryName' | 'supplierName' | '_raw'>) => Promise<void>;
  updateProduct: (id: string, data: Omit<Product, 'id' | 'createdAt' | 'stockQuantity' | 'categoryName' | 'supplierName' | '_raw'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Stock mutations
  addStockIn: (data: { productId: string; supplierId: string; quantity: number; costPrice: number; date: string }) => Promise<void>;
  addStockOut: (data: { productId: string; quantity: number; reason: string; date: string }) => Promise<void>;
  // Refresh helpers
  refreshStock: () => void;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapCategory = (dto: CategoryDto): Category => ({
  id: String(dto.categoryId),
  name: dto.categoryName,
  description: dto.description ?? '',
  status: dto.isActive ? 'Active' : 'Inactive',
  createdAt: dto.createdDate,
  _raw: dto,
});

const mapSupplier = (dto: SupplierDto): Supplier => ({
  id: String(dto.supplierId),
  name: dto.supplierName,
  contactNumber: dto.contactNumber ?? '',
  email: dto.email ?? '',
  address: dto.address ?? '',
  status: dto.isActive ? 'Active' : 'Inactive',
  createdAt: dto.createdDate,
  _raw: dto,
});

const mapProduct = (dto: ItemDto, balance: Map<number, StockBalanceDto>): Product => {
  const bal = balance.get(dto.itemId);
  return {
    id: String(dto.itemId),
    productCode: dto.itemCode,
    barcode: dto.barcode ?? '',
    name: dto.itemName,
    brand: dto.brand ?? '',
    categoryId: String(dto.categoryId),
    categoryName: dto.categoryName ?? '',
    supplierId: String(dto.supplierId),
    supplierName: dto.supplierName ?? '',
    costPrice: dto.costPrice,
    sellingPrice: dto.sellingPrice,
    stockQuantity: bal?.currentBalance ?? 0,
    reorderLevel: dto.reorderLevel,
    imageUrl: dto.imageUrl ?? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80',
    status: dto.isActive ? 'Active' : 'Inactive',
    createdAt: dto.createdDate,
    _raw: dto,
  };
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: categoryDtos = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const { data: supplierDtos = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
  });

  const { data: itemDtos = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: itemService.getAll,
  });

  const { data: balanceDtos = [], isLoading: stockLoading } = useQuery({
    queryKey: ['stockBalance'],
    queryFn: stockService.getBalance,
  });

  const balanceMap = new Map<number, StockBalanceDto>(
    balanceDtos.map((b) => [b.itemId, b])
  );

  const categories = categoryDtos.map(mapCategory);
  const suppliers = supplierDtos.map(mapSupplier);
  const products = itemDtos.map((item) => mapProduct(item, balanceMap));

  const refreshStock = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['stockBalance'] });
    qc.invalidateQueries({ queryKey: ['items'] });
  }, [qc]);

  // ── Category mutations ────────────────────────────────────────────────────

  const { mutateAsync: createCat } = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const { mutateAsync: updateCat } = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) => categoryService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
  const { mutateAsync: deleteCat } = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const addCategory = useCallback(async (data: { name: string; description: string; status: 'Active' | 'Inactive' }) => {
    await createCat({ categoryName: data.name, description: data.description, isActive: data.status === 'Active' });
  }, [createCat]);

  const updateCategory = useCallback(async (id: string, data: { name: string; description: string; status: 'Active' | 'Inactive' }) => {
    await updateCat({ id: Number(id), dto: { categoryName: data.name, description: data.description, isActive: data.status === 'Active' } });
  }, [updateCat]);

  const deleteCategory = useCallback(async (id: string) => {
    await deleteCat(Number(id));
  }, [deleteCat]);

  // ── Supplier mutations ────────────────────────────────────────────────────

  const { mutateAsync: createSup } = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
  const { mutateAsync: updateSup } = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) => supplierService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
  const { mutateAsync: deleteSup } = useMutation({
    mutationFn: (id: number) => supplierService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });

  const addSupplier = useCallback(async (data: { name: string; contactNumber: string; email: string; address: string; status: 'Active' | 'Inactive' }) => {
    await createSup({ supplierName: data.name, contactNumber: data.contactNumber, email: data.email, address: data.address, isActive: data.status === 'Active' });
  }, [createSup]);

  const updateSupplier = useCallback(async (id: string, data: { name: string; contactNumber: string; email: string; address: string; status: 'Active' | 'Inactive' }) => {
    await updateSup({ id: Number(id), dto: { supplierName: data.name, contactNumber: data.contactNumber, email: data.email, address: data.address, isActive: data.status === 'Active' } });
  }, [updateSup]);

  const deleteSupplier = useCallback(async (id: string) => {
    await deleteSup(Number(id));
  }, [deleteSup]);

  // ── Item mutations ────────────────────────────────────────────────────────

  const { mutateAsync: createItem } = useMutation({
    mutationFn: itemService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['items'] }); qc.invalidateQueries({ queryKey: ['stockBalance'] }); },
  });
  const { mutateAsync: updateItem } = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) => itemService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: (id: number) => itemService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['items'] }); qc.invalidateQueries({ queryKey: ['stockBalance'] }); },
  });

  const addProduct = useCallback(async (data: Omit<Product, 'id' | 'createdAt' | 'stockQuantity' | 'categoryName' | 'supplierName' | '_raw'>) => {
    await createItem({
      itemCode: data.productCode,
      barcode: data.barcode,
      itemName: data.name,
      brand: data.brand,
      imageUrl: data.imageUrl,
      categoryId: Number(data.categoryId),
      supplierId: Number(data.supplierId),
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      reorderLevel: data.reorderLevel,
      isActive: data.status === 'Active',
    });
  }, [createItem]);

  const updateProduct = useCallback(async (id: string, data: Omit<Product, 'id' | 'createdAt' | 'stockQuantity' | 'categoryName' | 'supplierName' | '_raw'>) => {
    await updateItem({
      id: Number(id),
      dto: {
        itemCode: data.productCode,
        barcode: data.barcode,
        itemName: data.name,
        brand: data.brand,
        imageUrl: data.imageUrl,
        categoryId: Number(data.categoryId),
        supplierId: Number(data.supplierId),
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        reorderLevel: data.reorderLevel,
        isActive: data.status === 'Active',
      },
    });
  }, [updateItem]);

  const deleteProduct = useCallback(async (id: string) => {
    await deleteItem(Number(id));
  }, [deleteItem]);

  // ── Stock mutations ────────────────────────────────────────────────────────

  const { mutateAsync: doStockIn } = useMutation({
    mutationFn: stockService.stockIn,
    onSuccess: refreshStock,
  });
  const { mutateAsync: doStockOut } = useMutation({
    mutationFn: stockService.stockOut,
    onSuccess: refreshStock,
  });

  const addStockIn = useCallback(async (data: { productId: string; supplierId: string; quantity: number; costPrice: number; date: string }) => {
    await doStockIn({
      itemId: Number(data.productId),
      supplierId: Number(data.supplierId),
      quantity: data.quantity,
      costPrice: data.costPrice,
      stockInDate: data.date,
    });
  }, [doStockIn]);

  const addStockOut = useCallback(async (data: { productId: string; quantity: number; reason: string; date: string }) => {
    await doStockOut({
      itemId: Number(data.productId),
      quantity: data.quantity,
      reason: data.reason,
      stockOutDate: data.date,
    });
  }, [doStockOut]);

  return (
    <AppContext.Provider value={{
      categories, suppliers, products, stockBalances: balanceDtos,
      categoriesLoading, suppliersLoading,
      productsLoading: itemsLoading || stockLoading,
      stockLoading,
      addCategory, updateCategory, deleteCategory,
      addSupplier, updateSupplier, deleteSupplier,
      addProduct, updateProduct, deleteProduct,
      addStockIn, addStockOut,
      refreshStock,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};