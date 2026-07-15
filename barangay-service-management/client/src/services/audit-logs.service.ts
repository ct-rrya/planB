import axios from '../api/axios';
import type { AuditLog } from '../types';

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  adminId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const auditLogsService = {
  async getAll(params: GetAuditLogsParams) {
    const { data } = await axios.get('/audit-logs', { params });
    return data;
  },

  async getById(id: string): Promise<AuditLog> {
    const { data } = await axios.get(`/audit-logs/${id}`);
    return data;
  },

  async getStatsByModule() {
    const { data } = await axios.get('/audit-logs/stats/by-module');
    return data;
  },

  async getStatsByAdmin() {
    const { data } = await axios.get('/audit-logs/stats/by-admin');
    return data;
  },

  async getRecentActivity(limit: number = 10) {
    const { data } = await axios.get('/audit-logs/recent', {
      params: { limit },
    });
    return data;
  },
};
