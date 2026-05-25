import { IntentSchema, SystemDesignSchema, UiConfigSchema, ApiConfigSchema, DatabaseSchemaSchema, AuthConfigSchema, BusinessLogicSchema, RuntimeSchema, ValidationReportSchema } from './schemas.js';

export type ValidationReport = {
  overall_status: 'pass' | 'repair_required' | 'fail';
  issues: Array<{ layer: string; severity: 'info' | 'warning' | 'error'; message: string; repair_action: string }>;
  repaired: boolean;
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function validateNaming(layer: string, config: Record<string, unknown>) {
  const issues: string[] = [];
  if (layer === 'database') {
    const tables = (config.tables as Array<{ name: string; columns: Array<{ name: string }> }> | undefined) ?? [];
    for (const table of tables) {
      if (normalizeName(table.name) !== table.name) {
        issues.push(`Database table name ${table.name} should be snake_case`);
      }
      for (const column of table.columns) {
        if (normalizeName(column.name) !== column.name) {
          issues.push(`Column ${column.name} in ${table.name} should be snake_case`);
        }
      }
    }
  }

  return issues;
}

export function validateLayer(layer: 'intent' | 'design' | 'ui' | 'api' | 'database' | 'auth' | 'business' | 'runtime', config: unknown): ValidationReport {
  const issues = [] as Array<{ layer: string; severity: 'info' | 'warning' | 'error'; message: string; repair_action: string }>;

  const parsed = (() => {
    try {
      switch (layer) {
        case 'intent':
          return IntentSchema.parse(config);
        case 'design':
          return SystemDesignSchema.parse(config);
        case 'ui':
          return UiConfigSchema.parse(config);
        case 'api':
          return ApiConfigSchema.parse(config);
        case 'database':
          return DatabaseSchemaSchema.parse(config);
        case 'auth':
          return AuthConfigSchema.parse(config);
        case 'business':
          return BusinessLogicSchema.parse(config);
        case 'runtime':
          return RuntimeSchema.parse(config);
      }
    } catch (error) {
      issues.push({
        layer,
        severity: 'error',
        message: error instanceof Error ? error.message : 'Invalid schema',
        repair_action: 'repair_layer',
      });
      return null;
    }
  })();

  if (!parsed) {
    return {
      overall_status: 'repair_required' as const,
      issues,
      repaired: false,
    };
  }

  const namingIssues = validateNaming(layer, parsed as Record<string, unknown>);
  for (const message of namingIssues) {
    issues.push({ layer, severity: 'warning', message, repair_action: 'normalize_names' });
  }

  return {
    overall_status: issues.some((issue) => issue.severity === 'error') ? 'repair_required' : 'pass',
    issues,
    repaired: false,
  };
}

export function validateCrossLayer(configs: {
  design: unknown;
  ui: unknown;
  api: unknown;
  database: unknown;
  auth: unknown;
  business: unknown;
}): ValidationReport {
  const issues = [] as Array<{ layer: string; severity: 'info' | 'warning' | 'error'; message: string; repair_action: string }>;
  const design = configs.design as { page_structure: string[]; api_grouping: Array<{ endpoints: string[] }>; permission_model: Array<{ role: string; access: string[] }> };
  const ui = configs.ui as { pages: Array<{ name: string; route: string }> };
  const api = configs.api as { endpoints: Array<{ path: string }> };
  const database = configs.database as { tables: Array<{ name: string }> };
  const auth = configs.auth as { roles: Array<{ name: string }> };
  const business = configs.business as { role_checks: string[]; premium_gating: string[] };

  const pageRoutes = new Set(ui.pages.map((page) => page.route));
  for (const endpoint of api.endpoints) {
    if (!pageRoutes.has(endpoint.path) && endpoint.path.startsWith('/')) {
      issues.push({ layer: 'cross-layer', severity: 'warning', message: `API endpoint ${endpoint.path} does not map to a UI route`, repair_action: 'repair_ui_routes' });
    }
  }

  for (const role of auth.roles.map((item) => item.name)) {
    if (!design.permission_model.some((item) => item.role === role)) {
      issues.push({ layer: 'cross-layer', severity: 'error', message: `Role ${role} is missing from permission model`, repair_action: 'repair_permissions' });
    }
  }

  for (const gate of business.premium_gating) {
    if (!api.endpoints.some((endpoint) => endpoint.path.includes('billing'))) {
      issues.push({ layer: 'cross-layer', severity: 'error', message: 'Premium gating requires billing endpoints', repair_action: 'repair_billing_api' });
    }
  }

  if (!database.tables.some((table) => table.name === 'contacts')) {
    issues.push({ layer: 'cross-layer', severity: 'error', message: 'Contacts table is required for CRM workflows', repair_action: 'repair_database' });
  }

  return {
    overall_status: issues.some((issue) => issue.severity === 'error') ? 'repair_required' : 'pass',
    issues,
    repaired: false,
  };
}

export function combineValidationReports(reports: ValidationReport[]) {
  const issues = reports.flatMap((report) => report.issues);
  const hasError = issues.some((issue) => issue.severity === 'error');
  return ValidationReportSchema.parse({
    overall_status: hasError ? 'repair_required' : 'pass',
    issues,
    repaired: reports.some((report) => report.repaired),
  });
}
