import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from '../database/schemas/request.schema';
import { AuditLog } from '../database/schemas/audit-log.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CertificateService } from './certificate.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    private notificationsService: NotificationsService,
    private certificateService: CertificateService,
  ) {}

  private async generateTrackingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REQ-${year}-`;

    // Get the latest request for this year
    const latestRequest = await this.requestModel
      .findOne({ trackingNumber: new RegExp(`^${prefix}`) })
      .sort({ trackingNumber: -1 })
      .exec();

    let sequence = 1;
    if (latestRequest) {
      const lastNumber = parseInt(latestRequest.trackingNumber.split('-')[2]);
      sequence = lastNumber + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  private async createAuditLog(action: string, adminId: string): Promise<void> {
    const auditLog = new this.auditLogModel({
      action,
      module: 'request',
      admin: adminId,
      timestamp: new Date(),
    });
    await auditLog.save();
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['certificate_generated'],
      certificate_generated: ['printed'],
      printed: ['secretary_signed'],
      secretary_signed: ['captain_signed'],
      captain_signed: ['sealed'],
      sealed: ['ready'],
      ready: ['released'],
      released: [],
      rejected: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async create(createRequestDto: CreateRequestDto, adminId: string): Promise<Request> {
    const trackingNumber = await this.generateTrackingNumber();
    
    const request = new this.requestModel({
      ...createRequestDto,
      trackingNumber,
      status: 'pending',
    });

    const savedRequest = await request.save();
    
    await this.createAuditLog(
      `Created request ${trackingNumber} for document type ${createRequestDto.documentType}`,
      adminId
    );

    const populatedRequest = await this.requestModel
      .findById(savedRequest._id)
      .populate('resident')
      .populate('documentType')
      .populate('releasedBy')
      .exec();

    if (!populatedRequest) {
      throw new NotFoundException(`Request with ID ${savedRequest._id} not found`);
    }

    return populatedRequest;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    sortBy: string = 'requestedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Request[]; total: number; page: number; limit: number; stats: any }> {
    const query: any = {};

    if (search) {
      query.trackingNumber = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.requestedAt = {};
      if (startDate) query.requestedAt.$gte = new Date(startDate);
      if (endDate) query.requestedAt.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total, stats] = await Promise.all([
      this.requestModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('resident')
        .populate('documentType')
        .populate('releasedBy')
        .exec(),
      this.requestModel.countDocuments(query).exec(),
      this.getStats(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      stats,
    };
  }

  async getStats(): Promise<any> {
    const [
      pendingReview,
      approved,
      certificateGenerated,
      printed,
      secretarySigned,
      captainSigned,
      sealed,
      ready,
      released,
      rejected,
    ] = await Promise.all([
      this.requestModel.countDocuments({ status: 'pending' }).exec(),
      this.requestModel.countDocuments({ status: 'approved' }).exec(),
      this.requestModel.countDocuments({ status: 'certificate_generated' }).exec(),
      this.requestModel.countDocuments({ status: 'printed' }).exec(),
      this.requestModel.countDocuments({ status: 'secretary_signed' }).exec(),
      this.requestModel.countDocuments({ status: 'captain_signed' }).exec(),
      this.requestModel.countDocuments({ status: 'sealed' }).exec(),
      this.requestModel.countDocuments({ status: 'ready' }).exec(),
      this.requestModel.countDocuments({ status: 'released' }).exec(),
      this.requestModel.countDocuments({ status: 'rejected' }).exec(),
    ]);

    return {
      pendingReview,
      approved,
      certificateGenerated,
      printed,
      secretarySigned,
      captainSigned,
      sealed,
      ready,
      released,
      rejected,
      total: pendingReview + approved + certificateGenerated + printed + secretarySigned + captainSigned + sealed + ready + released + rejected,
    };
  }

  async findOne(id: string): Promise<Request> {
    const request = await this.requestModel
      .findById(id)
      .populate('resident')
      .populate('documentType')
      .populate('releasedBy')
      .exec();

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Request> {
    const request = await this.requestModel
      .findOne({ trackingNumber })
      .populate('resident')
      .populate('documentType')
      .populate('releasedBy')
      .exec();

    if (!request) {
      throw new NotFoundException(`Request with tracking number ${trackingNumber} not found`);
    }

    return request;
  }

  async update(id: string, updateRequestDto: UpdateRequestDto): Promise<Request> {
    const request = await this.requestModel
      .findByIdAndUpdate(id, updateRequestDto, { new: true })
      .populate('resident')
      .populate('documentType')
      .populate('releasedBy')
      .exec();

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async approve(id: string, updateStatusDto: UpdateStatusDto, adminId: string): Promise<Request> {
    const request = await this.findOne(id);
    this.validateStatusTransition(request.status, 'approved');

    request.status = 'approved';
    request.approvedAt = new Date();
    if (updateStatusDto.remarks) {
      request.remarks = updateStatusDto.remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Approved request ${request.trackingNumber}`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendRequestApprovedNotification(id);

    return this.findOne(id);
  }

  async reject(id: string, updateStatusDto: UpdateStatusDto, adminId: string): Promise<Request> {
    const request = await this.findOne(id);
    this.validateStatusTransition(request.status, 'rejected');

    request.status = 'rejected';
    if (updateStatusDto.remarks) {
      request.remarks = updateStatusDto.remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Rejected request ${request.trackingNumber}`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendRequestRejectedNotification(id);

    return this.findOne(id);
  }

  async markReady(id: string, updateStatusDto: UpdateStatusDto, adminId: string): Promise<Request> {
    const request = await this.findOne(id);
    this.validateStatusTransition(request.status, 'ready');

    request.status = 'ready';
    if (updateStatusDto.remarks) {
      request.remarks = updateStatusDto.remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Marked request ${request.trackingNumber} as ready for release`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendRequestReadyNotification(id);

    return this.findOne(id);
  }

  async release(id: string, updateStatusDto: UpdateStatusDto, adminId: string): Promise<Request> {
    const request = await this.findOne(id);
    this.validateStatusTransition(request.status, 'released');

    request.status = 'released';
    request.releasedAt = new Date();
    request.releasedBy = adminId as any;
    if (updateStatusDto.remarks) {
      request.remarks = updateStatusDto.remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Released request ${request.trackingNumber} to resident`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendRequestReleasedNotification(id);

    return this.findOne(id);
  }

  // New Certificate Workflow Methods
  async approveAndGenerateCertificate(id: string, adminId: string, orNumber?: string): Promise<Request> {
    const request = await this.findOne(id);
    this.validateStatusTransition(request.status, 'approved');

    // Update to approved status
    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = adminId as any;

    await request.save();
    await this.createAuditLog(
      `Approved request ${request.trackingNumber}`,
      adminId
    );

    // Send approval notification
    await this.notificationsService.sendRequestApprovedNotification(id);

    // Generate certificate automatically
    const updatedRequest = await this.certificateService.generateCertificate(id, adminId);
    
    // Add OR number if provided
    if (orNumber) {
      updatedRequest.orNumber = orNumber;
      await updatedRequest.save();
    }

    await this.createAuditLog(
      `Certificate generated: ${updatedRequest.certificateNumber}`,
      adminId
    );

    // Send certificate generated notification
    await this.notificationsService.sendCertificateGeneratedNotification(id);

    return this.findOne(id);
  }

  async markPrinted(id: string, adminId: string, remarks?: string): Promise<Request> {
    const request = await this.findOne(id);
    
    if (!request.certificateNumber) {
      throw new BadRequestException('Certificate must be generated before marking as printed');
    }

    this.validateStatusTransition(request.status, 'printed');

    request.status = 'printed';
    request.printed = true;
    request.printedAt = new Date();
    request.printedBy = adminId as any;
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Marked request ${request.trackingNumber} as printed`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendCertificatePrintedNotification(id);

    return this.findOne(id);
  }

  async markSecretarySigned(id: string, adminId: string, remarks?: string): Promise<Request> {
    const request = await this.findOne(id);
    
    if (!request.printed) {
      throw new BadRequestException('Certificate must be printed before secretary can sign');
    }

    this.validateStatusTransition(request.status, 'secretary_signed');

    request.status = 'secretary_signed';
    request.secretarySigned = true;
    request.secretarySignedAt = new Date();
    request.secretarySignedBy = adminId as any;
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Barangay Secretary signed certificate for request ${request.trackingNumber}`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendSecretarySignedNotification(id);

    return this.findOne(id);
  }

  async markCaptainSigned(id: string, adminId: string, remarks?: string): Promise<Request> {
    const request = await this.findOne(id);
    
    if (!request.secretarySigned) {
      throw new BadRequestException('Secretary must sign before captain can sign');
    }

    this.validateStatusTransition(request.status, 'captain_signed');

    request.status = 'captain_signed';
    request.captainSigned = true;
    request.captainSignedAt = new Date();
    request.captainSignedBy = adminId as any;
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Punong Barangay signed certificate for request ${request.trackingNumber}`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendCaptainSignedNotification(id);

    return this.findOne(id);
  }

  async markSealApplied(id: string, adminId: string, remarks?: string): Promise<Request> {
    const request = await this.findOne(id);
    
    if (!request.captainSigned) {
      throw new BadRequestException('Captain must sign before seal can be applied');
    }

    this.validateStatusTransition(request.status, 'sealed');

    request.status = 'sealed';
    request.sealApplied = true;
    request.sealAppliedAt = new Date();
    request.sealAppliedBy = adminId as any;
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Official seal applied to certificate for request ${request.trackingNumber}`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendSealAppliedNotification(id);

    return this.findOne(id);
  }

  async markReadyForPickup(id: string, adminId: string, remarks?: string): Promise<Request> {
    const request = await this.findOne(id);
    
    // Validate all prerequisites are complete
    if (!request.secretarySigned) {
      throw new BadRequestException('Secretary signature required');
    }
    if (!request.captainSigned) {
      throw new BadRequestException('Captain signature required');
    }
    if (!request.sealApplied) {
      throw new BadRequestException('Official seal required');
    }

    this.validateStatusTransition(request.status, 'ready');

    request.status = 'ready';
    request.readyForPickup = true;
    request.readyForPickupAt = new Date();
    request.readyForPickupBy = adminId as any;
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();
    await this.createAuditLog(
      `Marked request ${request.trackingNumber} as ready for pickup`,
      adminId
    );

    // Send notification
    await this.notificationsService.sendRequestReadyNotification(id);

    return this.findOne(id);
  }

  async getProcessingChecklist(id: string): Promise<any> {
    const request = await this.findOne(id);

    return {
      certificateGenerated: {
        completed: !!request.certificateNumber,
        completedAt: request.generatedAt,
        completedBy: request.generatedBy,
      },
      printed: {
        completed: request.printed,
        completedAt: request.printedAt,
        completedBy: request.printedBy,
      },
      secretarySigned: {
        completed: request.secretarySigned,
        completedAt: request.secretarySignedAt,
        completedBy: request.secretarySignedBy,
        required: true,
      },
      captainSigned: {
        completed: request.captainSigned,
        completedAt: request.captainSignedAt,
        completedBy: request.captainSignedBy,
        required: true,
      },
      sealApplied: {
        completed: request.sealApplied,
        completedAt: request.sealAppliedAt,
        completedBy: request.sealAppliedBy,
        required: true,
      },
      readyForPickup: {
        completed: request.readyForPickup,
        completedAt: request.readyForPickupAt,
        completedBy: request.readyForPickupBy,
        canComplete: request.secretarySigned && request.captainSigned && request.sealApplied,
      },
      released: {
        completed: request.status === 'released',
        completedAt: request.releasedAt,
        completedBy: request.releasedBy,
      },
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.requestModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
  }
}
