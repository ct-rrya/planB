import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { CertificateService } from './certificate.service';
import { Request, RequestSchema } from '../database/schemas/request.schema';
import { AuditLog, AuditLogSchema } from '../database/schemas/audit-log.schema';
import { Resident, ResidentSchema } from '../database/schemas/resident.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Resident.name, schema: ResidentSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService, CertificateService],
  exports: [RequestsService, CertificateService],
})
export class RequestsModule {}
