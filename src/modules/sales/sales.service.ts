import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { MedicinesService } from '../medicines/medicines.service.js';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private medicinesService: MedicinesService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<SaleDocument> {
    let grandTotal = 0;
    const processedItems: any[] = [];

    // Process each item: fetch medicine, check stock, calculate subtotal
    for (const item of createSaleDto.items) {
      const medicine = await this.medicinesService.findOne(item.medicineId);
      
      if (medicine.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for medicine: ${medicine.name}`);
      }

      const subTotal = medicine.sellingPrice * item.quantity;
      grandTotal += subTotal;

      processedItems.push({
        medicineId: new Types.ObjectId(item.medicineId),
        name: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.sellingPrice,
        subTotal,
      });

      // Deduct stock immediately
      // In a production environment, this should ideally be in a MongoDB session/transaction
      await this.medicinesService.update(medicine._id.toString(), {
        stock: medicine.stock - item.quantity
      });
    }

    // Generate Invoice Number (e.g. INV-168205412)
    const invoiceNumber = `INV-${Math.floor(Date.now() / 1000)}`;

    const newSale = new this.saleModel({
      invoiceNumber,
      customerName: createSaleDto.customerName,
      customerPhone: createSaleDto.customerPhone,
      paymentMethod: createSaleDto.paymentMethod || 'Cash',
      items: processedItems,
      grandTotal,
    });

    return newSale.save();
  }

  async findAll(): Promise<SaleDocument[]> {
    return this.saleModel.find().sort({ createdAt: -1 }).exec();
  }
}
