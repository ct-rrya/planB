import axios from '../api/axios';

export const reportsService = {
  async getDailyReport(date?: string) {
    const { data } = await axios.get('/reports/daily', {
      params: { date },
    });
    return data;
  },

  async getMonthlyReport(year: number, month: number) {
    const { data } = await axios.get('/reports/monthly', {
      params: { year, month },
    });
    return data;
  },

  async getYearlyReport(year: number) {
    const { data } = await axios.get('/reports/yearly', {
      params: { year },
    });
    return data;
  },

  async getResidentStatistics(startDate?: string, endDate?: string) {
    const { data } = await axios.get('/reports/resident-statistics', {
      params: { startDate, endDate },
    });
    return data;
  },

  async getDocumentStatistics(startDate?: string, endDate?: string) {
    const { data } = await axios.get('/reports/document-statistics', {
      params: { startDate, endDate },
    });
    return data;
  },

  async getStatusStatistics(startDate?: string, endDate?: string) {
    const { data } = await axios.get('/reports/status-statistics', {
      params: { startDate, endDate },
    });
    return data;
  },

  async getCustomReport(startDate: string, endDate: string) {
    const { data } = await axios.get('/reports/custom', {
      params: { startDate, endDate },
    });
    return data;
  },

  getExportPDFUrl(type: 'daily' | 'monthly' | 'yearly', params: any) {
    const queryParams = new URLSearchParams(params).toString();
    return `/reports/export/pdf?type=${type}&${queryParams}`;
  },

  getExportExcelUrl(type: 'daily' | 'monthly' | 'yearly', params: any) {
    const queryParams = new URLSearchParams(params).toString();
    return `/reports/export/excel?type=${type}&${queryParams}`;
  },

  async downloadPDF(type: 'daily' | 'monthly' | 'yearly', params: any) {
    const response = await axios.get(`/reports/export/pdf`, {
      params: { type, ...params },
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async downloadExcel(type: 'daily' | 'monthly' | 'yearly', params: any) {
    const response = await axios.get(`/reports/export/excel`, {
      params: { type, ...params },
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
