import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Admin User', description: 'The full name of the user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@pharmacy.com', description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Admin', enum: ['Admin', 'Staff'], description: 'The role of the user' })
  @IsEnum(['Admin', 'Staff'])
  @IsOptional()
  role?: string;
}
