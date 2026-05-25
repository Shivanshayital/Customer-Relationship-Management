import { z } from 'zod';
import { IntentSchema } from '../schemas.js';

export function generateBusinessConfig(intent: z.infer<typeof IntentSchema>) {
  return {
    app_name: intent.app_name,
    premium_gating: [
      'Billing page accessible only to premium or admin users',
      'Advanced analytics gated behind premium plan',
    ],
    workflows: [
      {
        name: 'contact_qualification',
        trigger: 'new_contact_created',
        steps: ['assign_owner', 'send_welcome_email', 'add_to_dashboard'],
      },
      {
        name: 'premium_upgrade',
        trigger: 'payment_succeeded',
        steps: ['unlock_billing_features', 'grant_premium_access'],
      },
      {
        name: 'admin_analytics_review',
        trigger: 'analytics_report_requested',
        steps: ['load_snapshots', 'check_role', 'return_summary'],
      },
    ],
    role_checks: [
      'admin can read analytics',
      'manager can manage contacts',
      'agent can read contacts',
    ],
  };
}
