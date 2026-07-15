import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    example: 'approved',
    enum: ['pending', 'approved', 'rejected', 'ready', 'released'],
    required: false,
  })
  @IsString()
  @IsEnum(['pending', 'approved', 'rejected', 'ready', 'released'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Document approved for processing', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
