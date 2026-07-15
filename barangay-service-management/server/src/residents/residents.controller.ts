import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('residents')
@Controller('residents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resident' })
  @AuditLog({ action: 'Create resident', module: 'resident', resourceType: 'Resident' })
  create(@Body() createResidentDto: CreateResidentDto) {
    return this.residentsService.create(createResidentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all residents with pagination, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.residentsService.findAll(pageNum, limitNum, search, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resident by ID' })
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resident' })
  @AuditLog({ action: 'Update resident', module: 'resident', resourceType: 'Resident' })
  update(@Param('id') id: string, @Body() updateResidentDto: UpdateResidentDto) {
    return this.residentsService.update(id, updateResidentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resident' })
  @AuditLog({ action: 'Delete resident', module: 'resident', resourceType: 'Resident' })
  remove(@Param('id') id: string) {
    return this.residentsService.remove(id);
  }
}
