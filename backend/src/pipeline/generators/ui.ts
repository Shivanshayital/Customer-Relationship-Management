import { z } from 'zod';
import { IntentSchema } from '../schemas.js';

export function generateUiConfig(intent: z.infer<typeof IntentSchema>) {
  const pages = [
    {
      name: 'Login',
      route: '/auth/login',
      layout: 'auth',
      components: ['hero', 'login-form'],
      tables: [],
      forms: [{ name: 'login-form', fields: ['email', 'password'] }],
    },
    {
      name: 'Dashboard',
      route: '/dashboard',
      layout: 'grid',
      components: ['kpi-card', 'recent-activity'],
      tables: ['activity-log'],
      forms: [],
    },
    {
      name: 'Contacts',
      route: '/contacts',
      layout: 'table',
      components: ['search-bar', 'contact-table'],
      tables: ['contacts'],
      forms: [{ name: 'contact-form', fields: ['name', 'email', 'phone', 'company'] }],
    },
    {
      name: 'Billing',
      route: '/billing/plan',
      layout: 'cards',
      components: ['plan-card', 'checkout-summary'],
      tables: [],
      forms: [{ name: 'billing-form', fields: ['plan', 'payment-method'] }],
    },
    {
      name: 'Analytics',
      route: '/analytics/summary',
      layout: 'charts',
      components: ['revenue-chart', 'conversion-metric'],
      tables: ['analytics_snapshots'],
      forms: [],
    },
  ];

  return {
    app_name: intent.app_name,
    pages,
    navigation: pages.map((page) => page.route),
  };
}
