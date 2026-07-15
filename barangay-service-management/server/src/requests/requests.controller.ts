import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('requests')
@Controller('requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document request' })
  create(@Body() createRequestDto: CreateRequestDto, @Request() req) {
    return this.requestsService.create(createRequestDto, req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get request statistics' })
  getStats() {
    return this.requestsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests with pagination, search, and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.requestsService.findAll(
      pageNum,
      limitNum,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    );
  }

  @Get('tracking/:trackingNumber')
  @ApiOperation({ summary: 'Get a request by tracking number' })
  findByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.requestsService.findByTrackingNumber(trackingNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a request by ID' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a request' })
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(id, updateRequestDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update request status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    const { status } = updateStatusDto;
    
    switch (status) {
      case 'approved':
        return this.requestsService.approve(id, updateStatusDto, req.user.userId);
      case 'rejected':
        return this.requestsService.reject(id, updateStatusDto, req.user.userId);
      case 'ready':
        return this.requestsService.markReady(id, updateStatusDto, req.user.userId);
      case 'released':
        return this.requestsService.release(id, updateStatusDto, req.user.userId);
      default:
        return this.requestsService.update(id, updateStatusDto);
    }
  }

  // New Certificate Workflow Endpoints
  @Post(':id/approve-and-generate')
  @ApiOperation({ summary: 'Approve request and generate certificate automatically' })
  approveAndGenerateCertificate(
    @Param('id') id: string,
    @Body() body: { orNumber?: string },
    @Request() req,
  ) {
    return this.requestsService.approveAndGenerateCertificate(id, req.user.userId, body.orNumber);
  }

  @Patch(':id/mark-printed')
  @ApiOperation({ summary: 'Mark certificate as printed' })
  markPrinted(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.markPrinted(id, req.user.userId, updateStatusDto.remarks);
  }

  @Patch(':id/secretary-signed')
  @ApiOperation({ summary: 'Mark certificate as signed by Barangay Secretary' })
  markSecretarySigned(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.markSecretarySigned(id, req.user.userId, updateStatusDto.remarks);
  }

  @Patch(':id/captain-signed')
  @ApiOperation({ summary: 'Mark certificate as signed by Punong Barangay' })
  markCaptainSigned(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.markCaptainSigned(id, req.user.userId, updateStatusDto.remarks);
  }

  @Patch(':id/seal-applied')
  @ApiOperation({ summary: 'Mark official seal as applied' })
  markSealApplied(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.markSealApplied(id, req.user.userId, updateStatusDto.remarks);
  }

  @Patch(':id/ready-for-pickup')
  @ApiOperation({ summary: 'Mark certificate as ready for pickup' })
  markReadyForPickup(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.markReadyForPickup(id, req.user.userId, updateStatusDto.remarks);
  }

  @Get(':id/checklist')
  @ApiOperation({ summary: 'Get processing checklist for request' })
  getProcessingChecklist(@Param('id') id: string) {
    return this.requestsService.getProcessingChecklist(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  approve(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.approve(id, updateStatusDto, req.user.userId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a request' })
  reject(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.reject(id, updateStatusDto, req.user.userId);
  }

  @Patch(':id/ready')
  @ApiOperation({ summary: 'Mark request as ready for release' })
  markReady(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.markReady(id, updateStatusDto, req.user.userId);
  }

  @Patch(':id/release')
  @ApiOperation({ summary: 'Release request to resident' })
  release(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.requestsService.release(id, updateStatusDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a request' })
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
