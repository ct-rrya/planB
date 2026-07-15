import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from '../database/schemas/request.schema';
import { Resident } from '../database/schemas/resident.schema';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly certificatesPath = join(process.cwd(), 'uploads', 'certificates');

  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
  ) {
    // Ensure certificates directory exists
    if (!existsSync(this.certificatesPath)) {
      mkdirSync(this.certificatesPath, { recursive: true });
    }
  }

  async generateCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BC-${year}-`;

    const latestCertificate = await this.requestModel
      .findOne({ certificateNumber: new RegExp(`^${prefix}`) })
      .sort({ certificateNumber: -1 })
      .exec();

    let sequence = 1;
    if (latestCertificate && latestCertificate.certificateNumber) {
      const lastNumber = parseInt(latestCertificate.certificateNumber.split('-')[2]);
      sequence = lastNumber + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async generateORNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OR-${year}-`;

    const latestOR = await this.requestModel
      .findOne({ orNumber: new RegExp(`^${prefix}`) })
      .sort({ orNumber: -1 })
      .exec();

    let sequence = 1;
    if (latestOR && latestOR.orNumber) {
      const lastNumber = parseInt(latestOR.orNumber.split('-')[2]);
      sequence = lastNumber + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  async generateQRCode(data: string): Promise<Buffer> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      // Convert data URL to buffer
      const base64Data = qrCodeDataUrl.split(',')[1];
      return Buffer.from(base64Data, 'base64');
    } catch (error) {
      this.logger.error(`Error generating QR code: ${error.message}`);
      throw error;
    }
  }

  async generateCertificate(requestId: string, userId: string): Promise<Request> {
    const request = await this.requestModel
      .findById(requestId)
      .populate('resident')
      .populate('documentType')
      .exec();

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    const resident = request.resident as any;
    const documentType = request.documentType as any;

    // Generate certificate number and OR number
    const certificateNumber = await this.generateCertificateNumber();
    const orNumber = await this.generateORNumber();

    // Calculate age
    const age = this.calculateAge(new Date(resident.birthDate));

    // Format date
    const dateIssued = new Date();
    const formattedDate = dateIssued.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate QR Code data
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificateNumber}`;
    const qrCodeData = JSON.stringify({
      certificateNumber,
      trackingNumber: request.trackingNumber,
      residentId: resident._id.toString(),
      verificationUrl,
    });
    const qrCodeBuffer = await this.generateQRCode(qrCodeData);

    // Create PDF
    const fileName = `${certificateNumber}.pdf`;
    const filePath = join(this.certificatesPath, fileName);
    const certificateUrl = `/certificates/${fileName}`;

    await this.createPDF(filePath, {
      fullName: `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`,
      age,
      civilStatus: resident.civilStatus,
      sex: resident.sex,
      purok: resident.purok,
      address: resident.address,
      purpose: request.purpose,
      dateIssued: formattedDate,
      certificateNumber,
      orNumber,
      trackingNumber: request.trackingNumber,
      qrCodeBuffer,
      generatedBy: userId,
    });

    // Update request
    request.certificateNumber = certificateNumber;
    request.certificateUrl = certificateUrl;
    request.orNumber = orNumber;
    request.generatedAt = dateIssued;
    request.generatedBy = userId as any;
    request.status = 'certificate_generated';

    await request.save();

    this.logger.log(`Certificate generated: ${certificateNumber} for request ${request.trackingNumber}`);

    return request;
  }

  private async createPDF(filePath: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: {
            top: 50,
            bottom: 50,
            left: 72,
            right: 72,
          },
        });

        const stream = createWriteStream(filePath);
        doc.pipe(stream);

        // Header - Republic of the Philippines
        doc.fontSize(10)
           .font('Helvetica')
           .text('Republic of the Philippines', { align: 'center' });
        
        doc.fontSize(10)
           .text('Province of Cebu', { align: 'center' });
        
        doc.fontSize(10)
           .text('City of Bogo', { align: 'center' });
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Barangay Cayang', { align: 'center' });
        
        doc.fontSize(9)
           .font('Helvetica-Oblique')
           .text('Office of the Punong Barangay', { align: 'center' });

        doc.moveDown(2);

        // Title
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('BARANGAY CLEARANCE', { align: 'center' });

        doc.moveDown(2);

        // TO WHOM IT MAY CONCERN
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('TO WHOM IT MAY CONCERN:', { align: 'left' });

        doc.moveDown(1);

        // Body
        doc.fontSize(11)
           .font('Helvetica')
           .text('This is to certify that,', { align: 'justify' });

        doc.moveDown(0.5);

        // Resident Name (Centered and Bold)
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(data.fullName.toUpperCase(), { align: 'center' });

        doc.moveDown(0.5);

        // Age, Civil Status
        doc.fontSize(11)
           .font('Helvetica')
           .text(`${data.age} years of age, ${data.civilStatus}, and a bona fide resident of ${data.purok}, Barangay Cayang, Bogo City, Cebu, and personally known to me.`, {
             align: 'justify',
           });

        doc.moveDown(1);

        doc.text('That he/she was cleared from all obligations of this barangay and has fully satisfied and paid whatever liabilities he/she may have incurred as resident of the barangay in coordination with the purok where he/she belongs.', {
          align: 'justify',
        });

        doc.moveDown(1);

        doc.text(`This certification is being issued upon the request of the above-named person in connection with his/her application for ${data.purpose}.`, {
          align: 'justify',
        });

        doc.moveDown(1);

        doc.text(`Done this ${data.dateIssued} at Barangay Cayang, Bogo City, Cebu, Philippines.`, {
          align: 'justify',
        });

        doc.moveDown(2);

        // Authority
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('BY THE AUTHORITY OF THE PUNONG BARANGAY', { align: 'center' });

        doc.moveDown(1);

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('HON. CELESTINO A. MARTINEZ I', { align: 'center' });

        doc.moveDown(2);

        // Signature Line
        doc.fontSize(10)
           .font('Helvetica')
           .text('_______________________________', { align: 'center' });
        
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('ALEXANDER Y. ESTRELLA', { align: 'center' });
        
        doc.fontSize(10)
           .font('Helvetica')
           .text('OIC Punong Barangay', { align: 'center' });

        doc.moveDown(2);

        // Bottom Section - Certificate Info
        const bottomY = doc.page.height - 150;
        doc.y = bottomY;

        doc.fontSize(9)
           .font('Helvetica')
           .text(`Date Issued: ${data.dateIssued}`, 72, bottomY, { continued: false });

        doc.text(`Certificate No.: ${data.certificateNumber}`, 72, bottomY + 15);
        doc.text(`Tracking No.: ${data.trackingNumber}`, 72, bottomY + 30);
        doc.text(`Paid Under O.R.: ${data.orNumber}`, 72, bottomY + 45);

        doc.fontSize(8)
           .text('Issued at: Barangay Cayang, Bogo City, Cebu', 72, bottomY + 60);

        // QR Code (Right side)
        if (data.qrCodeBuffer) {
          doc.image(data.qrCodeBuffer, doc.page.width - 150 - 72, bottomY, {
            width: 100,
            height: 100,
          });
          
          doc.fontSize(7)
             .text('Scan to verify', doc.page.width - 150 - 72, bottomY + 105, {
               width: 100,
               align: 'center',
             });
        }

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`PDF created successfully: ${filePath}`);
          resolve();
        });

        stream.on('error', (error) => {
          this.logger.error(`Error creating PDF: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        this.logger.error(`Error in createPDF: ${error.message}`);
        reject(error);
        }
    });
  }
}
