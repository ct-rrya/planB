import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../database/schemas/notification.schema';
import { Request } from '../database/schemas/request.schema';
import { Resident } from '../database/schemas/resident.schema';
import { MessengerService } from '../chatbot/messenger.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    private messengerService: MessengerService,
  ) {}

  async sendRequestApprovedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name processingDays')
        .exec();

      if (!request) {
        this.logger.error(`Request not found: ${requestId}`);
        return;
      }

      const resident = request.resident as any;
      
      if (!resident.messengerPSID) {
        this.logger.warn(`No Messenger PSID for resident: ${resident._id}`);
        return;
      }

      const documentType = request.documentType as any;
      const message = `✅ Good news!\n\nYour request has been APPROVED!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n⏱️ Processing Time: ${documentType.processingDays} days\n\nYour document is now being processed. We'll notify you when it's ready for pickup.\n\nThank you for your patience!`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      // Log notification
      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'approved',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Approved notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending approved notification: ${error.message}`);
      await this.logNotificationError(requestId, 'approved', error.message);
    }
  }

  async sendRequestReadyNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name fee')
        .exec();

      if (!request) {
        this.logger.error(`Request not found: ${requestId}`);
        return;
      }

      const resident = request.resident as any;
      
      if (!resident.messengerPSID) {
        this.logger.warn(`No Messenger PSID for resident: ${resident._id}`);
        return;
      }

      const documentType = request.documentType as any;
      const message = `📦 Your document is ready for pickup!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n💰 Fee: ₱${documentType.fee}\n\n📍 Please visit our office during office hours to claim your document.\n\n🏢 Office Hours:\nMonday - Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\n\nPlease bring:\n✓ Valid ID\n✓ This tracking number\n\nSee you soon!`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      // Log notification
      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'ready',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Ready notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending ready notification: ${error.message}`);
      await this.logNotificationError(requestId, 'ready', error.message);
    }
  }

  async sendRequestReleasedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) {
        this.logger.error(`Request not found: ${requestId}`);
        return;
      }

      const resident = request.resident as any;
      
      if (!resident.messengerPSID) {
        this.logger.warn(`No Messenger PSID for resident: ${resident._id}`);
        return;
      }

      const documentType = request.documentType as any;
      const message = `🎉 Document released successfully!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n✅ Status: RELEASED\n📅 Released: ${new Date(request.releasedAt).toLocaleDateString()}\n\nThank you for using our Barangay Service Management System!\n\nWe hope we were able to serve you well. If you need another document in the future, don't hesitate to reach out!\n\nHave a great day! 😊`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      // Log notification
      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'released',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Released notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending released notification: ${error.message}`);
      await this.logNotificationError(requestId, 'released', error.message);
    }
  }

  async sendRequestRejectedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) {
        this.logger.error(`Request not found: ${requestId}`);
        return;
      }

      const resident = request.resident as any;
      
      if (!resident.messengerPSID) {
        this.logger.warn(`No Messenger PSID for resident: ${resident._id}`);
        return;
      }

      const documentType = request.documentType as any;
      const remarksText = request.remarks ? `\n\n📝 Remarks: ${request.remarks}` : '';
      const message = `❌ Request Update\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n\nUnfortunately, your request could not be approved at this time.${remarksText}\n\nPlease contact our office for more information or to resubmit your request with the correct requirements.\n\n📞 Contact: (032) 123-4567\n\nWe're here to help!`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      // Log notification
      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'rejected',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Rejected notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending rejected notification: ${error.message}`);
      await this.logNotificationError(requestId, 'rejected', error.message);
    }
  }

  // New Certificate Workflow Notifications
  async sendCertificateGeneratedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) {
        this.logger.error(`Request not found: ${requestId}`);
        return;
      }

      const resident = request.resident as any;
      
      if (!resident.messengerPSID) {
        this.logger.warn(`No Messenger PSID for resident: ${resident._id}`);
        return;
      }

      const documentType = request.documentType as any;
      const message = `📄 Certificate Generated!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n🆔 Certificate #: ${request.certificateNumber}\n\nYour certificate has been generated and is now being processed for signatures and official seal.\n\nWe'll notify you once it's ready for pickup!`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'certificate_generated',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Certificate generated notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending certificate generated notification: ${error.message}`);
      await this.logNotificationError(requestId, 'certificate_generated', error.message);
    }
  }

  async sendCertificatePrintedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) return;

      const resident = request.resident as any;
      if (!resident.messengerPSID) return;

      const documentType = request.documentType as any;
      const message = `🖨️ Certificate Printed!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n\nYour certificate has been printed and is now awaiting official signatures.\n\nNext steps:\n✍️ Barangay Secretary signature\n✍️ Punong Barangay signature\n🏛️ Official Barangay seal\n\nWe'll keep you updated!`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'printed',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Printed notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending printed notification: ${error.message}`);
      await this.logNotificationError(requestId, 'printed', error.message);
    }
  }

  async sendSecretarySignedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) return;

      const resident = request.resident as any;
      if (!resident.messengerPSID) return;

      const documentType = request.documentType as any;
      const message = `✍️ Secretary Signature Complete!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n\nThe Barangay Secretary has signed your certificate.\n\nNext: Waiting for Punong Barangay signature and official seal.\n\nAlmost ready! 😊`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'secretary_signed',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Secretary signed notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending secretary signed notification: ${error.message}`);
      await this.logNotificationError(requestId, 'secretary_signed', error.message);
    }
  }

  async sendCaptainSignedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) return;

      const resident = request.resident as any;
      if (!resident.messengerPSID) return;

      const documentType = request.documentType as any;
      const message = `✍️ Punong Barangay Signature Complete!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n\nThe Punong Barangay has signed your certificate.\n\nNext: Official Barangay seal application.\n\nYou're almost there! 🎉`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'captain_signed',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Captain signed notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending captain signed notification: ${error.message}`);
      await this.logNotificationError(requestId, 'captain_signed', error.message);
    }
  }

  async sendSealAppliedNotification(requestId: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .populate('documentType', 'name')
        .exec();

      if (!request) return;

      const resident = request.resident as any;
      if (!resident.messengerPSID) return;

      const documentType = request.documentType as any;
      const message = `🏛️ Official Seal Applied!\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n\nThe official Barangay seal has been applied to your certificate.\n\nYour certificate is now complete and will be marked ready for pickup shortly.\n\nThank you for your patience! 😊`;

      await this.messengerService.sendTextMessage(resident.messengerPSID, message);

      await this.createNotificationLog({
        resident: resident._id,
        request: request._id,
        trackingNumber: request.trackingNumber,
        status: 'sealed',
        message,
        messengerPSID: resident.messengerPSID,
        sent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Seal applied notification sent for request: ${request.trackingNumber}`);
    } catch (error) {
      this.logger.error(`Error sending seal applied notification: ${error.message}`);
      await this.logNotificationError(requestId, 'sealed', error.message);
    }
  }

  private async createNotificationLog(data: any): Promise<void> {
    try {
      const notification = new this.notificationModel(data);
      await notification.save();
    } catch (error) {
      this.logger.error(`Error logging notification: ${error.message}`);
    }
  }

  private async logNotificationError(requestId: string, status: string, error: string): Promise<void> {
    try {
      const request = await this.requestModel
        .findById(requestId)
        .populate('resident')
        .exec();

      if (request) {
        const resident = request.resident as any;
        const notification = new this.notificationModel({
          resident: resident._id,
          request: request._id,
          trackingNumber: request.trackingNumber,
          status,
          message: 'Failed to send notification',
          messengerPSID: resident.messengerPSID,
          sent: false,
          error,
        });
        await notification.save();
      }
    } catch (err) {
      this.logger.error(`Error logging notification error: ${err.message}`);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    sent?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (sent !== undefined) {
      query.sent = sent;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resident', 'firstName lastName contactNumber')
        .populate('request', 'trackingNumber')
        .exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getStats(): Promise<any> {
    const [total, sent, failed, byStatus] = await Promise.all([
      this.notificationModel.countDocuments().exec(),
      this.notificationModel.countDocuments({ sent: true }).exec(),
      this.notificationModel.countDocuments({ sent: false }).exec(),
      this.notificationModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: 1,
          },
        },
      ]).exec(),
    ]);

    return {
      total,
      sent,
      failed,
      byStatus,
    };
  }

  async retryFailedNotification(notificationId: string): Promise<void> {
    const notification = await this.notificationModel
      .findById(notificationId)
      .populate('request')
      .exec();

    if (!notification || notification.sent) {
      return;
    }

    const request = notification.request as any;

    switch (notification.status) {
      case 'approved':
        await this.sendRequestApprovedNotification(request._id);
        break;
      case 'ready':
        await this.sendRequestReadyNotification(request._id);
        break;
      case 'released':
        await this.sendRequestReleasedNotification(request._id);
        break;
      case 'rejected':
        await this.sendRequestRejectedNotification(request._id);
        break;
    }
  }
}
