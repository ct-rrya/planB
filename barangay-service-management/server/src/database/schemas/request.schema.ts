import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Request extends Document {
  @Prop({ required: true, unique: true })
  trackingNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Resident', required: true })
  resident: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocumentType', required: true })
  documentType: Types.ObjectId;

  @Prop({ required: true })
  purpose: string;

  @Prop()
  remarks: string;

  @Prop({
    required: true,
    enum: [
      'pending',
      'approved',
      'certificate_generated',
      'printed',
      'secretary_signed',
      'captain_signed',
      'sealed',
      'ready',
      'released',
      'rejected',
    ],
    default: 'pending',
  })
  status: string;

  @Prop({ default: Date.now })
  requestedAt: Date;

  @Prop()
  approvedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  // Certificate Generation Fields
  @Prop({ unique: true, sparse: true })
  certificateNumber: string;

  @Prop()
  certificateUrl: string;

  @Prop()
  orNumber: string;

  @Prop()
  generatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  generatedBy: Types.ObjectId;

  // Printing Fields
  @Prop({ default: false })
  printed: boolean;

  @Prop()
  printedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  printedBy: Types.ObjectId;

  // Signature Fields
  @Prop({ default: false })
  secretarySigned: boolean;

  @Prop()
  secretarySignedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  secretarySignedBy: Types.ObjectId;

  @Prop({ default: false })
  captainSigned: boolean;

  @Prop()
  captainSignedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  captainSignedBy: Types.ObjectId;

  // Seal Field
  @Prop({ default: false })
  sealApplied: boolean;

  @Prop()
  sealAppliedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sealAppliedBy: Types.ObjectId;

  // Ready for Pickup
  @Prop({ default: false })
  readyForPickup: boolean;

  @Prop()
  readyForPickupAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  readyForPickupBy: Types.ObjectId;

  // Release Fields
  @Prop()
  releasedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  releasedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
