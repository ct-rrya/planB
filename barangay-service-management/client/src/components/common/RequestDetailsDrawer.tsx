import { X, FileText, Download, Printer, CheckCircle } from 'lucide-react';
import type { Request } from '../../types';
import { format } from 'date-fns';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CertificatePreviewModal from './CertificatePreviewModal';

interface RequestDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onUpdate?: () => void;
}

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

export default function RequestDetailsDrawer({
  isOpen,
  onClose,
  request,
  onUpdate,
}: RequestDetailsDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  if (!isOpen || !request) return null;

  const resident = typeof request.resident === 'object' ? request.resident : null;
  const documentType = typeof request.documentType === 'object' ? request.documentType : null;
  const releasedBy = typeof request.releasedBy === 'object' ? request.releasedBy : null;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  const handleWorkflowAction = async (endpoint: string, successMessage: string) => {
    try {
      setIsLoading(true);
      await axios.patch(
        `${API_URL}/requests/${request._id || request.id}/${endpoint}`,
        { remarks: `${successMessage} via admin panel` },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(successMessage);
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${successMessage.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAndGenerate = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_URL}/requests/${request._id || request.id}/approve-and-generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Certificate generated successfully!');
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewCertificate = () => {
    setIsPreviewOpen(true);
  };

  const handleDownloadCertificate = () => {
    if (request.certificateUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:3000${request.certificateUrl}`;
      link.download = `${request.certificateNumber}.pdf`;
      link.click();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <p className="text-sm text-gray-500 mt-1">Tracking #: {request.trackingNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[request.status]
              }`}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          {/* Request Information */}
          <div className="space-y-6">
            {/* Resident Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resident Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {resident
                      ? `${resident.firstName} ${resident.middleName ? `${resident.middleName} ` : ''}${resident.lastName}`
                      : 'N/A'}
                  </span>
                </div>
                {resident && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contact Number:</span>
                      <span className="text-sm font-medium text-gray-900">{resident.contactNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Address:</span>
                      <span className="text-sm font-medium text-gray-900">{resident.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Purok:</span>
                      <span className="text-sm font-medium text-gray-900">{resident.purok}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Document Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Document Type:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {documentType ? documentType.name : 'N/A'}
                  </span>
                </div>
                {documentType && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fee:</span>
                      <span className="text-sm font-medium text-gray-900">₱{documentType.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Processing Days:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {documentType.processingDays} days
                      </span>
                    </div>
                    {documentType.description && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-600 block mb-1">Description:</span>
                        <p className="text-sm text-gray-900">{documentType.description}</p>
                      </div>
                    )}
                    {documentType.requirements && documentType.requirements.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-600 block mb-1">Requirements:</span>
                        <ul className="list-disc list-inside text-sm text-gray-900">
                          {documentType.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Purpose:</span>
                  <p className="text-sm text-gray-900">{request.purpose}</p>
                </div>
                {request.remarks && (
                  <div className="pt-2">
                    <span className="text-sm text-gray-600 block mb-1">Remarks:</span>
                    <p className="text-sm text-gray-900">{request.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Requested</span>
                    <p className="text-xs text-gray-600">
                      {format(new Date(request.requestedAt), 'PPpp')}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                </div>

                {request.approvedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Approved</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.approvedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                )}

                {request.generatedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Certificate Generated</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.generatedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  </div>
                )}

                {request.printedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Printed</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.printedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  </div>
                )}

                {request.secretarySignedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Secretary Signed</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.secretarySignedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-teal-500 rounded-full" />
                  </div>
                )}

                {request.captainSignedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Captain Signed</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.captainSignedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                  </div>
                )}

                {request.sealAppliedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Seal Applied</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.sealAppliedAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  </div>
                )}

                {request.readyForPickupAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Ready for Pickup</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.readyForPickupAt), 'PPpp')}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-lime-500 rounded-full" />
                  </div>
                )}

                {request.releasedAt && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Released</span>
                      <p className="text-xs text-gray-600">
                        {format(new Date(request.releasedAt), 'PPpp')}
                      </p>
                      {releasedBy && (
                        <p className="text-xs text-gray-500">By: {releasedBy.username}</p>
                      )}
                    </div>
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Information */}
            {request.certificateNumber && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Certificate Information</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Certificate Number:</span>
                    <span className="text-sm font-medium text-gray-900">{request.certificateNumber}</span>
                  </div>
                  {request.orNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">OR Number:</span>
                      <span className="text-sm font-medium text-gray-900">{request.orNumber}</span>
                    </div>
                  )}
                  {request.generatedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Generated:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(request.generatedAt), 'PPp')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processing Checklist */}
            {request.certificateNumber && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing Checklist</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.certificateNumber ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Certificate Generated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.printed ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Printed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.secretarySigned ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Secretary Signed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.captainSigned ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Punong Barangay Signed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.sealApplied ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Official Seal Applied</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.readyForPickup ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Ready for Pickup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${request.status === 'released' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm text-gray-700">Released</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Workflow Actions */}
          <div className="mt-6 space-y-3">
            {/* Approve & Generate Certificate */}
            {request.status === 'pending' && (
              <button
                onClick={handleApproveAndGenerate}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>{isLoading ? 'Generating...' : 'Approve & Generate Certificate'}</span>
              </button>
            )}

            {/* Certificate Actions */}
            {request.certificateUrl && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePreviewCertificate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            )}

            {/* Mark as Printed */}
            {request.status === 'certificate_generated' && (
              <button
                onClick={() => handleWorkflowAction('mark-printed', 'Marked as printed')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>{isLoading ? 'Processing...' : 'Mark as Printed'}</span>
              </button>
            )}

            {/* Secretary Signed */}
            {request.status === 'printed' && (
              <button
                onClick={() => handleWorkflowAction('secretary-signed', 'Secretary signature recorded')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Secretary Signed'}
              </button>
            )}

            {/* Captain Signed */}
            {request.status === 'secretary_signed' && (
              <button
                onClick={() => handleWorkflowAction('captain-signed', 'Punong Barangay signature recorded')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Punong Barangay Signed'}
              </button>
            )}

            {/* Seal Applied */}
            {request.status === 'captain_signed' && (
              <button
                onClick={() => handleWorkflowAction('seal-applied', 'Official seal applied')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Apply Official Seal'}
              </button>
            )}

            {/* Ready for Pickup */}
            {request.status === 'sealed' && (
              <button
                onClick={() => handleWorkflowAction('ready-for-pickup', 'Marked as ready for pickup')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Mark Ready for Pickup'}
              </button>
            )}

            {/* Release */}
            {request.status === 'ready' && (
              <button
                onClick={() => handleWorkflowAction('release', 'Released to resident')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Release Document'}
              </button>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        request={request}
      />
    </>
  );
}
