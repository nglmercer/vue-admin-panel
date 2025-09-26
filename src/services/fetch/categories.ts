import BaseApi from './commons/BaseApi'
import type { FetchOptions } from './commons/httpservice'
import apiConfig from './config/apiConfig'
import { emitter } from '../Emitter'

export interface Category {
  id: string
  name: string
  icon?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoriesResponse {
  success: boolean
  data?: Category[]
  categories?: Category[]
  message?: string
  error?: string
}

export interface CategoryResponse {
  success: boolean
  data?: Category
  category?: Category
  message?: string
  error?: string
}

export interface CreateCategoryData {
  name: string
  icon?: string
  description?: string
  is_active?: boolean
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

class CategoriesApi extends BaseApi {
  constructor(config: any) {
    super(config)
  }

  async getCategories(options?: {
    page?: number
    limit?: number
    search?: string
    is_active?: boolean
    sort?: string
    order?: 'asc' | 'desc'
  }): Promise<CategoriesResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (options?.page) queryParams.append('page', options.page.toString())
      if (options?.limit) queryParams.append('limit', options.limit.toString())
      if (options?.search) queryParams.append('search', options.search)
      if (options?.is_active !== undefined) queryParams.append('is_active', options.is_active.toString())
      if (options?.sort) queryParams.append('sort', options.sort)
      if (options?.order) queryParams.append('order', options.order)

      const url = `/api/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await this.get<CategoriesResponse>(url)

      if (response.success) {
        emitter.emit('categories:fetch:success', { categories: response.data || response.categories })
      } else {
        emitter.emit('categories:fetch:error', { message: response.message || 'Failed to fetch categories' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('categories:fetch:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async getCategory(id: string): Promise<CategoryResponse> {
    try {
      const response = await this.get<CategoryResponse>(`/api/categories/${id}`)

      if (response.success) {
        emitter.emit('category:fetch:success', { category: response.data || response.category })
      } else {
        emitter.emit('category:fetch:error', { message: response.message || 'Failed to fetch category' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('category:fetch:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async createCategory(categoryData: CreateCategoryData): Promise<CategoryResponse> {
    try {
      const response = await this.post<CategoryResponse>('/api/categories', categoryData)

      if (response.success) {
        emitter.emit('category:create:success', { category: response.data || response.category })
      } else {
        emitter.emit('category:create:error', { message: response.message || 'Failed to create category' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('category:create:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async updateCategory(id: string, categoryData: Partial<CreateCategoryData>): Promise<CategoryResponse> {
    try {
      const response = await this.put<CategoryResponse>(`/api/categories/${id}`, categoryData)

      if (response.success) {
        emitter.emit('category:update:success', { category: response.data || response.category })
      } else {
        emitter.emit('category:update:error', { message: response.message || 'Failed to update category' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('category:update:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await this.delete<{ success: boolean; message?: string }>(`/api/categories/${id}`)

      if (response.success) {
        emitter.emit('category:delete:success', { id })
      } else {
        emitter.emit('category:delete:error', { message: response.message || 'Failed to delete category' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('category:delete:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async toggleCategoryStatus(id: string): Promise<CategoryResponse> {
    try {
      const response = await this.patch<CategoryResponse>(`/api/categories/${id}/toggle`, {})

      if (response.success) {
        emitter.emit('category:toggle:success', { category: response.data || response.category })
      } else {
        emitter.emit('category:toggle:error', { message: response.message || 'Failed to toggle category status' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('category:toggle:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
}

const categoriesApi = new CategoriesApi(apiConfig)
export { CategoriesApi, categoriesApi }
