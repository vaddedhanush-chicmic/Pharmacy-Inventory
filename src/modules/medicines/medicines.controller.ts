import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service.js';
import { CreateMedicineDto } from './dto/create-medicine.dto.js';
import { UpdateMedicineDto } from './dto/update-medicine.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Medicines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({ status: 201, description: 'Medicine successfully created' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines' })
  @ApiQuery({ name: 'name', required: false, description: 'Search medicines by name' })
  @ApiResponse({ status: 200, description: 'Return all medicines' })
  findAll(@Query('name') name?: string) {
    return this.medicinesService.findAll(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific medicine by id' })
  @ApiResponse({ status: 200, description: 'Return the medicine' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific medicine' })
  @ApiResponse({ status: 200, description: 'Medicine successfully updated' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific medicine' })
  @ApiResponse({ status: 200, description: 'Medicine successfully deleted' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }
}
