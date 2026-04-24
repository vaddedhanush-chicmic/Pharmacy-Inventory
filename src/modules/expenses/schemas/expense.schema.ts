import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: ['Inventory Purchase', 'Salary', 'Electricity', 'Maintenance', 'Other'] })
  category: string;

  @Prop()
  description: string;

  @Prop({ required: true, default: Date.now })
  date: Date;
  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  recordedBy: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
