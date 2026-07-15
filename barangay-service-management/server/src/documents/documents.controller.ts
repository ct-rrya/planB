import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document type' })
  @AuditLog({ action: 'Create document type', module: 'document', resourceType: 'DocumentType' })
  create(@Body() createDocumentTypeDto: CreateDocumentTypeDto) {
    return this.documentsService.create(createDocumentTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all document types with pagination, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.documentsService.findAll(pageNum, limitNum, search, sortBy, sortOrder, isActiveBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document type by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document type' })
  @AuditLog({ action: 'Update document type', module: 'document', resourceType: 'DocumentType' })
  update(@Param('id') id: string, @Body() updateDocumentTypeDto: UpdateDocumentTypeDto) {
    return this.documentsService.update(id, updateDocumentTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a document type (set isActive to false)' })
  @AuditLog({ action: 'Delete document type', module: 'document', resourceType: 'DocumentType' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a document type' })
  @AuditLog({ action: 'Toggle document type status', module: 'document', resourceType: 'DocumentType' })
  toggleActive(@Param('id') id: string) {
    return this.documentsService.toggleActive(id);
  }
}
