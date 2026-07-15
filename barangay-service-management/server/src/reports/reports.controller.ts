import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily report' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getDailyReport(@Query('date') date?: string) {
    const reportDate = date ? new Date(date) : new Date();
    return this.reportsService.getDailyReport(reportDate);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  async getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlyReport(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly report' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getYearlyReport(@Query('year') year: string) {
    return this.reportsService.getYearlyReport(parseInt(year, 10));
  }

  @Get('resident-statistics')
  @ApiOperation({ summary: 'Get resident statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getResidentStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getResidentStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('document-statistics')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getDocumentStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDocumentStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('status-statistics')
  @ApiOperation({ summary: 'Get status statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getStatusStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getStatusStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('custom')
  @ApiOperation({ summary: 'Get custom report with date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async getCustomReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCustomReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export report as PDF' })
  @ApiQuery({ name: 'type', required: true, enum: ['daily', 'monthly', 'yearly'] })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  async exportPDF(
    @Query('type') type: string,
    @Query('date') date: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    let data: any;
    let reportType = 'Daily';

    if (type === 'daily') {
      const reportDate = date ? new Date(date) : new Date();
      data = await this.reportsService.getDailyReport(reportDate);
      reportType = 'Daily';
    } else if (type === 'monthly') {
      data = await this.reportsService.getMonthlyReport(
        parseInt(year, 10),
        parseInt(month, 10),
      );
      reportType = 'Monthly';
    } else if (type === 'yearly') {
      data = await this.reportsService.getYearlyReport(parseInt(year, 10));
      reportType = 'Yearly';
    }

    const pdfBuffer = await this.reportsService.generatePDF(reportType, data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${reportType}-Report-${new Date().toISOString().split('T')[0]}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export report as Excel' })
  @ApiQuery({ name: 'type', required: true, enum: ['daily', 'monthly', 'yearly'] })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  async exportExcel(
    @Query('type') type: string,
    @Query('date') date: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    let data: any;
    let reportType = 'Daily';

    if (type === 'daily') {
      const reportDate = date ? new Date(date) : new Date();
      data = await this.reportsService.getDailyReport(reportDate);
      reportType = 'Daily';
    } else if (type === 'monthly') {
      data = await this.reportsService.getMonthlyReport(
        parseInt(year, 10),
        parseInt(month, 10),
      );
      reportType = 'Monthly';
    } else if (type === 'yearly') {
      data = await this.reportsService.getYearlyReport(parseInt(year, 10));
      reportType = 'Yearly';
    }

    const excelBuffer = await this.reportsService.generateExcel(reportType, data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${reportType}-Report-${new Date().toISOString().split('T')[0]}.xlsx"`,
    );
    res.send(excelBuffer);
  }
}
