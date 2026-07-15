import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from '../database/schemas/notification.schema';
import { Request, RequestSchema } from '../database/schemas/request.schema';
import { Resident, ResidentSchema } from '../database/schemas/resident.schema';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Resident.name, schema: ResidentSchema },
    ]),
    ChatbotModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
