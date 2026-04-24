import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 5000, description: 'Amount spent' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Inventory Purchase', enum: ['Inventory Purchase', 'Salary', 'Electricity', 'Maintenance', 'Other'], description: 'Category of expense' })
  @IsEnum(['Inventory Purchase', 'Salary', 'Electricity', 'Maintenance', 'Other'])
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'Bought 100 boxes of Paracetamol', description: 'Detailed description of the expense' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-04-20', description: 'Date of the expense (defaults to today)' })
  @IsDateString()
  @IsOptional()
  date?: string;
}
