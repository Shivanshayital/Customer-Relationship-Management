import { IntentSchema } from './schemas.js';

const DEFAULT_ROLE_SET = ['admin', 'manager', 'agent'];
const ENTITY_TEMPLATES = {
  contacts: { type: 'core', fields: ['name', 'email', 'phone', 'company'] },
  dashboard: { type: 'core', fields: ['kpis', 'activity'] },
  analytics: { type: 'core', fields: ['revenue', 'pipeline', 'conversion'] },
  payments: { type: 'transactional', fields: ['plan', 'amount', 'status'] },
  login: { type: 'core', fields: ['email', 'password'] },
  users: { type: 'reference', fields: ['email', 'role'] },
};

const featureKeywords: Array<[string, string[]]> = [
  ['login', ['authentication', 'signin']],
  ['contacts', ['customers', 'leads']],
  ['dashboard', []],
  ['analytics', ['reports']],
  ['premium', ['payments', 'billing', 'plan']],
  ['role-based access', ['permissions', 'rbac']],
];

const workflowMap = [
  'Login and account activation',
  'Contact management and pipeline review',
  'Dashboard analytics review',
  'Premium plan gating and payment handling',
  'Admin role-based approvals',
];

function normalize(text: string) {
  return text.toLowerCase();
}

function contains(text: string, keyword: string) {
  return normalize(text).includes(keyword);
}

export function extractIntent(prompt: string) {
  const normalized = normalize(prompt);
  const roles = ['admin', 'manager', 'agent'];

  const features = new Set<string>();
  const entities = new Set<string>();

  for (const [feature, keywords] of featureKeywords) {
    if (keywords.length === 0 ? contains(normalized, feature) : keywords.some((keyword) => contains(normalized, keyword))) {
      features.add(feature);
    }
  }

  if (contains(normalized, 'contacts') || contains(normalized, 'customer')) entities.add('contacts');
  if (contains(normalized, 'dashboard')) entities.add('dashboard');
  if (contains(normalized, 'analytics')) entities.add('analytics');
  if (contains(normalized, 'payments') || contains(normalized, 'premium') || contains(normalized, 'billing')) entities.add('payments');
  if (contains(normalized, 'user') || contains(normalized, 'login') || contains(normalized, 'authentication')) entities.add('users');

  const workflows = new Set<string>();
  if (features.has('login')) workflows.add(workflowMap[0]);
  if (features.has('contacts')) workflows.add(workflowMap[1]);
  if (features.has('dashboard')) workflows.add(workflowMap[2]);
  if (features.has('premium')) workflows.add(workflowMap[3]);
  if (features.has('role-based access')) workflows.add(workflowMap[4]);

  const constraints = [] as string[];
  if (features.has('premium')) constraints.push('Premium features require paid plan');
  if (features.has('role-based access')) constraints.push('Role-based access enforced on all protected routes');
  if (features.has('login')) constraints.push('Authentication required for all non-public pages');
  if (features.has('analytics')) constraints.push('Analytics are admin-only');

  const missingInformation = [] as string[];
  if (!features.has('login')) missingInformation.push('Authentication flow not specified');
  if (!features.has('contacts')) missingInformation.push('Contact management entity not specified');
  if (!features.has('dashboard')) missingInformation.push('Dashboard experience not specified');

  const assumptions = [
    'Using email/password authentication',
    'Single-tenant architecture',
    'JWT-based session mode',
  ];

  const ambiguity = [] as string[];
  if (contains(normalized, 'role-based access') && !contains(normalized, 'admin')) {
    ambiguity.push('Role hierarchy inferred from default admin/manager/agent structure');
  }

  const intent = {
    app_name: contains(normalized, 'crm') ? 'CRM Workspace' : 'AI Compiler App',
    entities: Array.from(entities).map((name) => ({
      name,
      type: ENTITY_TEMPLATES[name as keyof typeof ENTITY_TEMPLATES]?.type ?? 'core',
      fields: ENTITY_TEMPLATES[name as keyof typeof ENTITY_TEMPLATES]?.fields ?? [],
    })),
    roles,
    features: Array.from(features),
    workflows: Array.from(workflows),
    constraints,
    missing_information: missingInformation,
    assumptions,
    ambiguity,
  };

  return IntentSchema.parse(intent);
}
