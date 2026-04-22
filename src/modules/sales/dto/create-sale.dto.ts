import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateSaleItemDto {
  @ApiProperty({ example: '60d5ecb8b392d700153a5c12', description: 'Medicine ID' })
  @IsString()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ example: 2, description: 'Quantity to sell' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Customer Name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Customer Phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'Array of items being sold' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiPropertyOptional({ example: 'Cash', enum: ['Cash', 'UPI', 'Card'], description: 'Payment Method' })
  @IsEnum(['Cash', 'UPI', 'Card'])
  @IsOptional()
  paymentMethod?: string;
}
