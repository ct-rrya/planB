import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true })
  action: string;

  @Prop({ required: true, enum: [
    'auth',
    'resident',
    'document',
    'request',
    'announcement',
    'user',
    'system'
  ]})
  module: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  admin: Types.ObjectId;

  @Prop({ type: Object })
  oldValue: Record<string, any>;

  @Prop({ type: Object })
  newValue: Record<string, any>;

  @Prop()
  resourceId: string;

  @Prop()
  resourceType: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
