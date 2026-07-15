import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { MessengerService } from './messenger.service';
import { Resident, ResidentSchema } from '../database/schemas/resident.schema';
import { Conversation, ConversationSchema } from '../database/schemas/conversation.schema';
import { ConversationState, ConversationStateSchema } from '../database/schemas/conversation-state.schema';
import { DocumentType, DocumentTypeSchema } from '../database/schemas/document-type.schema';
import { Request, RequestSchema } from '../database/schemas/request.schema';
import { Announcement, AnnouncementSchema } from '../database/schemas/announcement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: ConversationState.name, schema: ConversationStateSchema },
      { name: DocumentType.name, schema: DocumentTypeSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, MessengerService],
  exports: [ChatbotService, MessengerService],
})
export class ChatbotModule {}
