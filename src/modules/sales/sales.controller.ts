import { Controller, Get, Post, Body, Query, UseGuards, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { GetSalesFilterDto } from './dto/get-sales-filter.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Sales (Point of Sale)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale (Generate Invoice)' })
  @ApiResponse({ status: 201, description: 'Sale successfully created and stock deducted' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales invoices (with optional date filter and pagination)' })
  @ApiResponse({ status: 200, description: 'Return paginated sales' })
  findAll(@Query() filterDto: GetSalesFilterDto) {
    return this.salesService.findAll(filterDto);
  }

  @Get('cancelled')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all cancelled invoices (Audit Log)' })
  @ApiResponse({ status: 200, description: 'Return cancelled sales' })
  getCancelledSales() {
    return this.salesService.getCancelledSales();
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Cancel a sale and refund stock (Admin Only)' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Sale successfully cancelled' })
  @ApiResponse({ status: 400, description: 'Sale not found' })
  cancelSale(@Param('id') id: string, @Body('reason') reason: string) {
    return this.salesService.cancelSale(id, reason || 'Cancelled by Admin');
  }
}
