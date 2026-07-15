import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { createRequestSchema, type CreateRequestFormData } from '../../lib/validations/request';
import type { Request, Resident, DocumentType } from '../../types';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRequestFormData) => void;
  request?: Request | null;
  residents: Resident[];
  documentTypes: DocumentType[];
  isLoading?: boolean;
}

export default function RequestModal({
  isOpen,
  onClose,
  onSubmit,
  request,
  residents,
  documentTypes,
  isLoading = false,
}: RequestModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
  });

  useEffect(() => {
    if (request) {
      reset({
        resident: typeof request.resident === 'string' ? request.resident : (request.resident._id || request.resident.id),
        documentType: typeof request.documentType === 'string' ? request.documentType : (request.documentType._id || request.documentType.id),
        purpose: request.purpose,
        remarks: request.remarks || '',
      });
    } else {
      reset({
        resident: '',
        documentType: '',
        purpose: '',
        remarks: '',
      });
    }
  }, [request, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: CreateRequestFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {request ? 'Edit Request' : 'Create New Request'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="resident" className="block text-sm font-medium text-gray-700 mb-1">
              Resident *
            </label>
            <select
              id="resident"
              {...register('resident')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Select Resident</option>
              {residents.map((resident) => (
                <option key={resident._id || resident.id} value={resident._id || resident.id}>
                  {resident.firstName} {resident.middleName ? `${resident.middleName} ` : ''}{resident.lastName}
                </option>
              ))}
            </select>
            {errors.resident && (
              <p className="mt-1 text-sm text-red-600">{errors.resident.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            <select
              id="documentType"
              {...register('documentType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Select Document Type</option>
              {documentTypes
                .filter((doc) => doc.isActive)
                .map((docType) => (
                  <option key={docType._id || docType.id} value={docType._id || docType.id}>
                    {docType.name} - ₱{docType.fee} ({docType.processingDays} days)
                  </option>
                ))}
            </select>
            {errors.documentType && (
              <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
              Purpose *
            </label>
            <textarea
              id="purpose"
              {...register('purpose')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the purpose of this request"
              disabled={isLoading}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              {...register('remarks')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes or remarks"
              disabled={isLoading}
            />
            {errors.remarks && (
              <p className="mt-1 text-sm text-red-600">{errors.remarks.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : request ? 'Update Request' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
