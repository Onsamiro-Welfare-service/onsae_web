import { apiClient } from './api';

import type { Category, CreateCategoryRequest } from '@/types/api';

// 카테고리 수정 요청 타입
export interface UpdateCategoryRequest {
  name: string;
  description: string;
  imagePath: string;
}

export const categoryService = {
  // 카테고리 목록 조회
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories');
  },

  // 활성 카테고리 목록 조회
  async getActiveCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories/active');
  },

  // 카테고리 상세 조회
  async getCategory(categoryId: number): Promise<Category> {
    return apiClient.get<Category>(`/categories/${categoryId}`);
  },

  // 카테고리 생성
  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    return apiClient.post<Category>('/categories', payload);
  },

  // 카테고리 수정
  async updateCategory(categoryId: number, payload: UpdateCategoryRequest): Promise<Category> {
    return apiClient.put<Category>(`/categories/${categoryId}`, payload);
  },

  // 카테고리 삭제
  async deleteCategory(categoryId: number): Promise<void> {
    return apiClient.delete<void>(`/categories/${categoryId}`);
  },
};

