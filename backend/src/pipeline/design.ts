import { z } from 'zod';
import { IntentSchema } from './schemas.js';

export function buildSystemDesign(intent: z.infer<typeof IntentSchema>) {
  const pageStructure = ['Login', 'Dashboard', 'Contacts', 'Billing', 'Analytics', 'Settings'];
  const serviceArchitecture = ['auth-service', 'crm-service', 'analytics-service', 'billing-service'];
  const dataFlow = [
    'Login -> auth-service -> session token',
    'Contacts -> crm-service -> database',
    'Dashboard -> analytics-service -> aggregated KPIs',
    'Billing -> billing-service -> premium checks',
  ];

  const apiGrouping = [
    { group: 'auth', endpoints: ['/auth/login', '/auth/logout', '/auth/me'] },
    { group: 'crm', endpoints: ['/contacts', '/contacts/:id', '/deals'] },
    { group: 'analytics', endpoints: ['/analytics/summary', '/analytics/admin'] },
    { group: 'billing', endpoints: ['/billing/plan', '/billing/checkout'] },
  ];

  const permissionModel = intent.roles.map((role) => {
    const access = role === 'admin'
      ? ['dashboard', 'contacts', 'analytics', 'billing', 'settings']
      : role === 'manager'
        ? ['dashboard', 'contacts', 'billing']
        : ['dashboard', 'contacts'];

    return { role, access };
  });

  return {
    app_name: intent.app_name,
    page_structure: pageStructure,
    service_architecture: serviceArchitecture,
    data_flow: dataFlow,
    api_grouping: apiGrouping,
    permission_model: permissionModel,
  };
}
