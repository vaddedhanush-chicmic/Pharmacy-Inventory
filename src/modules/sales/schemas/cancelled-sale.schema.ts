import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CancelledSaleDocument = CancelledSale & Document;

@Schema()
class CancelledSaleItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicineId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  subTotal: number;
}

const CancelledSaleItemSchema = SchemaFactory.createForClass(CancelledSaleItem);

@Schema({ timestamps: true })
export class CancelledSale {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop()
  customerName: string;

  @Prop()
  customerPhone: string;

  @Prop({ required: true, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' })
  paymentMethod: string;

  @Prop({ type: [CancelledSaleItemSchema], required: true })
  items: CancelledSaleItem[];

  @Prop({ required: true, min: 0 })
  grandTotal: number;

  @Prop({ required: true, default: Date.now })
  cancelledAt: Date;

  @Prop({ required: true })
  reason: string;
}

export const CancelledSaleSchema = SchemaFactory.createForClass(CancelledSale);
