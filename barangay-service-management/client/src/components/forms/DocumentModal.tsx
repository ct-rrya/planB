import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { documentSchema, type DocumentFormData } from '@/lib/validations/document';
import type { DocumentType } from '@/types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => void;
  document?: DocumentType | null;
  isLoading?: boolean;
}

const DocumentModal = ({
  isOpen,
  onClose,
  onSubmit,
  document,
  isLoading,
}: DocumentModalProps) => {
  const [requirements, setRequirements] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  useEffect(() => {
    if (document) {
      reset({
        name: document.name,
        description: document.description,
        requirements: document.requirements,
        fee: document.fee,
        processingDays: document.processingDays,
        isActive: document.isActive,
      });
      setRequirements(document.requirements.length > 0 ? document.requirements : ['']);
    } else {
      reset({
        name: '',
        description: '',
        requirements: [],
        fee: 0,
        processingDays: 3,
        isActive: true,
      });
      setRequirements(['']);
    }
  }, [document, reset]);

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      const newRequirements = requirements.filter((_, i) => i !== index);
      setRequirements(newRequirements);
      setValue('requirements', newRequirements.filter(r => r.trim() !== ''));
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
    setValue('requirements', newRequirements.filter(r => r.trim() !== ''));
  };

  const handleFormSubmit = (data: DocumentFormData) => {
    const filteredRequirements = requirements.filter(r => r.trim() !== '');
    onSubmit({
      ...data,
      requirements: filteredRequirements,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {document ? 'Edit Document Type' : 'Add New Document Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="e.g., Barangay Clearance"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief description of the document"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      disabled={isLoading}
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                Add Requirement
              </button>
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
              )}
            </div>

            {/* Fee and Processing Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('fee', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                    errors.fee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.fee && (
                  <p className="mt-1 text-sm text-red-600">{errors.fee.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Days <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('processingDays', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
                    errors.processingDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.processingDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.processingDays.message}</p>
                )}
              </div>
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                {...register('isActive')}
                type="checkbox"
                id="isActive"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={isLoading}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (available for residents to request)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : document ? 'Update Document' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
