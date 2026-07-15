import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsService } from '@/services/documents.service';
import DocumentModal from '@/components/forms/DocumentModal';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';
import type { DocumentType } from '@/types';
import type { DocumentFormData } from '@/lib/validations/document';

const Documents = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentType | null>(null);

  const limit = 10;

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['documents', page, search],
    queryFn: () =>
      documentsService.getAll({
        page,
        limit,
        search: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: documentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document type added successfully!');
      setIsModalOpen(false);
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add document type');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentFormData }) =>
      documentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document type updated successfully!');
      setIsModalOpen(false);
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update document type');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: documentsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document type deactivated successfully!');
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate document type');
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: documentsService.toggleActive,
    onSuccess: (updatedDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(
        `Document type ${updatedDoc.isActive ? 'activated' : 'deactivated'} successfully!`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    },
  });

  const handleSubmit = (formData: DocumentFormData) => {
    const submitData = {
      ...formData,
      isActive: formData.isActive ?? true,
    };

    if (selectedDocument) {
      updateMutation.mutate({
        id: selectedDocument._id || selectedDocument.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (document: DocumentType) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleDelete = (document: DocumentType) => {
    setDocumentToDelete(document);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete._id || documentToDelete.id);
    }
  };

  const handleToggleActive = (document: DocumentType) => {
    toggleActiveMutation.mutate(document._id || document.id);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleAddNew = () => {
    setSelectedDocument(null);
    setIsModalOpen(true);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Types</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage document services offered by the barangay
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Document Type
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
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
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading document types...</p>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((doc) => (
                    <tr key={doc._id || doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {doc.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          {doc.requirements.slice(0, 2).map((req, idx) => (
                            <div key={idx} className="text-xs">
                              • {req}
                            </div>
                          ))}
                          {doc.requirements.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{doc.requirements.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₱{doc.fee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {doc.processingDays} {doc.processingDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(doc)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            doc.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {doc.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, data.total)} of {data.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-1 text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">
              {search
                ? 'No document types found matching your search.'
                : 'No document types yet. Add your first document type!'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleSubmit}
        document={selectedDocument}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate Document Type"
        message={`Are you sure you want to deactivate "${documentToDelete?.name}"? This will mark it as inactive but not permanently delete it.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Documents;
