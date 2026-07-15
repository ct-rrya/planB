import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DocumentType extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  requirements: string[];

  @Prop({ required: true, default: 0, min: 0 })
  fee: number;

  @Prop({ required: true, default: 3, min: 1 })
  processingDays: number;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DocumentTypeSchema = SchemaFactory.createForClass(DocumentType);
