import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../database/schemas/audit-log.schema';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = new this.auditLogModel(createAuditLogDto);
    return auditLog.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    module?: string,
    startDate?: string,
    endDate?: string,
    adminId?: string,
    sortBy: string = 'timestamp',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (search) {
      query.action = { $regex: search, $options: 'i' };
    }

    if (module) {
      query.module = module;
    }

    if (adminId) {
      query.admin = adminId;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('admin', 'username role')
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditLogModel
      .findById(id)
      .populate('admin', 'username role')
      .exec();
  }

  async getStatsByModule(): Promise<any[]> {
    return this.auditLogModel.aggregate([
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          module: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]).exec();
  }

  async getStatsByAdmin(): Promise<any[]> {
    return this.auditLogModel.aggregate([
      {
        $group: {
          _id: '$admin',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'adminInfo',
        },
      },
      { $unwind: '$adminInfo' },
      {
        $project: {
          _id: 0,
          adminId: '$_id',
          username: '$adminInfo.username',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]).exec();
  }

  async getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
    return this.auditLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('admin', 'username role')
      .exec();
  }
}
