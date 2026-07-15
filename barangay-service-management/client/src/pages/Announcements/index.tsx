import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Megaphone,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  announcementsService,
  type CreateAnnouncementInput,
} from '../../services/announcements.service';
import AnnouncementModal from '../../components/forms/AnnouncementModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import type { Announcement } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Announcements() {
  const queryClient = useQueryClient();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('');

  // Queries
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements', page, search, publishedFilter],
    queryFn: () =>
      announcementsService.getAll({
        page,
        limit: 10,
        search,
        published: publishedFilter === '' ? undefined : publishedFilter === 'true',
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateAnnouncementInput) => announcementsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAnnouncementInput }) =>
      announcementsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated successfully');
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update announcement');
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => announcementsService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement published successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish announcement');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => announcementsService.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement unpublished successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unpublish announcement');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedAnnouncement(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteModalOpen(true);
  };

  const handleTogglePublish = (announcement: Announcement) => {
    if (announcement.published) {
      unpublishMutation.mutate(announcement._id || announcement.id);
    } else {
      publishMutation.mutate(announcement._id || announcement.id);
    }
  };

  const handleSubmit = (data: CreateAnnouncementInput) => {
    if (selectedAnnouncement) {
      updateMutation.mutate({
        id: selectedAnnouncement._id || selectedAnnouncement.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedAnnouncement) {
      deleteMutation.mutate(selectedAnnouncement._id || selectedAnnouncement.id);
    }
  };

  const publishedCount = announcementsData?.data.filter((a) => a.published).length || 0;
  const unpublishedCount = announcementsData?.data.filter((a) => !a.published).length || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Announcements</h1>
        <p className="text-secondary-700 mt-1">Manage community announcements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card hover-lift transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700">Total Announcements</p>
              <p className="text-2xl font-bold text-primary mt-1">{announcementsData?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card hover-lift transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700">Published</p>
              <p className="text-2xl font-bold text-primary mt-1">{publishedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card hover-lift transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-700">Unpublished</p>
              <p className="text-2xl font-bold text-primary mt-1">{unpublishedCount}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-secondary-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-5 mb-6 border border-secondary-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white outline-none transition text-primary placeholder-secondary-500"
            />
          </div>

          <div>
            <select
              value={publishedFilter}
              onChange={(e) => {
                setPublishedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white outline-none transition text-primary"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-soft hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Create Announcement
          </button>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
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
              ) : announcementsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No announcements found
                  </td>
                </tr>
              ) : (
                announcementsData?.data.map((announcement) => {
                  const createdBy =
                    typeof announcement.createdBy === 'object' ? announcement.createdBy : null;

                  return (
                    <tr key={announcement._id || announcement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {announcement.title}
                            </div>
                            {announcement.imageUrl && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Has image
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {announcement.content.substring(0, 100)}
                          {announcement.content.length > 100 ? '...' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            announcement.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {announcement.published ? 'Published' : 'Unpublished'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {createdBy ? createdBy.username : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(announcement.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleView(announcement)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(announcement)}
                            className={`${
                              announcement.published
                                ? 'text-gray-600 hover:text-gray-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={announcement.published ? 'Unpublish' : 'Publish'}
                            disabled={
                              publishMutation.isPending || unpublishMutation.isPending
                            }
                          >
                            {announcement.published ? (
                              <XCircle className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(announcement)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
        {announcementsData && announcementsData.total > 0 && (
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
                disabled={page >= Math.ceil(announcementsData.total / announcementsData.limit)}
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
                    {(page - 1) * announcementsData.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(page * announcementsData.limit, announcementsData.total)}
                  </span>{' '}
                  of <span className="font-medium">{announcementsData.total}</span> results
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
                      page >= Math.ceil(announcementsData.total / announcementsData.limit)
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

      {/* Modals */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        onSubmit={handleSubmit}
        announcement={selectedAnnouncement}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${selectedAnnouncement?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* View Modal */}
      {isViewModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAnnouncement.title}
                </h2>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                  <span>
                    By:{' '}
                    {typeof selectedAnnouncement.createdBy === 'object'
                      ? selectedAnnouncement.createdBy.username
                      : 'N/A'}
                  </span>
                  <span>
                    {format(new Date(selectedAnnouncement.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedAnnouncement.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedAnnouncement.published ? 'Published' : 'Unpublished'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedAnnouncement(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedAnnouncement.imageUrl && (
              <div className="mb-4">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedAnnouncement.content}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedAnnouncement(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
