type ValidationIssue = {
  layer: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  repair_action: string;
  affected_modules?: string[];
};

function clone<T>(input: T): T {
  return JSON.parse(JSON.stringify(input));
}

function hasTable(config: any, tableName: string) {
  return Array.isArray(config?.tables) && config.tables.some((table: { name: string }) => table.name === tableName);
}

export function repairConfig(config: any, issues: ValidationIssue[]) {
  const repaired = clone(config);

  for (const issue of issues) {
    if (issue.repair_action === 'normalize_names') {
      if (repaired.tables) {
        repaired.tables = repaired.tables.map((table: any) => ({
          ...table,
          name: table.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
          columns: table.columns.map((column: any) => ({
            ...column,
            name: column.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
          })),
        }));
      }
    }

    if (issue.repair_action === 'repair_permissions') {
      repaired.roles = [
        { name: 'admin', permissions: ['read:analytics', 'manage:contacts', 'manage:billing', 'manage:users'] },
        { name: 'manager', permissions: ['read:dashboard', 'manage:contacts', 'read:billing'] },
        { name: 'agent', permissions: ['read:dashboard', 'read:contacts'] },
      ];
      repaired.rules = [
        'JWT required for protected routes',
        'Admin-only access to analytics summaries',
        'Manager and admin can manage contacts',
        'Premium access required for billing operations',
      ];
    }

    if (issue.repair_action === 'repair_billing_api') {
      repaired.endpoints = [
        ...(repaired.endpoints ?? []),
        { method: 'GET', path: '/billing/plan', summary: 'View current plan', request_schema: {}, response_schema: {}, validation_rules: ['requires_auth'] },
      ];
    }

    if (issue.repair_action === 'repair_database' && !hasTable(repaired, 'contacts')) {
      repaired.tables = [
        ...(repaired.tables ?? []),
        {
          name: 'contacts',
          columns: [
            { name: 'id', type: 'uuid', required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'email', type: 'text', required: true },
            { name: 'phone', type: 'text', required: false },
            { name: 'company', type: 'text', required: false },
          ],
          relations: [],
          indexes: ['email_idx'],
        },
      ];
    }

    if (issue.repair_action === 'repair_ui_routes') {
      repaired.pages = [
        ...(repaired.pages ?? []),
        { name: 'Billing', route: '/billing/plan', layout: 'cards', components: ['billing-summary'], tables: [], forms: [] },
      ];
    }

    if (issue.repair_action === 'repair_auth_rules') {
      repaired.rules = [
        'Guest checkout enabled for unauthenticated users',
        'Login optional for guest checkout flows',
        'Authentication enforced for account-specific actions',
      ];
    }

    if (issue.repair_action === 'repair_payment_logic') {
      repaired.premium_gating = [
        'Premium users receive premium access after plan enrollment',
        'Free access is granted to eligible starter tiers without payment gating',
        'Payment is required only for paid upgrades and usage-based billing',
      ];
      repaired.workflows = [
        ...(repaired.workflows ?? []),
        {
          name: 'payment_resolution',
          trigger: 'checkout_started',
          steps: ['check_premium_status', 'apply_free_access_if_eligible', 'require_payment_for_paid_tier'],
        },
      ];
    }

    if (issue.repair_action === 'repair_invoice_policy' && repaired.workflows) {
      repaired.role_checks = [
        'Admins can review invoices',
        'Managers can view invoices',
        'Invoices are immutable after submission',
      ];
      repaired.workflows.push({
        name: 'invoice_immutability',
        trigger: 'invoice_submitted',
        steps: ['freeze_invoice', 'block_delete_operations'],
      });
    }
  }

  return repaired;
}

function normalizeModuleName(moduleName: string) {
  if (moduleName === 'ui') return 'ui_schema';
  if (moduleName === 'api') return 'api_schema';
  if (moduleName === 'database') return 'db_schema';
  if (moduleName === 'auth') return 'auth_config';
  if (moduleName === 'business') return 'business_logic';
  return moduleName;
}

export function buildRepairSummary(affectedModules: string[], preservedModules: string[]) {
  const repaired = affectedModules.map(normalizeModuleName);
  const preserved = preservedModules.map(normalizeModuleName);

  return {
    repaired_modules: repaired,
    preserved_modules: preserved,
    affected_modules: repaired,
    repair_actions: [`[Repair] Affected modules: ${repaired.join(', ')}`],
  };
}
