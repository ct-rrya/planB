import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentType, DocumentTypeSchema } from '../database/schemas/document-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentType.name, schema: DocumentTypeSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
