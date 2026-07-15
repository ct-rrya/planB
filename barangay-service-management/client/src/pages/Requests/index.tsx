import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Trash2,
  Edit,
} from 'lucide-react';
import { requestsService, type CreateRequestInput, type UpdateStatusInput } from '../../services/requests.service';
import { residentsService } from '../../services/residents.service';
import { documentsService } from '../../services/documents.service';
import RequestModal from '../../components/forms/RequestModal';
import RequestDetailsDrawer from '../../components/common/RequestDetailsDrawer';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import type { Request } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  certificate_generated: 'bg-purple-100 text-purple-800',
  printed: 'bg-indigo-100 text-indigo-800',
  secretary_signed: 'bg-teal-100 text-teal-800',
  captain_signed: 'bg-cyan-100 text-cyan-800',
  sealed: 'bg-emerald-100 text-emerald-800',
  ready: 'bg-lime-100 text-lime-800',
  released: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Requests() {
  const queryClient = useQueryClient();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: 'approve' | 'reject' | 'ready' | 'release';
    requestId: string;
  } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarksInput, setRemarksInput] = useState('');

  // Queries
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['requests', page, search, statusFilter, startDate, endDate],
    queryFn: () =>
      requestsService.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter,
        startDate,
        endDate,
      }),
  });

  const { data: residentsData } = useQuery({
    queryKey: ['residents-all'],
    queryFn: () => residentsService.getAll({ page: 1, limit: 1000 }),
  });

  const { data: documentTypesData } = useQuery({
    queryKey: ['documents-all'],
    queryFn: () => documentsService.getAll({ page: 1, limit: 1000 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateRequestInput) => requestsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create request');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRequestInput }) =>
      requestsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request updated successfully');
      setIsModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update request');
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: UpdateStatusInput }) =>
      requestsService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request approved successfully');
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      setRemarksInput('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: UpdateStatusInput }) =>
      requestsService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request rejected');
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      setRemarksInput('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    },
  });

  const readyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: UpdateStatusInput }) =>
      requestsService.markReady(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request marked as ready');
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      setRemarksInput('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark request as ready');
    },
  });

  const releaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: UpdateStatusInput }) =>
      requestsService.release(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request released to resident');
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      setRemarksInput('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to release request');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => requestsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete request');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedRequest(null);
    setIsModalOpen(true);
  };

  const handleEdit = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleView = (request: Request) => {
    setSelectedRequest(request);
    setIsDetailsDrawerOpen(true);
  };

  const handleDelete = (request: Request) => {
    setSelectedRequest(request);
    setIsDeleteModalOpen(true);
  };

  const handleStatusAction = (
    action: 'approve' | 'reject' | 'ready' | 'release',
    requestId: string
  ) => {
    setConfirmAction({ action, requestId });
    setRemarksInput('');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!confirmAction) return;

    const data = remarksInput ? { remarks: remarksInput } : undefined;

    switch (confirmAction.action) {
      case 'approve':
        approveMutation.mutate({ id: confirmAction.requestId, data });
        break;
      case 'reject':
        rejectMutation.mutate({ id: confirmAction.requestId, data });
        break;
      case 'ready':
        readyMutation.mutate({ id: confirmAction.requestId, data });
        break;
      case 'release':
        releaseMutation.mutate({ id: confirmAction.requestId, data });
        break;
    }
  };

  const handleSubmit = (data: CreateRequestInput) => {
    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest._id || selectedRequest.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedRequest) {
      deleteMutation.mutate(selectedRequest._id || selectedRequest.id);
    }
  };

  const stats = requestsData?.stats || {
    pending: 0,
    approved: 0,
    ready: 0,
    released: 0,
    rejected: 0,
  };

  const residents = residentsData?.data || [];
  const documentTypes = documentTypesData?.data || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Requests</h1>
        <p className="text-gray-600 mt-1">Manage and track document requests</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Approved</p>
              <p className="text-2xl font-bold text-blue-900">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Ready</p>
              <p className="text-2xl font-bold text-purple-900">{stats.ready}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Released</p>
              <p className="text-2xl font-bold text-green-900">{stats.released}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by tracking number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="ready">Ready</option>
              <option value="released">Released</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

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

        <div className="flex justify-end mt-4">
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Request
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resident
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : requestsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requestsData?.data.map((request) => {
                  const resident =
                    typeof request.resident === 'object' ? request.resident : null;
                  const documentType =
                    typeof request.documentType === 'object' ? request.documentType : null;

                  return (
                    <tr key={request._id || request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.trackingNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {resident
                            ? `${resident.firstName} ${resident.middleName ? `${resident.middleName} ` : ''}${resident.lastName}`
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {documentType ? documentType.name : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[request.status]
                          }`}
                        >
                          {request.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleView(request)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>

                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusAction('approve', request._id || request.id)
                                }
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusAction('reject', request._id || request.id)
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(request)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            </>
                          )}

                          {request.status === 'approved' && (
                            <button
                              onClick={() =>
                                handleStatusAction('ready', request._id || request.id)
                              }
                              className="text-purple-600 hover:text-purple-900"
                              title="Mark as Ready"
                            >
                              <Package className="h-5 w-5" />
                            </button>
                          )}

                          {request.status === 'ready' && (
                            <button
                              onClick={() =>
                                handleStatusAction('release', request._id || request.id)
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Release to Resident"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                          )}

                          {(request.status === 'pending' || request.status === 'rejected') && (
                            <button
                              onClick={() => handleDelete(request)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {requestsData && requestsData.total > 0 && (
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
                disabled={page >= Math.ceil(requestsData.total / requestsData.limit)}
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
                    {(page - 1) * requestsData.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(page * requestsData.limit, requestsData.total)}
                  </span>{' '}
                  of <span className="font-medium">{requestsData.total}</span> results
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
                    disabled={page >= Math.ceil(requestsData.total / requestsData.limit)}
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

      {/* Modals */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleSubmit}
        request={selectedRequest}
        residents={residents}
        documentTypes={documentTypes}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <RequestDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['requests'] });
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Request"
        message={`Are you sure you want to delete request ${selectedRequest?.trackingNumber}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Status Change Confirmation Modal */}
      {isConfirmModalOpen && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm {confirmAction.action.charAt(0).toUpperCase() + confirmAction.action.slice(1)}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {confirmAction.action} this request?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add optional remarks..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setConfirmAction(null);
                  setRemarksInput('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={
                  approveMutation.isPending ||
                  rejectMutation.isPending ||
                  readyMutation.isPending ||
                  releaseMutation.isPending
                }
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={
                  approveMutation.isPending ||
                  rejectMutation.isPending ||
                  readyMutation.isPending ||
                  releaseMutation.isPending
                }
              >
                {approveMutation.isPending ||
                rejectMutation.isPending ||
                readyMutation.isPending ||
                releaseMutation.isPending
                  ? 'Processing...'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
