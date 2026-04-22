import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from '../medicines/schemas/medicine.schema.js';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
  ) {}

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Calculate Today's Sales
    const todaysSales = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$grandTotal' },
          totalInvoices: { $sum: 1 }
        }
      }
    ]);

    const salesMetrics = todaysSales[0] || { totalAmount: 0, totalInvoices: 0 };

    // 2. Low Stock Alerts (Stock <= Reorder Level)
    const lowStockCount = await this.medicineModel.countDocuments({
      $expr: { $lte: ['$stock', '$reorderLevel'] }
    });

    // 3. Expiring Soon Alerts (Expiry < 30 days from now)
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    const expiringSoonCount = await this.medicineModel.countDocuments({
      expiryDate: { $lt: nextMonth, $gte: new Date() }
    });

    // 4. Already Expired
    const expiredCount = await this.medicineModel.countDocuments({
      expiryDate: { $lt: new Date() }
    });

    return {
      today: {
        revenue: salesMetrics.totalAmount,
        invoices: salesMetrics.totalInvoices,
      },
      alerts: {
        lowStockItems: lowStockCount,
        expiringSoonItems: expiringSoonCount,
        expiredItems: expiredCount,
      }
    };
  }
}
