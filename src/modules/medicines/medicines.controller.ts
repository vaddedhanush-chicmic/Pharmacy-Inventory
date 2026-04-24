import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service.js';
import { CreateMedicineDto } from './dto/create-medicine.dto.js';
import { UpdateMedicineDto } from './dto/update-medicine.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Medicines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @Roles('Admin')
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
  @Get('low-stock')
  @ApiOperation({ summary: 'Get all medicines that are at or below reorder level' })
  @ApiResponse({ status: 200, description: 'Return low stock medicines' })
  getLowStock() {
    return this.medicinesService.getLowStock();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get all medicines expiring in the next 30 days' })
  @ApiResponse({ status: 200, description: 'Return expiring medicines' })
  getExpiringSoon() {
    return this.medicinesService.getExpiringSoon();
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get all medicines that have already expired' })
  @ApiResponse({ status: 200, description: 'Return expired medicines' })
  getExpired() {
    return this.medicinesService.getExpired();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific medicine by id' })
  @ApiResponse({ status: 200, description: 'Return the medicine' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a specific medicine' })
  @ApiResponse({ status: 200, description: 'Medicine successfully updated' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete('expired/cleanup')
  @Roles('Admin')
  @ApiOperation({ summary: 'Bulk remove all expired stock' })
  @ApiResponse({ status: 200, description: 'Expired stock reset to 0' })
  cleanupExpired() {
    return this.medicinesService.cleanupExpired();
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a specific medicine' })
  @ApiResponse({ status: 200, description: 'Medicine successfully deleted' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }
}
