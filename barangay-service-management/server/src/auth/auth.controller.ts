import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const result = await this.authService.login(loginDto);
    
    // Log successful login
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    await this.auditLogsService.create({
      action: `User ${loginDto.username} logged in`,
      module: 'auth',
      admin: result.user._id.toString(),
      ipAddress,
      userAgent,
    });
    
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getCurrentUser(@Request() req) {
    return this.authService.findUserById(req.user.userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  async logout(@Request() req) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const user = await this.authService.findUserById(req.user.userId);
    
    await this.auditLogsService.create({
      action: `User ${user.username} logged out`,
      module: 'auth',
      admin: req.user.userId,
      ipAddress,
      userAgent,
    });
    
    return { message: 'Logged out successfully' };
  }
}
