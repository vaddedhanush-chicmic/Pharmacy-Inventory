import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MedicinesService } from './modules/medicines/medicines.service.js';
import { AuthService } from './modules/auth/auth.service.js';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './modules/users/schemas/user.schema.js';
import { Sale } from './modules/sales/schemas/sale.schema.js';
import { Expense } from './modules/expenses/schemas/expense.schema.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const medicinesService = app.get(MedicinesService);
  const authService = app.get(AuthService);
  const userModel = app.get(getModelToken(User.name));
  const saleModel = app.get(getModelToken(Sale.name));
  const expenseModel = app.get(getModelToken(Expense.name));

  console.log('Seeding Master Admin...');
  try {
    await authService.register({
      name: 'System Admin',
      email: 'admin@pharmacy.com',
      password: 'admin',
      role: 'Admin',
    });
    console.log('Master Admin created: admin@pharmacy.com / admin');
  } catch (error) {
    console.log('Master Admin already exists.');
  }

  const admin = await userModel.findOne({ email: 'admin@pharmacy.com' }).exec();
  const adminId = admin._id;

  const seedData = [
    { name: 'Paracetamol 500mg', description: 'Pain and fever', manufacturer: 'Cipla', mrp: 30.00, sellingPrice: 28.00, stock: 5000, expiryDate: new Date('2026-12-31').toISOString(), reorderLevel: 50 },
    { name: 'Amoxicillin 250mg', description: 'Antibiotic', manufacturer: 'Sun Pharma', mrp: 120.00, sellingPrice: 110.00, stock: 2000, expiryDate: new Date('2025-10-15').toISOString(), reorderLevel: 20 },
    { name: 'Cetirizine 10mg', description: 'Allergy relief', manufacturer: 'Dr. Reddy', mrp: 45.00, sellingPrice: 40.00, stock: 3000, expiryDate: new Date('2026-05-20').toISOString(), reorderLevel: 30 },
  ];

  console.log('Seeding medicines...');
  const activeMedicines: any[] = [];
  for (const medicine of seedData) {
    const existing = await medicinesService.findAll(medicine.name);
    if (existing.length === 0) {
      const created = await medicinesService.create(medicine);
      activeMedicines.push(created);
      console.log(`Added: ${medicine.name}`);
    } else {
      activeMedicines.push(existing[0]);
    }
  }

  console.log('Seeding historical sales & expenses (Last 30 Days)...');
  
  // Clear old dummy data for a fresh 30-day chart
  await saleModel.deleteMany({});
  await expenseModel.deleteMany({});

  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    targetDate.setHours(12, 0, 0, 0); // Noon

    // Random Expense for the day (e.g. Salary/Electricity every few days, mostly "Other")
    if (Math.random() > 0.5) {
      await expenseModel.create({
        amount: Math.floor(Math.random() * 500) + 100, // 100 to 600
        category: i % 7 === 0 ? 'Salary' : 'Other',
        description: 'Daily operational expense',
        date: targetDate,
        recordedBy: adminId
      });
    }

    // 2-5 random Sales per day
    const salesCount = Math.floor(Math.random() * 4) + 2; 
    for (let j = 0; j < salesCount; j++) {
      const randomMed = activeMedicines[Math.floor(Math.random() * activeMedicines.length)];
      const qty = Math.floor(Math.random() * 3) + 1; // 1 to 3
      const subTotal = qty * randomMed.sellingPrice;

      await saleModel.create({
        invoiceNumber: `INV-${Date.now()}-${i}-${j}`,
        customerName: 'Walk-in',
        paymentMethod: 'Cash',
        items: [{
          medicineId: randomMed._id,
          name: randomMed.name,
          quantity: qty,
          unitPrice: randomMed.sellingPrice,
          subTotal: subTotal
        }],
        grandTotal: subTotal,
        soldBy: adminId,
        createdAt: targetDate,
        updatedAt: targetDate
      });
    }
  }

  console.log('Historical seeding complete!');
  await app.close();
}

bootstrap();
