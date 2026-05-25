import { z } from 'zod';
import { IntentSchema } from '../schemas.js';

export function generateApiConfig(intent: z.infer<typeof IntentSchema>) {
  return {
    app_name: intent.app_name,
    endpoints: [
      { method: 'POST', path: '/auth/login', summary: 'Authenticate user', request_schema: { email: 'string', password: 'string' }, response_schema: { token: 'string', role: 'string' }, validation_rules: ['email_required', 'password_required'] },
      { method: 'GET', path: '/contacts', summary: 'List contacts', request_schema: {}, response_schema: { items: 'array' }, validation_rules: ['requires_auth'] },
      { method: 'POST', path: '/contacts', summary: 'Create contact', request_schema: { name: 'string', email: 'string', phone: 'string', company: 'string' }, response_schema: { id: 'string' }, validation_rules: ['requires_auth', 'admin_or_manager'] },
      { method: 'GET', path: '/analytics/summary', summary: 'Read analytics summary', request_schema: {}, response_schema: { revenue: 'number' }, validation_rules: ['requires_admin'] },
      { method: 'GET', path: '/billing/plan', summary: 'Read billing plan', request_schema: {}, response_schema: { plan: 'string' }, validation_rules: ['requires_auth'] },
    ],
  };
}
