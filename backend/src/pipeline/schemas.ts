import { z } from 'zod';

export const PromptInputSchema = z.object({
  prompt: z.string().min(8),
});

export const IntentSchema = z.object({
  app_name: z.string(),
  entities: z.array(z.object({
    name: z.string(),
    type: z.enum(['core', 'reference', 'transactional', 'lookup']),
    fields: z.array(z.string()),
  })),
  roles: z.array(z.string()),
  features: z.array(z.string()),
  workflows: z.array(z.string()),
  constraints: z.array(z.string()),
  missing_information: z.array(z.string()),
  assumptions: z.array(z.string()),
  ambiguity: z.array(z.string()),
});

export const SystemDesignSchema = z.object({
  app_name: z.string(),
  page_structure: z.array(z.string()),
  service_architecture: z.array(z.string()),
  data_flow: z.array(z.string()),
  api_grouping: z.array(z.object({
    group: z.string(),
    endpoints: z.array(z.string()),
  })),
  permission_model: z.array(z.object({
    role: z.string(),
    access: z.array(z.string()),
  })),
});

export const UiConfigSchema = z.object({
  app_name: z.string(),
  pages: z.array(z.object({
    name: z.string(),
    route: z.string(),
    layout: z.string(),
    components: z.array(z.string()),
    tables: z.array(z.string()),
    forms: z.array(z.object({
      name: z.string(),
      fields: z.array(z.string()),
    })),
  })),
  navigation: z.array(z.string()),
});

export const ApiConfigSchema = z.object({
  app_name: z.string(),
  endpoints: z.array(z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    path: z.string(),
    summary: z.string(),
    request_schema: z.record(z.string(), z.string()),
    response_schema: z.record(z.string(), z.string()),
    validation_rules: z.array(z.string()),
  })),
});

export const DatabaseSchemaSchema = z.object({
  app_name: z.string(),
  tables: z.array(z.object({
    name: z.string(),
    columns: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
    })),
    relations: z.array(z.object({
      target_table: z.string(),
      field: z.string(),
    })),
    indexes: z.array(z.string()),
  })),
});

export const AuthConfigSchema = z.object({
  app_name: z.string(),
  session_mode: z.enum(['jwt', 'session']),
  roles: z.array(z.object({
    name: z.string(),
    permissions: z.array(z.string()),
  })),
  rules: z.array(z.string()),
});

export const BusinessLogicSchema = z.object({
  app_name: z.string(),
  premium_gating: z.array(z.string()),
  workflows: z.array(z.object({
    name: z.string(),
    trigger: z.string(),
    steps: z.array(z.string()),
  })),
  role_checks: z.array(z.string()),
});

export const RuntimeSchema = z.object({
  app_name: z.string(),
  routes: z.array(z.object({
    path: z.string(),
    guard: z.string(),
    actions: z.array(z.string()),
  })),
  forms: z.array(z.object({
    page: z.string(),
    fields: z.array(z.string()),
    validation: z.array(z.string()),
  })),
  permission_checks: z.array(z.object({
    role: z.string(),
    route: z.string(),
    allowed: z.boolean(),
  })),
  db_operations: z.array(z.object({
    table: z.string(),
    operation: z.enum(['create', 'read', 'update', 'delete']),
    outcome: z.string(),
  })),
  execution_status: z.string(),
});

export const ValidationReportSchema = z.object({
  overall_status: z.enum(['pass', 'repair_required', 'fail']),
  issues: z.array(z.object({
    layer: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    repair_action: z.string(),
  })),
  repaired: z.boolean(),
});

export const EvaluationMetricsSchema = z.object({
  total_prompts: z.number(),
  success_rate: z.number(),
  retries: z.number(),
  validation_failures: z.number(),
  repair_count: z.number(),
  latency_ms: z.number(),
  token_cost: z.number(),
});
