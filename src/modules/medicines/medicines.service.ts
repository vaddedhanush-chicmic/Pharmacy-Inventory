import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from './schemas/medicine.schema.js';
import { CreateMedicineDto } from './dto/create-medicine.dto.js';
import { UpdateMedicineDto } from './dto/update-medicine.dto.js';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<MedicineDocument> {
    const createdMedicine = new this.medicineModel(createMedicineDto);
    return createdMedicine.save();
  }

  async findAll(name?: string): Promise<MedicineDocument[]> {
    if (name) {
      // Case-insensitive regex search
      return this.medicineModel.find({ name: { $regex: new RegExp(name, 'i') } }).exec();
    }
    return this.medicineModel.find().exec();
  }

  async findOne(id: string): Promise<MedicineDocument> {
    const medicine = await this.medicineModel.findById(id).exec();
    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
    return medicine;
  }

  async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<MedicineDocument> {
    const existingMedicine = await this.medicineModel
      .findByIdAndUpdate(id, updateMedicineDto, { new: true })
      .exec();
      
    if (!existingMedicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
    return existingMedicine;
  }

  async remove(id: string): Promise<MedicineDocument> {
    const deletedMedicine = await this.medicineModel.findByIdAndDelete(id).exec();
    if (!deletedMedicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
    return deletedMedicine;
  }
}
