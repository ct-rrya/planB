import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResidentDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Dela', required: false })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: 'Cruz' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ example: 'Male', enum: ['Male', 'Female'] })
  @IsEnum(['Male', 'Female'])
  @IsNotEmpty()
  sex: string;

  @ApiProperty({ example: 'Single', enum: ['Single', 'Married', 'Widowed', 'Separated'] })
  @IsEnum(['Single', 'Married', 'Widowed', 'Separated'])
  @IsNotEmpty()
  civilStatus: string;

  @ApiProperty({ example: '09123456789' })
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @ApiProperty({ example: '123 Main Street, Barangay Sample' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Purok 1' })
  @IsString()
  @IsNotEmpty()
  purok: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  messengerPSID?: string;
}
