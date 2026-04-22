import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicinesController } from './medicines.controller.js';
import { MedicinesService } from './medicines.service.js';
import { Medicine, MedicineSchema } from './schemas/medicine.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Medicine.name, schema: MedicineSchema }]),
  ],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService], // Added for SalesModule
})
export class MedicinesModule {}
