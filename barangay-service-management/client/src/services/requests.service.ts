import axios from '../api/axios';
import type { Request } from '../types';

export interface RequestsResponse {
  data: Request[];
  total: number;
  page: number;
  limit: number;
  stats: {
    pending: number;
    approved: number;
    ready: number;
    released: number;
    rejected: number;
  };
}

export interface CreateRequestInput {
  resident: string;
  documentType: string;
  purpose: string;
  remarks?: string;
}

export interface UpdateRequestInput {
  resident?: string;
  documentType?: string;
  purpose?: string;
  remarks?: string;
}

export interface UpdateStatusInput {
  remarks?: string;
}

export const requestsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<RequestsResponse> {
    const { data } = await axios.get<RequestsResponse>('/requests', { params });
    return data;
  },

  async getStats() {
    const { data } = await axios.get('/requests/stats');
    return data;
  },

  async getById(id: string): Promise<Request> {
    const { data } = await axios.get<Request>(`/requests/${id}`);
    return data;
  },

  async getByTrackingNumber(trackingNumber: string): Promise<Request> {
    const { data } = await axios.get<Request>(`/requests/tracking/${trackingNumber}`);
    return data;
  },

  async create(input: CreateRequestInput): Promise<Request> {
    const { data } = await axios.post<Request>('/requests', input);
    return data;
  },

  async update(id: string, input: UpdateRequestInput): Promise<Request> {
    const { data } = await axios.patch<Request>(`/requests/${id}`, input);
    return data;
  },

  async approve(id: string, input?: UpdateStatusInput): Promise<Request> {
    const { data } = await axios.patch<Request>(`/requests/${id}/approve`, input || {});
    return data;
  },

  async reject(id: string, input?: UpdateStatusInput): Promise<Request> {
    const { data } = await axios.patch<Request>(`/requests/${id}/reject`, input || {});
    return data;
  },

  async markReady(id: string, input?: UpdateStatusInput): Promise<Request> {
    const { data } = await axios.patch<Request>(`/requests/${id}/ready`, input || {});
    return data;
  },

  async release(id: string, input?: UpdateStatusInput): Promise<Request> {
    const { data } = await axios.patch<Request>(`/requests/${id}/release`, input || {});
    return data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/requests/${id}`);
  },
};
