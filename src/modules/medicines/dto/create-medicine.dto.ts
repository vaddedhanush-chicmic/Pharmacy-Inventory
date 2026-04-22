import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ example: 'Paracetamol 500mg', description: 'Name of the medicine' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Used for pain relief and fever', description: 'Description of the medicine' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'PharmaCorp Inc.', description: 'Manufacturer name' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: 10.00, description: 'Maximum Retail Price' })
  @IsNumber()
  @Min(0)
  mrp: number;

  @ApiProperty({ example: 8.50, description: 'Actual selling price' })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ example: 100, description: 'Current stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: '2027-12-31', description: 'Expiry date of the medicine' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiPropertyOptional({ example: 10, description: 'Low stock reorder level', default: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderLevel?: number;
}
