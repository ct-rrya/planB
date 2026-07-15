import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Clock,
  CheckCircle,
  FileCheck,
  Megaphone,
  TrendingUp,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { dashboardService } from '../../services/dashboard.service';
import { format } from 'date-fns';

// Register ChartJS components
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

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const statusColors: Record<string, string> = {
  pending: 'rgb(234, 179, 8)',
  approved: 'rgb(59, 130, 246)',
  ready: 'rgb(168, 85, 247)',
  released: 'rgb(34, 197, 94)',
  rejected: 'rgb(239, 68, 68)',
};

export default function Dashboard() {
  // Queries
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: () => dashboardService.getStatistics(),
  });

  const { data: monthlyRequests, isLoading: monthlyLoading } = useQuery({
    queryKey: ['dashboard-monthly-requests'],
    queryFn: () => dashboardService.getMonthlyRequests(6),
  });

  const { data: mostRequested, isLoading: mostRequestedLoading } = useQuery({
    queryKey: ['dashboard-most-requested'],
    queryFn: () => dashboardService.getMostRequestedDocuments(5),
  });

  const { data: recentRequests, isLoading: recentRequestsLoading } = useQuery({
    queryKey: ['dashboard-recent-requests'],
    queryFn: () => dashboardService.getRecentRequests(5),
  });

  const { data: recentAuditLogs, isLoading: auditLogsLoading } = useQuery({
    queryKey: ['dashboard-recent-audit-logs'],
    queryFn: () => dashboardService.getRecentAuditLogs(10),
  });

  const { data: statusDistribution, isLoading: statusLoading } = useQuery({
    queryKey: ['dashboard-status-distribution'],
    queryFn: () => dashboardService.getRequestStatusDistribution(),
  });

  // Chart data
  const monthlyRequestsChart = {
    labels: monthlyRequests?.map((item) => `${monthNames[item.month - 1]} ${item.year}`) || [],
    datasets: [
      {
        label: 'Requests',
        data: monthlyRequests?.map((item) => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  };

  const mostRequestedChart = {
    labels: mostRequested?.map((item) => item.documentName) || [],
    datasets: [
      {
        label: 'Count',
        data: mostRequested?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(168, 85, 247)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const statusDistributionChart = {
    labels: statusDistribution?.map((item) => item.status.charAt(0).toUpperCase() + item.status.slice(1)) || [],
    datasets: [
      {
        data: statusDistribution?.map((item) => item.count) || [],
        backgroundColor: statusDistribution?.map((item) => statusColors[item.status] + 'CC') || [],
        borderColor: statusDistribution?.map((item) => statusColors[item.status]) || [],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 12,
          font: {
            size: 11
          }
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-sm text-secondary-700 mt-1">Monitor barangay service activities and statistics</p>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary-700 truncate">Total Residents</p>
              <p className="text-xl font-bold text-primary mt-1">
                {statsLoading ? '...' : statistics?.totalResidents || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary-700 truncate">Pending Requests</p>
              <p className="text-xl font-bold text-primary mt-1">
                {statsLoading ? '...' : statistics?.pendingRequests || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary-700 truncate">Approved Today</p>
              <p className="text-xl font-bold text-primary mt-1">
                {statsLoading ? '...' : statistics?.approvedToday || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary-700 truncate">Released Today</p>
              <p className="text-xl font-bold text-primary mt-1">
                {statsLoading ? '...' : statistics?.releasedToday || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <FileCheck className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary-700 truncate">Announcements</p>
              <p className="text-xl font-bold text-primary mt-1">
                {statsLoading ? '...' : statistics?.totalAnnouncements || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Megaphone className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card hover-lift transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-secondary-700 truncate">Published</p>
              <p className="text-xl font-bold text-primary mt-1">
                {statsLoading ? '...' : statistics?.publishedAnnouncements || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Requests Chart */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200">
          <h2 className="text-base font-semibold text-primary mb-4">Monthly Requests Trend</h2>
          {monthlyLoading ? (
            <div className="h-64 flex items-center justify-center text-secondary-600">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          ) : monthlyRequests && monthlyRequests.length > 0 ? (
            <div className="w-full" style={{ height: '240px' }}>
              <Line data={monthlyRequestsChart} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-secondary-600 bg-secondary-50 rounded-lg">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>

        {/* Most Requested Documents Chart */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200">
          <h2 className="text-base font-semibold text-primary mb-4">Most Requested Documents</h2>
          {mostRequestedLoading ? (
            <div className="h-64 flex items-center justify-center text-secondary-600">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          ) : mostRequested && mostRequested.length > 0 ? (
            <div className="w-full" style={{ height: '240px' }}>
              <Bar data={mostRequestedChart} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-secondary-600 bg-secondary-50 rounded-lg">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution and Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200">
          <h2 className="text-base font-semibold text-primary mb-4">Request Status</h2>
          {statusLoading ? (
            <div className="h-64 flex items-center justify-center text-secondary-600">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          ) : statusDistribution && statusDistribution.length > 0 ? (
            <div className="w-full" style={{ height: '280px' }}>
              <Doughnut data={statusDistributionChart} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-secondary-600 bg-secondary-50 rounded-lg">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-card p-5 lg:col-span-2 border border-secondary-200">
          <h2 className="text-base font-semibold text-primary mb-4">Recent Requests</h2>
          {recentRequestsLoading ? (
            <div className="text-center text-secondary-600 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
              <p className="text-sm">Loading...</p>
            </div>
          ) : recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {recentRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors border border-secondary-200"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-primary truncate">
                      {request.trackingNumber}
                    </p>
                    <p className="text-xs text-secondary-700 mt-0.5 truncate">
                      {request.resident.firstName}{' '}
                      {request.resident.middleName ? `${request.resident.middleName} ` : ''}
                      {request.resident.lastName} - {request.documentType.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : request.status === 'approved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : request.status === 'ready'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : request.status === 'released'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {request.status}
                    </span>
                    <p className="text-xs text-secondary-600 mt-1">
                      {format(new Date(request.requestedAt), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-secondary-600 py-8 bg-secondary-50 rounded-lg">
              <p className="text-sm">No recent requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200">
        <h2 className="text-base font-semibold text-primary mb-4">Recent Activity</h2>
        {auditLogsLoading ? (
          <div className="text-center text-secondary-600 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
            <p className="text-sm">Loading...</p>
          </div>
        ) : recentAuditLogs && recentAuditLogs.length > 0 ? (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {recentAuditLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-center justify-between p-3 border-b border-secondary-100 last:border-b-0 hover:bg-secondary-50 rounded transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm text-primary font-medium truncate">{log.action}</p>
                  <p className="text-xs text-secondary-600 truncate">by {log.admin.username}</p>
                </div>
                <div className="text-xs text-secondary-600 flex-shrink-0">
                  {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary-600 py-8 bg-secondary-50 rounded-lg">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
