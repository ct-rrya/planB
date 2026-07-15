import axiosInstance from '@/api/axios';
import type { Resident } from '@/types';

interface ResidentsResponse {
  data: Resident[];
  total: number;
  page: number;
  limit: number;
}

interface ResidentsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const residentsService = {
  async getAll(params?: ResidentsQueryParams): Promise<ResidentsResponse> {
    const response = await axiosInstance.get<ResidentsResponse>('/residents', {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<Resident> {
    const response = await axiosInstance.get<Resident>(`/residents/${id}`);
    return response.data;
  },

  async create(data: Omit<Resident, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Resident> {
    const response = await axiosInstance.post<Resident>('/residents', data);
    return response.data;
  },

  async update(id: string, data: Partial<Omit<Resident, 'id' | '_id' | 'createdAt' | 'updatedAt'>>): Promise<Resident> {
    const response = await axiosInstance.patch<Resident>(
      `/residents/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/residents/${id}`);
  },
};
