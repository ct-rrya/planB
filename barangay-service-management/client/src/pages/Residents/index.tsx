import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { residentsService } from '@/services/residents.service';
import ResidentModal from '@/components/forms/ResidentModal';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import type { Resident } from '@/types';
import type { ResidentFormData } from '@/lib/validations/resident';

const Residents = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);

  const limit = 10;

  // Fetch residents
  const { data, isLoading } = useQuery({
    queryKey: ['residents', page, search],
    queryFn: () =>
      residentsService.getAll({
        page,
        limit,
        search: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: residentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Resident added successfully!');
      setIsModalOpen(false);
      setSelectedResident(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add resident');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResidentFormData }) =>
      residentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Resident updated successfully!');
      setIsModalOpen(false);
      setSelectedResident(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update resident');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: residentsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Resident deleted successfully!');
      setIsDeleteModalOpen(false);
      setResidentToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete resident');
    },
  });

  const handleSubmit = (formData: ResidentFormData) => {
    if (selectedResident) {
      updateMutation.mutate({
        id: selectedResident._id || selectedResident.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };

  const handleDelete = (resident: Resident) => {
    setResidentToDelete(resident);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (residentToDelete) {
      deleteMutation.mutate(residentToDelete._id || residentToDelete.id);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleAddNew = () => {
    setSelectedResident(null);
    setIsModalOpen(true);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Residents Management</h1>
          <p className="text-sm text-secondary-700 mt-1">
            Manage barangay residents information
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-soft hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          <Plus className="w-5 h-5" />
          Add Resident
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-card mb-6 p-5 border border-secondary-200">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, contact, address, or purok..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-11 pr-4 py-3 border border-secondary-300 bg-secondary-50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-white outline-none transition text-primary placeholder-secondary-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-lg transition-all shadow-soft hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setPage(1);
              }}
              className="px-5 py-3 bg-secondary-200 hover:bg-secondary-300 text-primary font-semibold rounded-lg transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden border border-secondary-200">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-secondary-700 font-medium">Loading residents...</p>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-100 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                      Birth Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                      Sex
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                      Purok
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                      Civil Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-primary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-100">
                  {data.data.map((resident) => (
                    <tr key={resident._id || resident.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary">
                          {resident.firstName} {resident.middleName}{' '}
                          {resident.lastName}
                        </div>
                        <div className="text-sm text-secondary-700">{resident.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {formatDate(resident.birthDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {resident.sex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-mono">
                        {resident.contactNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-accent-100 text-accent-800 rounded-full border border-accent-200">
                          {resident.purok}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary capitalize">
                        {resident.civilStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(resident)}
                          className="text-primary hover:text-accent mr-4 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(resident)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
              <div className="text-sm text-primary font-medium">
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, data.total)} of {data.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-secondary-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white text-primary font-medium"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm text-primary font-semibold bg-white border border-secondary-300 rounded-lg">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 border border-secondary-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white text-primary font-medium"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center bg-secondary-50">
            <p className="text-secondary-700 text-base">
              {search ? 'No residents found matching your search.' : 'No residents yet. Add your first resident!'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ResidentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResident(null);
        }}
        onSubmit={handleSubmit}
        resident={selectedResident}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setResidentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Resident"
        message={`Are you sure you want to delete ${residentToDelete?.firstName} ${residentToDelete?.lastName}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Residents;
