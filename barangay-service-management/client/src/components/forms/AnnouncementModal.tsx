import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { createAnnouncementSchema, type CreateAnnouncementFormData } from '../../lib/validations/announcement';
import type { Announcement } from '../../types';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementFormData) => void;
  announcement?: Announcement | null;
  isLoading?: boolean;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  announcement,
  isLoading = false,
}: AnnouncementModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema),
  });

  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title,
        content: announcement.content,
        imageUrl: announcement.imageUrl || '',
      });
    } else {
      reset({
        title: '',
        content: '',
        imageUrl: '',
      });
    }
  }, [announcement, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: CreateAnnouncementFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter announcement title"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              {...register('content')}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter announcement content (supports plain text)"
              disabled={isLoading}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Tip: Use line breaks for better formatting
            </p>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="text"
              id="imageUrl"
              {...register('imageUrl')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
              disabled={isLoading}
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter a valid URL to an image to display with the announcement
            </p>
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
              {isLoading ? 'Saving...' : announcement ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
