import { apiClient } from './api';

import type { Category, CreateCategoryRequest } from '@/types/api';

export const categoryService = {
  async getActiveCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories/active');
  },

  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    return apiClient.post<Category>('/categories', payload);
  },
};

