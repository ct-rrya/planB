import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Resident, ResidentSchema } from '../database/schemas/resident.schema';
import { Request, RequestSchema } from '../database/schemas/request.schema';
import { DocumentType, DocumentTypeSchema } from '../database/schemas/document-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      { name: Request.name, schema: RequestSchema },
      { name: DocumentType.name, schema: DocumentTypeSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
