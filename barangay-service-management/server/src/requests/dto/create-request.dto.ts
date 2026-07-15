import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  resident: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({ example: 'For employment requirement' })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({ example: 'Urgent request', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
