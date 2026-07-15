import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Resident', required: true })
  resident: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Request', required: true })
  request: Types.ObjectId;

  @Prop({ required: true })
  trackingNumber: string;

  @Prop({ required: true, enum: ['approved', 'ready', 'released', 'rejected'] })
  status: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  messengerPSID: string;

  @Prop({ default: false })
  sent: boolean;

  @Prop()
  sentAt: Date;

  @Prop()
  error: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
