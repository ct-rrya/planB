import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resident } from '../database/schemas/resident.schema';
import { Request } from '../database/schemas/request.schema';
import { DocumentType } from '../database/schemas/document-type.schema';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(DocumentType.name) private documentTypeModel: Model<DocumentType>,
  ) {}

  async getDailyReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      newResidents,
    ] = await Promise.all([
      this.requestModel.countDocuments({
        requestedAt: { $gte: startOfDay, $lte: endOfDay },
      }).exec(),
      this.getRequestsByStatus(startOfDay, endOfDay),
      this.getRequestsByDocument(startOfDay, endOfDay),
      this.residentModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).exec(),
    ]);

    return {
      date: date.toISOString().split('T')[0],
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      newResidents,
    };
  }

  async getMonthlyReport(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      dailyBreakdown,
      newResidents,
    ] = await Promise.all([
      this.requestModel.countDocuments({
        requestedAt: { $gte: startOfMonth, $lte: endOfMonth },
      }).exec(),
      this.getRequestsByStatus(startOfMonth, endOfMonth),
      this.getRequestsByDocument(startOfMonth, endOfMonth),
      this.getDailyBreakdown(startOfMonth, endOfMonth),
      this.residentModel.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }).exec(),
    ]);

    return {
      year,
      month,
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      dailyBreakdown,
      newResidents,
    };
  }

  async getYearlyReport(year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const [
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      monthlyBreakdown,
      newResidents,
      totalResidents,
    ] = await Promise.all([
      this.requestModel.countDocuments({
        requestedAt: { $gte: startOfYear, $lte: endOfYear },
      }).exec(),
      this.getRequestsByStatus(startOfYear, endOfYear),
      this.getRequestsByDocument(startOfYear, endOfYear),
      this.getMonthlyBreakdown(startOfYear, endOfYear),
      this.residentModel.countDocuments({
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      }).exec(),
      this.residentModel.countDocuments().exec(),
    ]);

    return {
      year,
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      monthlyBreakdown,
      newResidents,
      totalResidents,
    };
  }

  async getResidentStatistics(startDate?: Date, endDate?: Date) {
    const query: any = {};
    if (startDate) query.createdAt = { $gte: startDate };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: endDate };

    const [
      totalResidents,
      bySex,
      byCivilStatus,
      byPurok,
      newResidents,
    ] = await Promise.all([
      this.residentModel.countDocuments().exec(),
      this.residentModel.aggregate([
        { $group: { _id: '$sex', count: { $sum: 1 } } },
        { $project: { _id: 0, sex: '$_id', count: 1 } },
      ]).exec(),
      this.residentModel.aggregate([
        { $group: { _id: '$civilStatus', count: { $sum: 1 } } },
        { $project: { _id: 0, civilStatus: '$_id', count: 1 } },
      ]).exec(),
      this.residentModel.aggregate([
        { $group: { _id: '$purok', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, purok: '$_id', count: 1 } },
      ]).exec(),
      startDate || endDate ? this.residentModel.countDocuments(query).exec() : 0,
    ]);

    return {
      totalResidents,
      bySex,
      byCivilStatus,
      byPurok,
      newResidents: startDate || endDate ? newResidents : undefined,
    };
  }

  async getDocumentStatistics(startDate?: Date, endDate?: Date) {
    const query: any = {};
    if (startDate) query.requestedAt = { $gte: startDate };
    if (endDate) query.requestedAt = { ...query.requestedAt, $lte: endDate };

    const [
      totalDocumentTypes,
      activeDocumentTypes,
      requestsByDocument,
      averageProcessingTime,
    ] = await Promise.all([
      this.documentTypeModel.countDocuments().exec(),
      this.documentTypeModel.countDocuments({ isActive: true }).exec(),
      this.requestModel.aggregate([
        ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),
        { $group: { _id: '$documentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $lookup: {
            from: 'documenttypes',
            localField: '_id',
            foreignField: '_id',
            as: 'documentInfo',
          },
        },
        { $unwind: '$documentInfo' },
        {
          $project: {
            _id: 0,
            documentId: '$_id',
            documentName: '$documentInfo.name',
            count: 1,
            fee: '$documentInfo.fee',
            processingDays: '$documentInfo.processingDays',
          },
        },
      ]).exec(),
      this.calculateAverageProcessingTime(query),
    ]);

    return {
      totalDocumentTypes,
      activeDocumentTypes,
      requestsByDocument,
      averageProcessingTime,
    };
  }

  async getStatusStatistics(startDate?: Date, endDate?: Date) {
    const query: any = {};
    if (startDate) query.requestedAt = { $gte: startDate };
    if (endDate) query.requestedAt = { ...query.requestedAt, $lte: endDate };

    const [byStatus, completionRate, averageCompletionTime] = await Promise.all([
      this.requestModel.aggregate([
        ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]).exec(),
      this.calculateCompletionRate(query),
      this.calculateAverageCompletionTime(query),
    ]);

    return {
      byStatus,
      completionRate,
      averageCompletionTime,
    };
  }

  async getCustomReport(startDate: Date, endDate: Date) {
    const [
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      residentStats,
      documentStats,
      statusStats,
    ] = await Promise.all([
      this.requestModel.countDocuments({
        requestedAt: { $gte: startDate, $lte: endDate },
      }).exec(),
      this.getRequestsByStatus(startDate, endDate),
      this.getRequestsByDocument(startDate, endDate),
      this.getResidentStatistics(startDate, endDate),
      this.getDocumentStatistics(startDate, endDate),
      this.getStatusStatistics(startDate, endDate),
    ]);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalRequests,
      requestsByStatus,
      requestsByDocument,
      residentStats,
      documentStats,
      statusStats,
    };
  }

  // Helper methods
  private async getRequestsByStatus(startDate: Date, endDate: Date) {
    return this.requestModel.aggregate([
      { $match: { requestedAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]).exec();
  }

  private async getRequestsByDocument(startDate: Date, endDate: Date) {
    return this.requestModel.aggregate([
      { $match: { requestedAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$documentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'documenttypes',
          localField: '_id',
          foreignField: '_id',
          as: 'documentInfo',
        },
      },
      { $unwind: '$documentInfo' },
      {
        $project: {
          _id: 0,
          documentId: '$_id',
          documentName: '$documentInfo.name',
          count: 1,
        },
      },
    ]).exec();
  }

  private async getDailyBreakdown(startDate: Date, endDate: Date) {
    return this.requestModel.aggregate([
      { $match: { requestedAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$requestedAt' },
            month: { $month: '$requestedAt' },
            day: { $dayOfMonth: '$requestedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          count: 1,
        },
      },
    ]).exec();
  }

  private async getMonthlyBreakdown(startDate: Date, endDate: Date) {
    return this.requestModel.aggregate([
      { $match: { requestedAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$requestedAt' },
            month: { $month: '$requestedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
        },
      },
    ]).exec();
  }

  private async calculateAverageProcessingTime(query: any) {
    const result = await this.requestModel.aggregate([
      ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),
      { $match: { status: 'released', releasedAt: { $exists: true } } },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$releasedAt', '$requestedAt'] },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDays: { $avg: '$processingTime' },
        },
      },
    ]).exec();

    return result.length > 0 ? Math.round(result[0].averageDays * 10) / 10 : 0;
  }

  private async calculateCompletionRate(query: any) {
    const [total, completed] = await Promise.all([
      this.requestModel.countDocuments(query).exec(),
      this.requestModel.countDocuments({ ...query, status: 'released' }).exec(),
    ]);

    return total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0;
  }

  private async calculateAverageCompletionTime(query: any) {
    const result = await this.requestModel.aggregate([
      ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),
      { $match: { status: 'released', releasedAt: { $exists: true } } },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ['$releasedAt', '$requestedAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDays: { $avg: '$completionTime' },
        },
      },
    ]).exec();

    return result.length > 0 ? Math.round(result[0].averageDays * 10) / 10 : 0;
  }

  // Export methods
  async generatePDF(reportType: string, data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Barangay Service Management System', { align: 'center' });
      doc.fontSize(16).text(`${reportType} Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Content based on report type
      doc.fontSize(12);

      if (reportType === 'Daily') {
        doc.text(`Date: ${data.date}`, { underline: true });
        doc.moveDown();
        doc.text(`Total Requests: ${data.totalRequests}`);
        doc.text(`New Residents: ${data.newResidents}`);
        doc.moveDown();
        
        doc.text('Requests by Status:', { underline: true });
        data.requestsByStatus.forEach((item: any) => {
          doc.text(`  ${item.status}: ${item.count}`);
        });
      } else if (reportType === 'Monthly' || reportType === 'Yearly') {
        doc.text(`Period: ${data.year}${data.month ? `-${data.month}` : ''}`, { underline: true });
        doc.moveDown();
        doc.text(`Total Requests: ${data.totalRequests}`);
        doc.text(`New Residents: ${data.newResidents}`);
        if (data.totalResidents) doc.text(`Total Residents: ${data.totalResidents}`);
        doc.moveDown();
        
        doc.text('Requests by Status:', { underline: true });
        data.requestsByStatus.forEach((item: any) => {
          doc.text(`  ${item.status}: ${item.count}`);
        });
      }

      doc.end();
    });
  }

  async generateExcel(reportType: string, data: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Header
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'Barangay Service Management System';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = `${reportType} Report`;
    worksheet.getCell('A2').font = { bold: true, size: 14 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:D3');
    worksheet.getCell('A3').value = `Generated: ${new Date().toLocaleString()}`;
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    let currentRow = 5;

    // Summary
    worksheet.getCell(`A${currentRow}`).value = 'Summary';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Total Requests:';
    worksheet.getCell(`B${currentRow}`).value = data.totalRequests;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'New Residents:';
    worksheet.getCell(`B${currentRow}`).value = data.newResidents;
    currentRow += 2;

    // Requests by Status
    worksheet.getCell(`A${currentRow}`).value = 'Requests by Status';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Status';
    worksheet.getCell(`B${currentRow}`).value = 'Count';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    currentRow++;

    data.requestsByStatus.forEach((item: any) => {
      worksheet.getCell(`A${currentRow}`).value = item.status;
      worksheet.getCell(`B${currentRow}`).value = item.count;
      currentRow++;
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    return workbook.xlsx.writeBuffer() as any;
  }
}
