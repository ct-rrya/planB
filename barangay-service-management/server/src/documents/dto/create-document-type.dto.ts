import { IsString, IsNotEmpty, IsArray, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentTypeDto {
  @ApiProperty({ example: 'Barangay Clearance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Certificate of good moral character and residency' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['Valid ID', 'Proof of Residency', '1x1 ID Picture'] })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty({ example: 50, description: 'Fee in Philippine Peso' })
  @IsNumber()
  @Min(0, { message: 'Fee cannot be negative' })
  fee: number;

  @ApiProperty({ example: 3, description: 'Number of days to process the document' })
  @IsNumber()
  @Min(1, { message: 'Processing days must be greater than zero' })
  processingDays: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
