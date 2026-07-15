import axiosInstance from '@/api/axios';
import type { DocumentType } from '@/types';

interface DocumentsResponse {
  data: DocumentType[];
  total: number;
  page: number;
  limit: number;
}

interface DocumentsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export const documentsService = {
  async getAll(params?: DocumentsQueryParams): Promise<DocumentsResponse> {
    const response = await axiosInstance.get<DocumentsResponse>('/documents', {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<DocumentType> {
    const response = await axiosInstance.get<DocumentType>(`/documents/${id}`);
    return response.data;
  },

  async create(
    data: Omit<DocumentType, 'id' | '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<DocumentType> {
    const response = await axiosInstance.post<DocumentType>('/documents', data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<Omit<DocumentType, 'id' | '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<DocumentType> {
    const response = await axiosInstance.patch<DocumentType>(
      `/documents/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/documents/${id}`);
  },

  async toggleActive(id: string): Promise<DocumentType> {
    const response = await axiosInstance.patch<DocumentType>(
      `/documents/${id}/toggle-active`
    );
    return response.data;
  },
};
