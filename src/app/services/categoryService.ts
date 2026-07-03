import apiClient from './apiClient';

// Backend DTO shapes
export interface CategoryDto {
  categoryId: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdDate: string;
}

export interface CategoryCreateDto {
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export interface CategoryUpdateDto extends CategoryCreateDto {}

export const categoryService = {
  getAll: async (): Promise<CategoryDto[]> => {
    const res = await apiClient.get('/api/category');
    return res.data?.data ?? res.data;
  },
  create: async (dto: CategoryCreateDto): Promise<CategoryDto> => {
    const res = await apiClient.post('/api/category', dto);
    return res.data?.data ?? res.data;
  },
  update: async (id: number, dto: CategoryUpdateDto): Promise<CategoryDto> => {
    const res = await apiClient.put(`/api/category/${id}`, dto);
    return res.data?.data ?? res.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/category/${id}`);
  },
};
