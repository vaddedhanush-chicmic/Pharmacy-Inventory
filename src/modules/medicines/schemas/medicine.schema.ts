import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicineDocument = Medicine & Document;

@Schema({ timestamps: true })
export class Medicine {
  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  manufacturer: string;

  @Prop({ required: true, min: 0 })
  mrp: number;

  @Prop({ required: true, min: 0 })
  sellingPrice: number;

  @Prop({ required: true, default: 0, min: 0 })
  stock: number;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ required: true, default: 10, min: 0 })
  reorderLevel: number;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);
