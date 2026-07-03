import apiClient from './apiClient';

export interface StockInCreateDto {
  itemId: number;
  supplierId: number;
  quantity: number;
  costPrice: number;
  stockInDate: string;
}

export interface StockOutCreateDto {
  itemId: number;
  quantity: number;
  reason: string;
  stockOutDate: string;
}

export interface StockBalanceDto {
  itemId: number;
  itemCode: string;
  itemName: string;
  categoryName?: string;
  totalStockIn: number;
  totalStockOut: number;
  currentBalance: number;
  reorderLevel: number;
  stockStatus: string; // 'Good Stock' | 'Low Stock' | 'Out of Stock'
}

export interface StockInDto {
  stockInId: number;
  itemId: number;
  itemName?: string;
  supplierId: number;
  supplierName?: string;
  quantity: number;
  costPrice: number;
  stockInDate: string;
  createdDate: string;
}

export interface StockOutDto {
  stockOutId: number;
  itemId: number;
  itemName?: string;
  quantity: number;
  reason: string;
  stockOutDate: string;
  createdDate: string;
}

export interface DashboardStatsDto {
  totalItems: number;
  totalCategories: number;
  totalSuppliers: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export const stockService = {
  stockIn: async (dto: StockInCreateDto): Promise<void> => {
    await apiClient.post('/api/stock/in', dto);
  },
  stockOut: async (dto: StockOutCreateDto): Promise<void> => {
    await apiClient.post('/api/stock/out', dto);
  },
  getBalance: async (): Promise<StockBalanceDto[]> => {
    const res = await apiClient.get('/api/stock/balance');
    return res.data?.data ?? res.data;
  },
  getLowStock: async (): Promise<StockBalanceDto[]> => {
    const res = await apiClient.get('/api/stock/low-stock');
    return res.data?.data ?? res.data;
  },
  getDashboardStats: async (): Promise<DashboardStatsDto> => {
    const res = await apiClient.get('/api/dashboard/stats');
    return res.data?.data ?? res.data;
  },
};
