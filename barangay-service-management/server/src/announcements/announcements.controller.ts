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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement' })
  @AuditLog({ action: 'Create announcement', module: 'announcement', resourceType: 'Announcement' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Request() req) {
    return this.announcementsService.create(createAnnouncementDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all announcements with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('published') published?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const publishedBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.announcementsService.findAll(
      pageNum,
      limitNum,
      search,
      publishedBool,
      sortBy,
      sortOrder,
    );
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published announcements (public endpoint for Messenger bot)' })
  findAllPublished() {
    return this.announcementsService.findAllPublished();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an announcement by ID' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  @AuditLog({ action: 'Update announcement', module: 'announcement', resourceType: 'Announcement' })
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish an announcement' })
  @AuditLog({ action: 'Publish announcement', module: 'announcement', resourceType: 'Announcement' })
  publish(@Param('id') id: string) {
    return this.announcementsService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish an announcement' })
  @AuditLog({ action: 'Unpublish announcement', module: 'announcement', resourceType: 'Announcement' })
  unpublish(@Param('id') id: string) {
    return this.announcementsService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcement' })
  @AuditLog({ action: 'Delete announcement', module: 'announcement', resourceType: 'Announcement' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
