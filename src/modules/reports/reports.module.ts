import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { Medicine, MedicineSchema } from '../medicines/schemas/medicine.schema.js';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema.js';
import { Expense, ExpenseSchema } from '../expenses/schemas/expense.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medicine.name, schema: MedicineSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
