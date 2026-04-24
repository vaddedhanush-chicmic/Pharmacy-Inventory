import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles('Admin', 'Manager')
  @ApiOperation({ summary: 'Log a new expense' })
  @ApiResponse({ status: 201, description: 'Expense successfully logged' })
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: any) {
    return this.expensesService.create(createExpenseDto, req.user.userId);
  }

  @Get()
  @Roles('Admin', 'Manager')
  @ApiOperation({ summary: 'Get all expenses with period or date filters' })
  @ApiQuery({ name: 'period', required: false, description: 'weekly, monthly, or yearly filter' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom end date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Return all expenses' })
  findAll(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.expensesService.findAll({ period, startDate, endDate });
  }
}
