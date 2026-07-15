import { X, Download, Printer, FileText, ExternalLink } from 'lucide-react';
import type { Request } from '../../types';
import { format } from 'date-fns';
import { useState } from 'react';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  request,
}: CertificatePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!isOpen || !request) return null;

  const resident = typeof request.resident === 'object' ? request.resident : null;
  const documentType = typeof request.documentType === 'object' ? request.documentType : null;

  const certificateUrl = request.certificateUrl 
    ? `http://localhost:3000${request.certificateUrl}` 
    : null;

  const verificationUrl = request.certificateNumber
    ? `http://localhost:5173/verify/${request.certificateNumber}`
    : null;

  const handleDownload = () => {
    if (certificateUrl) {
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `${request.certificateNumber}.pdf`;
      link.click();
    }
  };

  const handlePrint = () => {
    if (certificateUrl) {
      const printWindow = window.open(certificateUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleOpenInNewTab = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // No certificate generated yet
  if (!request.certificateNumber || !certificateUrl) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Empty State */}
            <div className="text-center py-12">
              <FileText className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Certificate Not Yet Generated
              </h3>
              <p className="text-gray-600 mb-6">
                This certificate has not been generated yet. Please approve the request to generate the certificate.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800 font-medium mb-2">Request Information:</p>
                <div className="space-y-1 text-sm text-blue-900">
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-semibold">{request.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold">{formatStatusLabel(request.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resident:</span>
                    <span className="font-semibold">
                      {resident
                        ? `${resident.firstName} ${resident.lastName}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
              <p className="text-sm text-gray-500 mt-1">
                Certificate #{request.certificateNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Certificate Information */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Certificate Number</p>
                <p className="text-sm font-semibold text-gray-900">{request.certificateNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tracking Number</p>
                <p className="text-sm font-semibold text-gray-900">{request.trackingNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">OR Number</p>
                <p className="text-sm font-semibold text-gray-900">{request.orNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Resident Name</p>
                <p className="text-sm font-semibold text-gray-900">
                  {resident
                    ? `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Document Type</p>
                <p className="text-sm font-semibold text-gray-900">
                  {documentType ? documentType.name : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date Issued</p>
                <p className="text-sm font-semibold text-gray-900">
                  {request.generatedAt
                    ? format(new Date(request.generatedAt), 'MMM dd, yyyy')
                    : 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Purpose</p>
                <p className="text-sm font-semibold text-gray-900">{request.purpose}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatStatusLabel(request.status)}
                </p>
              </div>
            </div>

            {/* Verification Link */}
            {verificationUrl && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 font-medium mb-1">QR Code Verification Link:</p>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline break-all flex items-center"
                >
                  {verificationUrl}
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 bg-white border-b border-gray-200 flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-[#0A2947] text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-[#8B5E3C] text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto p-6 bg-gray-100">
            {hasError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Failed to Load Certificate
                  </h3>
                  <p className="text-gray-600 mb-4">
                    There was an error loading the certificate PDF. The file may be missing or corrupted.
                  </p>
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2947] mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading certificate...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={certificateUrl}
                  className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`}
                  title="Certificate Preview"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
