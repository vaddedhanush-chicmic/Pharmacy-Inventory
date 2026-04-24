import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<ExpenseDocument> {
    const newExpense = new this.expenseModel({
      ...createExpenseDto,
      recordedBy: new Types.ObjectId(userId),
      date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date()
    });
    return newExpense.save();
  }

  async findAll(query: { period?: string; startDate?: string; endDate?: string }): Promise<ExpenseDocument[]> {
    const mongoQuery: any = {};
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today);
    let applyFilter = false;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(query.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      applyFilter = true;
    } else if (query.period) {
      applyFilter = true;
      if (query.period === 'weekly') {
        const day = today.getUTCDay();
        startDate.setUTCDate(today.getUTCDate() - day);
        startDate.setUTCHours(0, 0, 0, 0);
      } else if (query.period === 'monthly') {
        startDate.setUTCDate(1);
        startDate.setUTCHours(0, 0, 0, 0);
      } else if (query.period === 'yearly') {
        startDate.setUTCMonth(0, 1);
        startDate.setUTCHours(0, 0, 0, 0);
      }
    }

    if (applyFilter) {
      mongoQuery.date = { $gte: startDate, $lte: endDate };
    }
    
    return this.expenseModel.find(mongoQuery).sort({ date: -1 }).populate('recordedBy', 'name email').exec();
  }
}
