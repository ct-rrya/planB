import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ConversationState extends Document {
  @Prop({ required: true, unique: true })
  messengerPSID: string;

  @Prop({ required: true })
  currentState: string; // idle, awaiting_name, awaiting_address, awaiting_contact, selecting_document, awaiting_purpose, awaiting_tracking

  @Prop({ type: Object })
  context: Record<string, any>; // Stores temporary data like partial registration

  @Prop({ default: Date.now })
  lastInteraction: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationStateSchema = SchemaFactory.createForClass(ConversationState);
