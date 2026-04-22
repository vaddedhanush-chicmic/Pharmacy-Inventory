import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller.js';
import { SalesService } from './sales.service.js';
import { Sale, SaleSchema } from './schemas/sale.schema.js';
import { MedicinesModule } from '../medicines/medicines.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    MedicinesModule,
  ],
  controllers: [SalesController],
  providers: [SalesService]
})
export class SalesModule {}
