import axios from '../api/axios';

export interface DashboardStatistics {
  totalResidents: number;
  pendingRequests: number;
  approvedToday: number;
  releasedToday: number;
  totalAnnouncements: number;
  publishedAnnouncements: number;
}

export interface MonthlyRequest {
  year: number;
  month: number;
  count: number;
}

export interface MostRequestedDocument {
  documentId: string;
  documentName: string;
  count: number;
}

export interface RecentRequest {
  _id: string;
  trackingNumber: string;
  status: string;
  requestedAt: Date;
  resident: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  documentType: {
    name: string;
  };
}

export interface RecentAuditLog {
  _id: string;
  action: string;
  timestamp: Date;
  admin: {
    username: string;
  };
}

export interface RequestStatusDistribution {
  status: string;
  count: number;
}

export const dashboardService = {
  async getStatistics(): Promise<DashboardStatistics> {
    const { data } = await axios.get<DashboardStatistics>('/dashboard/statistics');
    return data;
  },

  async getMonthlyRequests(months: number = 6): Promise<MonthlyRequest[]> {
    const { data } = await axios.get<MonthlyRequest[]>('/dashboard/monthly-requests', {
      params: { months },
    });
    return data;
  },

  async getMostRequestedDocuments(limit: number = 5): Promise<MostRequestedDocument[]> {
    const { data } = await axios.get<MostRequestedDocument[]>(
      '/dashboard/most-requested-documents',
      {
        params: { limit },
      }
    );
    return data;
  },

  async getRecentRequests(limit: number = 5): Promise<RecentRequest[]> {
    const { data } = await axios.get<RecentRequest[]>('/dashboard/recent-requests', {
      params: { limit },
    });
    return data;
  },

  async getRecentAuditLogs(limit: number = 10): Promise<RecentAuditLog[]> {
    const { data } = await axios.get<RecentAuditLog[]>('/dashboard/recent-audit-logs', {
      params: { limit },
    });
    return data;
  },

  async getRequestStatusDistribution(): Promise<RequestStatusDistribution[]> {
    const { data } = await axios.get<RequestStatusDistribution[]>(
      '/dashboard/request-status-distribution'
    );
    return data;
  },
};
