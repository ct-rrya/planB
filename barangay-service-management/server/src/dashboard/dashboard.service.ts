import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resident } from '../database/schemas/resident.schema';
import { Request } from '../database/schemas/request.schema';
import { Announcement } from '../database/schemas/announcement.schema';
import { DocumentType } from '../database/schemas/document-type.schema';
import { AuditLog } from '../database/schemas/audit-log.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(Announcement.name) private announcementModel: Model<Announcement>,
    @InjectModel(DocumentType.name) private documentTypeModel: Model<DocumentType>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalResidents,
      pendingRequests,
      approvedToday,
      releasedToday,
      totalAnnouncements,
      publishedAnnouncements,
    ] = await Promise.all([
      this.residentModel.countDocuments().exec(),
      this.requestModel.countDocuments({ status: 'pending' }).exec(),
      this.requestModel
        .countDocuments({
          status: 'approved',
          approvedAt: { $gte: today, $lt: tomorrow },
        })
        .exec(),
      this.requestModel
        .countDocuments({
          status: 'released',
          releasedAt: { $gte: today, $lt: tomorrow },
        })
        .exec(),
      this.announcementModel.countDocuments().exec(),
      this.announcementModel.countDocuments({ published: true }).exec(),
    ]);

    return {
      totalResidents,
      pendingRequests,
      approvedToday,
      releasedToday,
      totalAnnouncements,
      publishedAnnouncements,
    };
  }

  async getMonthlyRequests(months: number = 6) {
    const result = await this.requestModel.aggregate([
      {
        $match: {
          requestedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$requestedAt' },
            month: { $month: '$requestedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
        },
      },
    ]);

    return result;
  }

  async getMostRequestedDocuments(limit: number = 5) {
    const result = await this.requestModel.aggregate([
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'documenttypes',
          localField: '_id',
          foreignField: '_id',
          as: 'documentInfo',
        },
      },
      {
        $unwind: '$documentInfo',
      },
      {
        $project: {
          _id: 0,
          documentId: '$_id',
          documentName: '$documentInfo.name',
          count: 1,
        },
      },
    ]);

    return result;
  }

  async getRecentRequests(limit: number = 5) {
    const requests = await this.requestModel
      .find()
      .sort({ requestedAt: -1 })
      .limit(limit)
      .populate('resident', 'firstName middleName lastName')
      .populate('documentType', 'name')
      .select('trackingNumber status requestedAt resident documentType')
      .exec();

    return requests;
  }

  async getRecentAuditLogs(limit: number = 10) {
    const logs = await this.auditLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('admin', 'username')
      .select('action timestamp admin')
      .exec();

    return logs;
  }

  async getRequestStatusDistribution() {
    const result = await this.requestModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    return result;
  }
}
