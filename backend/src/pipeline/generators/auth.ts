import { z } from 'zod';
import { IntentSchema } from '../schemas.js';

export function generateAuthConfig(intent: z.infer<typeof IntentSchema>) {
  return {
    app_name: intent.app_name,
    session_mode: 'jwt',
    roles: [
      { name: 'admin', permissions: ['read:analytics', 'manage:contacts', 'manage:billing', 'manage:users'] },
      { name: 'manager', permissions: ['read:dashboard', 'manage:contacts', 'read:billing'] },
      { name: 'agent', permissions: ['read:dashboard', 'read:contacts'] },
    ],
    rules: [
      'JWT required for protected routes',
      'Admin-only access to analytics summaries',
      'Manager and admin can create contacts',
      'Premium access required for billing operations',
    ],
  };
}
