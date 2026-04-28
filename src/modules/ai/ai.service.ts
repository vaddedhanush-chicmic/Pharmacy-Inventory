import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { DynamicTool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { Medicine } from '../medicines/schemas/medicine.schema';
import { Sale } from '../sales/schemas/sale.schema';
import { Expense } from '../expenses/schemas/expense.schema';

@Injectable()
export class AiService {
  private agent: ReturnType<typeof createReactAgent>;

  constructor(
    private configService: ConfigService,
    @InjectModel(Medicine.name) private medicineModel: Model<Medicine>,
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {
    const model = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
      model: this.configService.get<string>('AI_MODEL', 'gemini-2.0-flash'),
      temperature: 0,
    });

    this.agent = createReactAgent({
      llm: model,
      tools: this.buildTools(),
      stateModifier: `You are PharmAI, a highly precise AI inventory and business assistant for a pharmacy.
You have access to real-time pharmacy data through tools. 

CORE PRINCIPLES:
1. PRECISION: Only provide information explicitly found in the data returned by tools. 
2. NO ASSUMPTIONS: Do not guess stock, prices, or trends. If data is missing, say: "I don't have that information in the system."
3. DATA-FIRST: Always fetch current data using tools before answering questions about inventory, sales, or expenses.
4. SCOPE: You are an INVENTORY and BUSINESS assistant. 
    - For non-pharmacy questions, politely redirect to pharmacy topics.
    - MEDICAL SAFETY: NEVER give medical advice, dosage recommendations, or drug interactions. Always refer to a doctor or pharmacist.
5. FORMATTING: Use ₹ for currency. Use bullet points for lists of 3+ items.

Today's date is ${new Date().toDateString()}.`,
    });
  }

  private buildTools(): DynamicTool[] {
    return [
      new DynamicTool({
        name: 'get_low_stock_medicines',
        description: 'Fetch medicines where stock is below reorder level.',
        func: async () => {
          const medicines = await this.medicineModel
            .find({ $expr: { $lte: ['$stock', '$reorderLevel'] } })
            .select('name stock reorderLevel manufacturer')
            .lean();
          return medicines.length ? JSON.stringify(medicines) : 'No low stock medicines.';
        },
      }),

      new DynamicTool({
        name: 'get_expiring_medicines',
        description: 'Fetch medicines expiring within 30 days.',
        func: async () => {
          const soon = new Date();
          soon.setDate(soon.getDate() + 30);
          const medicines = await this.medicineModel
            .find({ expiryDate: { $gte: new Date(), $lte: soon } })
            .select('name stock expiryDate manufacturer')
            .lean();
          return medicines.length ? JSON.stringify(medicines) : 'No medicines expiring soon.';
        },
      }),

      new DynamicTool({
        name: 'get_expired_medicines',
        description: 'Fetch all expired medicines.',
        func: async () => {
          const medicines = await this.medicineModel
            .find({ expiryDate: { $lt: new Date() } })
            .select('name stock expiryDate manufacturer')
            .lean();
          return medicines.length ? JSON.stringify(medicines) : 'No expired medicines found.';
        },
      }),

      new DynamicTool({
        name: 'get_sales_summary',
        description: 'Get sales summary. JSON input: { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }',
        func: async (input: string) => {
          let startD: Date, endD: Date;
          try {
            const p = JSON.parse(input);
            startD = p.startDate ? new Date(p.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            endD = p.endDate ? new Date(p.endDate) : new Date();
          } catch {
            startD = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            endD = new Date();
          }
          endD.setHours(23, 59, 59, 999);

          const sales = await this.saleModel.find({ createdAt: { $gte: startD, $lte: endD } }).lean();
          const totalRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
          const medicineMap: Record<string, { name: string; qty: number; revenue: number }> = {};
          
          for (const s of sales) {
            for (const item of s.items || []) {
              const k = item.name || 'Unknown';
              if (!medicineMap[k]) medicineMap[k] = { name: k, qty: 0, revenue: 0 };
              medicineMap[k].qty += item.quantity || 0;
              medicineMap[k].revenue += item.subTotal || 0;
            }
          }

          return JSON.stringify({
            period: { from: startD.toDateString(), to: endD.toDateString() },
            totalRevenue,
            totalTransactions: sales.length,
            topMedicines: Object.values(medicineMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
          });
        },
      }),

      new DynamicTool({
        name: 'get_expenses_summary',
        description: 'Get expenses summary. JSON input: { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }',
        func: async (input: string) => {
          let startD: Date, endD: Date;
          try {
            const p = JSON.parse(input);
            startD = p.startDate ? new Date(p.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            endD = p.endDate ? new Date(p.endDate) : new Date();
          } catch {
            startD = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            endD = new Date();
          }
          endD.setHours(23, 59, 59, 999);

          const expenses = await this.expenseModel.find({ date: { $gte: startD, $lte: endD } }).lean();
          const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
          const byCategory: Record<string, number> = {};
          for (const e of expenses) {
            const cat = e.category || 'Other';
            byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
          }

          return JSON.stringify({
            period: { from: startD.toDateString(), to: endD.toDateString() },
            totalExpenses: total,
            byCategory,
            count: expenses.length,
          });
        },
      }),

      new DynamicTool({
        name: 'search_medicines',
        description: 'Search medicines by name, manufacturer, or description.',
        func: async (query: string) => {
          const medicines = await this.medicineModel
            .find({
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { manufacturer: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
              ],
            })
            .select('name stock expiryDate sellingPrice reorderLevel manufacturer description')
            .limit(10)
            .lean();
          return medicines.length ? JSON.stringify(medicines) : `No medicines found matching "${query}".`;
        },
      }),

      new DynamicTool({
        name: 'get_dashboard_stats',
        description: "Get high-level pharmacy stats: totals, alerts, and monthly financial summary.",
        func: async () => {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          const [totalMedicines, lowStockCount, expiredCount, todaySales, monthSales, monthExpenses] =
            await Promise.all([
              this.medicineModel.countDocuments(),
              this.medicineModel.countDocuments({ $expr: { $lte: ['$stock', '$reorderLevel'] } }),
              this.medicineModel.countDocuments({ expiryDate: { $lt: now } }),
              this.saleModel.find({ createdAt: { $gte: todayStart } }).lean(),
              this.saleModel.find({ createdAt: { $gte: monthStart } }).lean(),
              this.expenseModel.find({ date: { $gte: monthStart } }).lean(),
            ]);

          const mSalesTotal = monthSales.reduce((s, t) => s + (t.grandTotal || 0), 0);
          const mExpensesTotal = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);

          return JSON.stringify({
            inventory: { totalMedicines, lowStockCount, expiredCount },
            today: {
              transactions: todaySales.length,
              revenue: todaySales.reduce((s, t) => s + (t.grandTotal || 0), 0),
            },
            thisMonth: {
              revenue: mSalesTotal,
              expenses: mExpensesTotal,
              net: mSalesTotal - mExpensesTotal,
            },
          });
        },
      }),
    ];
  }

  async chat(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  ): Promise<string> {
    const messages = [
      ...history.map((h) =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content),
      ),
      new HumanMessage(userMessage),
    ];

    const result = await this.agent.invoke({ messages });

    const last = result.messages[result.messages.length - 1];
    return typeof last.content === 'string'
      ? last.content
      : (last.content as Array<{ text?: string }>)
          .map((c) => c.text ?? '')
          .join('');
  }
}
