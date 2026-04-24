import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from '../medicines/schemas/medicine.schema.js';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema.js';
import { Expense, ExpenseDocument } from '../expenses/schemas/expense.schema.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Calculate Today's Sales and Expenses
    const [todaysSales, todaysExpenses] = await Promise.all([
      this.saleModel.aggregate([
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
      ]),
      this.expenseModel.aggregate([
        {
          $match: {
            date: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const salesMetrics = todaysSales[0] || { totalAmount: 0, totalInvoices: 0 };
    const expensesMetrics = todaysExpenses[0] || { totalAmount: 0 };

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
        expenses: expensesMetrics.totalAmount,
        netEarned: salesMetrics.totalAmount - expensesMetrics.totalAmount,
        invoices: salesMetrics.totalInvoices,
      },
      alerts: {
        lowStockItems: lowStockCount,
        expiringSoonItems: expiringSoonCount,
        expiredItems: expiredCount,
      }
    };
  }
  async getSalesSummary(query: { period?: string; startDate?: string; endDate?: string }) {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today);
    let dateFormat = '%Y-%m-%d';
    let responsePeriod = query.period || 'custom';

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      
      endDate = new Date(query.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      
      responsePeriod = 'custom';
    } else {
      // Logic for "Current" periods
      if (query.period === 'weekly') {
        // Start of CURRENT week (Sunday)
        const day = today.getUTCDay();
        startDate.setUTCDate(today.getUTCDate() - day);
        startDate.setUTCHours(0, 0, 0, 0);
      } else if (query.period === 'monthly') {
        // Start of CURRENT month (1st)
        startDate.setUTCDate(1);
        startDate.setUTCHours(0, 0, 0, 0);
      } else if (query.period === 'yearly') {
        // Start of CURRENT year (Jan 1st)
        startDate.setUTCMonth(0, 1);
        startDate.setUTCHours(0, 0, 0, 0);
        dateFormat = '%Y-%m';
      } else {
        // Default to current month if nothing provided
        startDate.setUTCDate(1);
        startDate.setUTCHours(0, 0, 0, 0);
        responsePeriod = 'monthly';
      }
    }

    // If range is > 90 days, group by month
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      dateFormat = '%Y-%m';
    }

    const [salesByPeriod, expensesByPeriod] = await Promise.all([
      this.saleModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            totalRevenue: { $sum: '$grandTotal' },
            totalInvoices: { $sum: 1 }
          }
        }
      ]),
      this.expenseModel.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$date' } },
            totalExpenses: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const timeSeriesMap = new Map<string, any>();
    
    let current = new Date(startDate);
    while (current <= endDate) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, '0');
      const day = String(current.getUTCDate()).padStart(2, '0');
      
      const key = dateFormat === '%Y-%m-%d' ? `${year}-${month}-${day}` : `${year}-${month}`;
      
      if (!timeSeriesMap.has(key)) {
        timeSeriesMap.set(key, { date: key, revenue: 0, expenses: 0, net: 0, invoices: 0 });
      }
      
      if (dateFormat === '%Y-%m-%d') {
        current.setUTCDate(current.getUTCDate() + 1);
      } else {
        current.setUTCMonth(current.getUTCMonth() + 1);
      }
    }

    salesByPeriod.forEach(s => {
      if (timeSeriesMap.has(s._id)) {
        timeSeriesMap.get(s._id).revenue = s.totalRevenue;
        timeSeriesMap.get(s._id).invoices = s.totalInvoices;
      }
    });

    expensesByPeriod.forEach(e => {
      if (timeSeriesMap.has(e._id)) {
        timeSeriesMap.get(e._id).expenses = e.totalExpenses;
      }
    });

    let grandRevenue = 0;
    let grandExpenses = 0;
    let grandInvoices = 0;
    
    const timeSeries = Array.from(timeSeriesMap.values()).map(item => {
      item.net = item.revenue - item.expenses;
      grandRevenue += item.revenue;
      grandExpenses += item.expenses;
      grandInvoices += item.invoices;
      return item;
    }).sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: 'custom',
      grandTotals: {
        totalRevenue: grandRevenue,
        totalExpenses: grandExpenses,
        netEarned: grandRevenue - grandExpenses,
        totalInvoices: grandInvoices
      },
      timeSeries
    };
  }

  async getTopSelling() {
    return this.saleModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicineId',
          name: { $first: '$items.name' },
          totalQuantitySold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 }
    ]);
  }
}
