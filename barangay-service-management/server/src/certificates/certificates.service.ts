import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from '../database/schemas/request.schema';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) {}

  async verifyCertificate(certificateNumber: string) {
    const request = await this.requestModel
      .findOne({ certificateNumber })
      .populate('resident', 'firstName middleName lastName')
      .populate('documentType', 'name')
      .exec();

    if (!request) {
      throw new NotFoundException(`Certificate ${certificateNumber} not found`);
    }

    const resident = request.resident as any;
    const documentType = request.documentType as any;

    // Determine if certificate is valid
    const isValid = ['certificate_generated', 'printed', 'secretary_signed', 'captain_signed', 'sealed', 'ready', 'released'].includes(request.status);
    const isRevoked = request.status === 'rejected';

    return {
      certificateNumber: request.certificateNumber,
      trackingNumber: request.trackingNumber,
      residentName: `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`,
      documentType: documentType.name,
      dateIssued: request.generatedAt,
      status: isRevoked ? 'Revoked' : (isValid ? 'Valid' : 'Invalid'),
      issuingBarangay: 'Barangay Cayang, Bogo City, Cebu',
      verifiedAt: new Date(),
    };
  }
}
