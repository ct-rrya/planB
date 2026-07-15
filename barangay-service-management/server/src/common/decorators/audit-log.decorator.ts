import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogOptions {
  action: string;
  module: 'auth' | 'resident' | 'document' | 'request' | 'announcement' | 'user' | 'system';
  resourceType?: string;
}

export const AuditLog = (options: AuditLogOptions) => SetMetadata(AUDIT_LOG_KEY, options);
