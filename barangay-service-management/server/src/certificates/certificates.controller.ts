import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('verify/:certificateNumber')
  @ApiOperation({ summary: 'Verify certificate (Public endpoint)' })
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.certificatesService.verifyCertificate(certificateNumber);
  }
}
