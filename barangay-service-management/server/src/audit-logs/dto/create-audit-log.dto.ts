import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'Action performed' })
  @IsString()
  action: string;

  @ApiProperty({ 
    description: 'Module where action was performed',
    enum: ['auth', 'resident', 'document', 'request', 'announcement', 'user', 'system']
  })
  @IsEnum(['auth', 'resident', 'document', 'request', 'announcement', 'user', 'system'])
  module: string;

  @ApiProperty({ description: 'Admin user ID' })
  @IsString()
  admin: string;

  @ApiProperty({ description: 'Old value before change', required: false })
  @IsOptional()
  @IsObject()
  oldValue?: Record<string, any>;

  @ApiProperty({ description: 'New value after change', required: false })
  @IsOptional()
  @IsObject()
  newValue?: Record<string, any>;

  @ApiProperty({ description: 'Resource ID affected', required: false })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({ description: 'Resource type', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'IP address', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
