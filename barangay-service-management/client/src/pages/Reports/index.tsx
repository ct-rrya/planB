import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Users,
  FileCheck,
  TrendingUp,
  Download,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { reportsService } from '../../services/reports.service';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ReportType = 'daily' | 'monthly' | 'yearly' | 'custom';

export default function Reports() {
  const today = new Date();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(today, 'yyyy-MM-dd')
  );
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState<string>(
    format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    format(today, 'yyyy-MM-dd')
  );

  // Main report query
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['report', reportType, selectedDate, selectedYear, selectedMonth, customStartDate, customEndDate],
    queryFn: () => {
      if (reportType === 'daily') {
        return reportsService.getDailyReport(selectedDate);
      } else if (reportType === 'monthly') {
        return reportsService.getMonthlyReport(selectedYear, selectedMonth);
      } else if (reportType === 'yearly') {
        return reportsService.getYearlyReport(selectedYear);
      } else {
        return reportsService.getCustomReport(customStartDate, customEndDate);
      }
    },
  });

  // Statistics queries
  const { data: residentStats } = useQuery({
    queryKey: ['residentStats'],
    queryFn: () => reportsService.getResidentStatistics(),
  });

  const { data: documentStats } = useQuery({
    queryKey: ['documentStats'],
    queryFn: () => reportsService.getDocumentStatistics(),
  });

  const { data: statusStats } = useQuery({
    queryKey: ['statusStats'],
    queryFn: () => reportsService.getStatusStatistics(),
  });

  // Export handlers
  const handleExportPDF = async () => {
    try {
      const params: any = {};
      if (reportType === 'daily') {
        params.date = selectedDate;
      } else if (reportType === 'monthly') {
        params.year = selectedYear;
        params.month = selectedMonth;
      } else if (reportType === 'yearly') {
        params.year = selectedYear;
      }

      if (reportType !== 'custom') {
        await reportsService.downloadPDF(reportType, params);
        toast.success('PDF exported successfully');
      } else {
        toast('PDF export not available for custom reports');
      }
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const params: any = {};
      if (reportType === 'daily') {
        params.date = selectedDate;
      } else if (reportType === 'monthly') {
        params.year = selectedYear;
        params.month = selectedMonth;
      } else if (reportType === 'yearly') {
        params.year = selectedYear;
      }

      if (reportType !== 'custom') {
        await reportsService.downloadExcel(reportType, params);
        toast.success('Excel exported successfully');
      } else {
        toast('Excel export not available for custom reports');
      }
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  // Chart data preparation
  const requestsByStatusChart = useMemo(() => {
    if (!reportData?.requestsByStatus) return null;

    const statusColors: Record<string, string> = {
      pending: '#f59e0b',
      approved: '#3b82f6',
      ready: '#8b5cf6',
      released: '#10b981',
      rejected: '#ef4444',
    };

    return {
      labels: reportData.requestsByStatus.map((item: any) => 
        item.status.charAt(0).toUpperCase() + item.status.slice(1)
      ),
      datasets: [
        {
          label: 'Requests by Status',
          data: reportData.requestsByStatus.map((item: any) => item.count),
          backgroundColor: reportData.requestsByStatus.map(
            (item: any) => statusColors[item.status] || '#6b7280'
          ),
        },
      ],
    };
  }, [reportData]);

  const requestsByDocumentChart = useMemo(() => {
    if (!reportData?.requestsByDocument) return null;

    return {
      labels: reportData.requestsByDocument.map((item: any) => item.documentName),
      datasets: [
        {
          label: 'Requests',
          data: reportData.requestsByDocument.map((item: any) => item.count),
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
      ],
    };
  }, [reportData]);

  const monthlyTrendChart = useMemo(() => {
    if (!reportData?.monthlyBreakdown) return null;

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return {
      labels: reportData.monthlyBreakdown.map(
        (item: any) => monthNames[item.month - 1]
      ),
      datasets: [
        {
          label: 'Requests',
          data: reportData.monthlyBreakdown.map((item: any) => item.count),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [reportData]);

  const residentBySexChart = useMemo(() => {
    if (!residentStats?.bySex) return null;

    return {
      labels: residentStats.bySex.map((item: any) => item.sex),
      datasets: [
        {
          label: 'Residents',
          data: residentStats.bySex.map((item: any) => item.count),
          backgroundColor: ['#3b82f6', '#ec4899'],
        },
      ],
    };
  }, [residentStats]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">View comprehensive reports and statistics</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-md transition-colors ${
              reportType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly Report
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              reportType === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yearly Report
          </button>
          <button
            onClick={() => setReportType('custom')}
            className={`px-4 py-2 rounded-md transition-colors ${
              reportType === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {format(new Date(2000, month - 1), 'MMMM')}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {reportType === 'yearly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => today.getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleExportPDF}
            disabled={reportType === 'custom'}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={reportType === 'custom'}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {reportLoading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-600">Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {reportData?.totalRequests || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">New Residents</p>
                  <p className="text-2xl font-bold text-green-900">
                    {reportData?.newResidents || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Total Residents</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {reportData?.totalResidents || residentStats?.totalResidents || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Completion Rate</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {statusStats?.completionRate || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Requests by Status */}
            {requestsByStatusChart && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Requests by Status
                </h3>
                <div className="h-64">
                  <Pie
                    data={requestsByStatusChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Requests by Document Type */}
            {requestsByDocumentChart && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Top Document Types
                </h3>
                <div className="h-64">
                  <Bar
                    data={requestsByDocumentChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trend */}
            {monthlyTrendChart && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Monthly Trend
                </h3>
                <div className="h-64">
                  <Line
                    data={monthlyTrendChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Residents by Sex */}
            {residentBySexChart && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Residents by Sex
                </h3>
                <div className="h-64">
                  <Pie
                    data={residentBySexChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requests by Status Table */}
            {reportData?.requestsByStatus && reportData.requestsByStatus.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Requests by Status
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.requestsByStatus.map((item: any) => (
                        <tr key={item.status}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className="capitalize">{item.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Statistics */}
            {documentStats && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Document Statistics
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Document Types</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {documentStats.totalDocumentTypes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Document Types</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {documentStats.activeDocumentTypes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Processing Time</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {documentStats.averageProcessingTime} days
                      </span>
                    </div>
                    {statusStats && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Completion Time</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {statusStats.averageCompletionTime} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Documents Table */}
          {reportData?.requestsByDocument && reportData.requestsByDocument.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Requested Documents
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Document Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Requests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.requestsByDocument.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.documentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resident Demographics */}
          {residentStats && (
            <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resident Demographics
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Sex */}
                  {residentStats.bySex && residentStats.bySex.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">By Sex</h4>
                      <div className="space-y-2">
                        {residentStats.bySex.map((item: any) => (
                          <div key={item.sex} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{item.sex}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Civil Status */}
                  {residentStats.byCivilStatus && residentStats.byCivilStatus.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        By Civil Status
                      </h4>
                      <div className="space-y-2">
                        {residentStats.byCivilStatus.map((item: any) => (
                          <div key={item.civilStatus} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{item.civilStatus}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Purok */}
                  {residentStats.byPurok && residentStats.byPurok.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Top Puroks
                      </h4>
                      <div className="space-y-2">
                        {residentStats.byPurok.slice(0, 5).map((item: any) => (
                          <div key={item.purok} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Purok {item.purok}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
