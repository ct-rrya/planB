import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Resident extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  middleName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, enum: ['Male', 'Female'] })
  sex: string;

  @Prop({ required: true, enum: ['Single', 'Married', 'Widowed', 'Separated'] })
  civilStatus: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  purok: string;

  @Prop({ unique: true, sparse: true })
  messengerPSID: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ResidentSchema = SchemaFactory.createForClass(Resident);
