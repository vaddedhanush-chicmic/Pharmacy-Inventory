import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Medicine } from '../../medicines/schemas/medicine.schema.js';

export type SaleDocument = Sale & Document;

@Schema()
export class SaleItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicineId: Types.ObjectId;

  @Prop({ required: true })
  name: string; // Saved so invoice remains intact if medicine is deleted later

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  subTotal: number;
}

const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ timestamps: true })
export class Sale {
  @Prop({ required: true, unique: true, index: true })
  invoiceNumber: string;

  @Prop()
  customerName: string;

  @Prop()
  customerPhone: string;

  @Prop({ type: [SaleItemSchema], required: true })
  items: SaleItem[];

  @Prop({ required: true, min: 0 })
  grandTotal: number;

  @Prop({ required: true, enum: ['Cash', 'UPI', 'Card'], default: 'Cash' })
  paymentMethod: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
