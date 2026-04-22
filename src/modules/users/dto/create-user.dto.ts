import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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

  @ApiProperty({ example: 'Staff', enum: ['Admin', 'Staff'], description: 'The role of the user', required: false })
  @IsEnum(['Admin', 'Staff'])
  @IsOptional()
  role?: string;
}
