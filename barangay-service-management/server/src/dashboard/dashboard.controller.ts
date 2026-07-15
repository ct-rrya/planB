import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStatistics() {
    return this.dashboardService.getStatistics();
  }

  @Get('monthly-requests')
  @ApiOperation({ summary: 'Get monthly request counts' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  getMonthlyRequests(@Query('months') months?: string) {
    const monthsNum = months ? parseInt(months, 10) : 6;
    return this.dashboardService.getMonthlyRequests(monthsNum);
  }

  @Get('most-requested-documents')
  @ApiOperation({ summary: 'Get most requested document types' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMostRequestedDocuments(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getMostRequestedDocuments(limitNum);
  }

  @Get('recent-requests')
  @ApiOperation({ summary: 'Get recent requests' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentRequests(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getRecentRequests(limitNum);
  }

  @Get('recent-audit-logs')
  @ApiOperation({ summary: 'Get recent audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentAuditLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentAuditLogs(limitNum);
  }

  @Get('request-status-distribution')
  @ApiOperation({ summary: 'Get request status distribution' })
  getRequestStatusDistribution() {
    return this.dashboardService.getRequestStatusDistribution();
  }
}
