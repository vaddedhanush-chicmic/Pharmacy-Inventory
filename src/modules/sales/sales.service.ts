import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema.js';
import { CancelledSale, CancelledSaleDocument } from './schemas/cancelled-sale.schema.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { GetSalesFilterDto } from './dto/get-sales-filter.dto.js';
import { MedicinesService } from '../medicines/medicines.service.js';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(CancelledSale.name) private cancelledSaleModel: Model<CancelledSaleDocument>,
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

  async findAll(filterDto: GetSalesFilterDto): Promise<{ data: SaleDocument[]; total: number; page: number; limit: number }> {
    const { startDate, endDate, page = 1, limit = 50 } = filterDto;
    const query: any = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.saleModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.saleModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async cancelSale(id: string, reason: string): Promise<CancelledSaleDocument> {
    const sale = await this.saleModel.findById(id).exec();
    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    // 1. Refund the stock for each item
    for (const item of sale.items) {
      const medicine = await this.medicinesService.findOne(item.medicineId.toString());
      if (medicine) {
        await this.medicinesService.update(medicine._id.toString(), {
          stock: medicine.stock + item.quantity
        });
      }
    }

    // 2. Clone to CancelledSale collection
    const cancelledSale = new this.cancelledSaleModel({
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      paymentMethod: sale.paymentMethod,
      items: sale.items,
      grandTotal: sale.grandTotal,
      reason,
    });

    await cancelledSale.save();

    // 3. Delete from original Sales collection
    await this.saleModel.findByIdAndDelete(id).exec();

    return cancelledSale;
  }

  async getCancelledSales(): Promise<CancelledSaleDocument[]> {
    return this.cancelledSaleModel.find().sort({ cancelledAt: -1 }).exec();
  }
}
