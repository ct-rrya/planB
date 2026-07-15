import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Resident, ResidentSchema } from '../database/schemas/resident.schema';
import { Request, RequestSchema } from '../database/schemas/request.schema';
import { Announcement, AnnouncementSchema } from '../database/schemas/announcement.schema';
import { DocumentType, DocumentTypeSchema } from '../database/schemas/document-type.schema';
import { AuditLog, AuditLogSchema } from '../database/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: DocumentType.name, schema: DocumentTypeSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
