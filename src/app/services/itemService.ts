import apiClient from './apiClient';

export interface ItemDto {
  itemId: number;
  itemCode: string;
  barcode?: string;
  itemName: string;
  brand?: string;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  supplierId: number;
  supplierName?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  isActive: boolean;
  createdDate: string;
}

export interface ItemCreateDto {
  itemCode: string;
  barcode?: string;
  itemName: string;
  brand?: string;
  imageUrl?: string;
  categoryId: number;
  supplierId: number;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface ItemUpdateDto extends ItemCreateDto {}

export const itemService = {
  getAll: async (): Promise<ItemDto[]> => {
    const res = await apiClient.get('/api/item');
    return res.data?.data ?? res.data;
  },
  create: async (dto: ItemCreateDto): Promise<ItemDto> => {
    const res = await apiClient.post('/api/item', dto);
    return res.data?.data ?? res.data;
  },
  update: async (id: number, dto: ItemUpdateDto): Promise<ItemDto> => {
    const res = await apiClient.put(`/api/item/${id}`, dto);
    return res.data?.data ?? res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/item/${id}`);
  },
};
