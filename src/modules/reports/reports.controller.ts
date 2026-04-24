import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Reports & Dashboard')
@ApiBearerAuth()
@Roles('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get key metrics for the pharmacy dashboard' })
  @ApiResponse({ status: 200, description: 'Returns daily sales, low stock, and expiry alerts' })
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get sales summary for a period (Current Week/Month/Year) or custom date range' })
  @ApiQuery({ name: 'period', required: false, description: 'weekly (current week), monthly (current month), or yearly (current year)', type: String })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom start date (YYYY-MM-DD)', type: String })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom end date (YYYY-MM-DD)', type: String })
  @ApiResponse({ status: 200, description: 'Returns aggregated sales data' })
  getSalesSummary(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getSalesSummary({ period, startDate, endDate });
  }

  @Get('top-selling')
  @ApiOperation({ summary: 'Get the top 5 highest selling medicines' })
  @ApiResponse({ status: 200, description: 'Returns top selling medicines by quantity' })
  getTopSelling() {
    return this.reportsService.getTopSelling();
  }
}
