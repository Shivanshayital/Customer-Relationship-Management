export type FailureIssue = {
  layer: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  repair_action: string;
  affected_modules: string[];
  unrecoverable?: boolean;
};

function normalizePrompt(prompt: string) {
  return prompt.toLowerCase();
}

function hasGuestCheckoutConflict(normalized: string) {
  const allowsUnauthenticatedCheckout =
    normalized.includes('checkout as guests') ||
    normalized.includes('checkout without login') ||
    normalized.includes('checkout without logging in');

  return allowsUnauthenticatedCheckout && normalized.includes('login is mandatory');
}

export function detectPromptFailures(prompt: string): FailureIssue[] {
  const normalized = normalizePrompt(prompt);
  const issues: FailureIssue[] = [];

  if (hasGuestCheckoutConflict(normalized)) {
    issues.push({
      layer: 'constraints',
      severity: 'error',
      message: 'Guest checkout conflicts with mandatory login requirement.',
      repair_action: 'repair_auth_rules',
      affected_modules: ['auth', 'business'],
    });
  }

  if (normalized.includes('premium users have free access') && normalized.includes('payment is required')) {
    issues.push({
      layer: 'business_logic',
      severity: 'error',
      message: 'Premium access conflicts with mandatory payment requirement.',
      repair_action: 'repair_payment_logic',
      affected_modules: ['business'],
    });
  }

  if (normalized.includes('managers can delete invoices') && normalized.includes('invoices are immutable')) {
    issues.push({
      layer: 'business_logic',
      severity: 'error',
      message: 'Manager delete permission conflicts with immutable invoice policy.',
      repair_action: 'repair_invoice_policy',
      affected_modules: ['business', 'database'],
    });
  }

  if (normalized.includes('contradictory permissions') || normalized.includes('conflicting permissions')) {
    issues.push({
      layer: 'auth',
      severity: 'error',
      message: 'Prompt explicitly contains contradictory permissions.',
      repair_action: 'repair_permissions',
      affected_modules: ['auth'],
    });
  }

  if (normalized.includes('no database') && normalized.includes('crm')) {
    issues.push({
      layer: 'constraints',
      severity: 'error',
      message: 'Impossible CRM configuration without a persistence layer.',
      repair_action: 'repair_unrecoverable',
      affected_modules: ['database'],
      unrecoverable: true,
    });
  }

  if (normalized.includes('vague payment logic') || normalized.includes('unclear payment logic')) {
    issues.push({
      layer: 'business_logic',
      severity: 'warning',
      message: 'Payment logic is ambiguous and needs an explicit default.',
      repair_action: 'repair_payment_logic',
      affected_modules: ['business'],
    });
  }

  return issues;
}
