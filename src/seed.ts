import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MedicinesService } from './modules/medicines/medicines.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const medicinesService = app.get(MedicinesService);

  const seedData = [
    {
      name: 'Paracetamol 500mg',
      description: 'Used to treat pain and fever',
      manufacturer: 'Cipla',
      mrp: 30.00,
      sellingPrice: 28.00,
      stock: 500,
      expiryDate: new Date('2026-12-31').toISOString(),
      reorderLevel: 50,
    },
    {
      name: 'Amoxicillin 250mg',
      description: 'Antibiotic used to treat bacterial infections',
      manufacturer: 'Sun Pharma',
      mrp: 120.00,
      sellingPrice: 110.00,
      stock: 200,
      expiryDate: new Date('2025-10-15').toISOString(),
      reorderLevel: 20,
    },
    {
      name: 'Cetirizine 10mg',
      description: 'Antihistamine used for allergy relief',
      manufacturer: 'Dr. Reddy',
      mrp: 45.00,
      sellingPrice: 40.00,
      stock: 300,
      expiryDate: new Date('2026-05-20').toISOString(),
      reorderLevel: 30,
    },
    {
      name: 'Azithromycin 500mg',
      description: 'Macrolide antibiotic',
      manufacturer: 'Mankind',
      mrp: 150.00,
      sellingPrice: 145.00,
      stock: 150,
      expiryDate: new Date('2025-08-01').toISOString(),
      reorderLevel: 15,
    },
    {
      name: 'Pantoprazole 40mg',
      description: 'Proton pump inhibitor for acidity',
      manufacturer: 'Alkem',
      mrp: 90.00,
      sellingPrice: 85.00,
      stock: 400,
      expiryDate: new Date('2027-01-10').toISOString(),
      reorderLevel: 40,
    }
  ];

  console.log('Seeding medicines...');
  
  for (const medicine of seedData) {
    // Check if it already exists to avoid duplicates if run multiple times
    const existing = await medicinesService.findAll(medicine.name);
    if (existing.length === 0) {
      await medicinesService.create(medicine);
      console.log(`Added: ${medicine.name}`);
    } else {
      console.log(`Already exists: ${medicine.name}`);
    }
  }

  console.log('Seeding complete!');
  await app.close();
}

bootstrap();
