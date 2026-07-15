import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AUDIT_LOG_KEY, AuditLogOptions } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditLogOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditLogOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const ipAddress = request.ip || request.connection.remoteAddress;
          const userAgent = request.headers['user-agent'];

          await this.auditLogsService.create({
            action: auditLogOptions.action,
            module: auditLogOptions.module,
            admin: user.userId,
            resourceId: data?.id || data?._id || request.params?.id,
            resourceType: auditLogOptions.resourceType,
            ipAddress,
            userAgent,
            newValue: data,
          });
        } catch (error) {
          // Silent fail - don't break the request if audit logging fails
          console.error('Audit log error:', error);
        }
      }),
    );
  }
}
