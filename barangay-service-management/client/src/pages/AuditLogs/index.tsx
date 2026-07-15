import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Shield,
  Activity,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { auditLogsService } from '../../services/audit-logs.service';
import type { AuditLog } from '../../types';
import { format } from 'date-fns';

const moduleColors: Record<string, string> = {
  auth: 'bg-blue-100 text-blue-800',
  resident: 'bg-green-100 text-green-800',
  document: 'bg-purple-100 text-purple-800',
  request: 'bg-orange-100 text-orange-800',
  announcement: 'bg-pink-100 text-pink-800',
  user: 'bg-indigo-100 text-indigo-800',
  system: 'bg-gray-100 text-gray-800',
};

export default function AuditLogs() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Queries
  const { data: auditLogsData, isLoading } = useQuery({
    queryKey: ['auditLogs', page, search, moduleFilter, startDate, endDate],
    queryFn: () =>
      auditLogsService.getAll({
        page,
        limit: 10,
        search,
        module: moduleFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const { data: statsByModule } = useQuery({
    queryKey: ['auditLogStatsByModule'],
    queryFn: () => auditLogsService.getStatsByModule(),
  });

  const { data: statsByAdmin } = useQuery({
    queryKey: ['auditLogStatsByAdmin'],
    queryFn: () => auditLogsService.getStatsByAdmin(),
  });

  const handleClearFilters = () => {
    setSearch('');
    setModuleFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getAdminUsername = (admin: any): string => {
    if (typeof admin === 'object' && admin !== null) {
      return admin.username || 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="h-8 w-8 mr-3 text-blue-600" />
          Audit Logs
        </h1>
        <p className="text-gray-600 mt-1">
          Track all system activities and administrative actions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Logs</p>
              <p className="text-2xl font-bold text-blue-900">
                {auditLogsData?.total || 0}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Admins</p>
              <p className="text-2xl font-bold text-green-900">
                {statsByAdmin?.length || 0}
              </p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Modules Tracked</p>
              <p className="text-2xl font-bold text-purple-900">
                {statsByModule?.length || 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Today's Logs</p>
              <p className="text-2xl font-bold text-orange-900">
                {auditLogsData?.data?.filter((log: AuditLog) => {
                  const logDate = new Date(log.timestamp);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search actions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modules</option>
              <option value="auth">Authentication</option>
              <option value="resident">Residents</option>
              <option value="document">Documents</option>
              <option value="request">Requests</option>
              <option value="announcement">Announcements</option>
              <option value="user">Users</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(search || moduleFilter || startDate || endDate) && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFilters}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : auditLogsData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogsData?.data?.map((log: AuditLog) => (
                  <tr key={log._id || log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          moduleColors[log.module] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.module.charAt(0).toUpperCase() + log.module.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {log.action}
                      </div>
                      {log.resourceType && (
                        <div className="text-xs text-gray-500 mt-1">
                          {log.resourceType}
                          {log.resourceId && ` • ${log.resourceId.substring(0, 8)}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getAdminUsername(log.admin)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.ipAddress || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {auditLogsData && auditLogsData.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(auditLogsData.total / auditLogsData.limit)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(page - 1) * auditLogsData.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(page * auditLogsData.limit, auditLogsData.total)}
                  </span>{' '}
                  of <span className="font-medium">{auditLogsData.total}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={
                      page >= Math.ceil(auditLogsData.total / auditLogsData.limit)
                    }
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Stats by Module */}
        {statsByModule && statsByModule.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Activity by Module
            </h3>
            <div className="space-y-3">
              {statsByModule.map((stat: any) => (
                <div key={stat.module} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        moduleColors[stat.module] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {stat.module.charAt(0).toUpperCase() + stat.module.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.count} logs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats by Admin */}
        {statsByAdmin && statsByAdmin.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Activity by Admin
            </h3>
            <div className="space-y-3">
              {statsByAdmin.slice(0, 5).map((stat: any) => (
                <div key={stat.adminId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-900">{stat.username}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.count} actions
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
