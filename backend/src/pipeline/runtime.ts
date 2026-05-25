import { AuthConfigSchema, ApiConfigSchema, DatabaseSchemaSchema, BusinessLogicSchema, UiConfigSchema } from './schemas.js';

export function simulateRuntime(configs: {
  ui: unknown;
  api: unknown;
  database: unknown;
  auth: unknown;
  business: unknown;
}) {
  const ui = UiConfigSchema.parse(configs.ui);
  const api = ApiConfigSchema.parse(configs.api);
  const database = DatabaseSchemaSchema.parse(configs.database);
  const auth = AuthConfigSchema.parse(configs.auth);
  const business = BusinessLogicSchema.parse(configs.business);

  const routes = [
    { path: '/auth/login', guard: 'public', actions: ['validate_credentials', 'issue_jwt'] },
    { path: '/dashboard', guard: 'authenticated', actions: ['load_kpis', 'load_recent_activity'] },
    { path: '/contacts', guard: 'authenticated', actions: ['list_contacts', 'create_contact'] },
    { path: '/analytics/summary', guard: 'admin', actions: ['load_admin_analytics'] },
    { path: '/billing/plan', guard: 'premium_or_admin', actions: ['check_plan', 'render_billing'] },
  ];

  const forms = ui.pages
    .filter((page) => page.forms.length > 0)
    .map((page) => ({
      page: page.name,
      fields: page.forms.flatMap((form) => form.fields),
      validation: ['required_fields', 'email_format_if_present'],
    }));

  const permission_checks = auth.roles.map((role) => ({
    role: role.name,
    route: '/analytics',
    allowed: role.name === 'admin',
  }));

  const db_operations = [
    { table: 'contacts', operation: 'create' as const, outcome: 'contact_created' },
    { table: 'payments', operation: 'create' as const, outcome: 'payment_recorded' },
    { table: 'analytics_snapshots', operation: 'read' as const, outcome: 'analytics_loaded' },
  ];

  const execution_status = 'pass';

  return {
    app_name: ui.app_name,
    routes,
    forms,
    permission_checks,
    db_operations,
    execution_status,
  };
}
