import apiClient from './apiClient';

export interface SupplierDto {
  supplierId: number;
  supplierName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdDate: string;
}

export interface SupplierCreateDto {
  supplierName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

export interface SupplierUpdateDto extends SupplierCreateDto {}

export const supplierService = {
  getAll: async (): Promise<SupplierDto[]> => {
    const res = await apiClient.get('/api/supplier');
    return res.data?.data ?? res.data;
  },
  create: async (dto: SupplierCreateDto): Promise<SupplierDto> => {
    const res = await apiClient.post('/api/supplier', dto);
    return res.data?.data ?? res.data;
  },
  update: async (id: number, dto: SupplierUpdateDto): Promise<SupplierDto> => {
    const res = await apiClient.put(`/api/supplier/${id}`, dto);
    return res.data?.data ?? res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/supplier/${id}`);
  },
};
