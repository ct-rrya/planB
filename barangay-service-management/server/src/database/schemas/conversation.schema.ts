import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  messengerPSID: string;

  @Prop({ type: Types.ObjectId, ref: 'Resident' })
  resident: Types.ObjectId;

  @Prop({ required: true, enum: ['resident', 'admin', 'bot'] })
  sender: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  metadata: string; // JSON string for additional data

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
