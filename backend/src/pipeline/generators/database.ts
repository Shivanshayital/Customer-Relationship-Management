import { z } from 'zod';
import { IntentSchema } from '../schemas.js';

export function generateDatabaseSchema(intent: z.infer<typeof IntentSchema>) {
  return {
    app_name: intent.app_name,
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', required: true },
          { name: 'email', type: 'text', required: true },
          { name: 'role', type: 'text', required: true },
          { name: 'password_hash', type: 'text', required: true },
        ],
        relations: [],
        indexes: ['users_email_idx'],
      },
      {
        name: 'contacts',
        columns: [
          { name: 'id', type: 'uuid', required: true },
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'text', required: true },
          { name: 'phone', type: 'text', required: false },
          { name: 'company', type: 'text', required: false },
          { name: 'owner_id', type: 'uuid', required: true },
        ],
        relations: [{ target_table: 'users', field: 'owner_id' }],
        indexes: ['contacts_email_idx'],
      },
      {
        name: 'plans',
        columns: [
          { name: 'id', type: 'uuid', required: true },
          { name: 'name', type: 'text', required: true },
          { name: 'price', type: 'number', required: true },
        ],
        relations: [],
        indexes: [],
      },
      {
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', required: true },
          { name: 'user_id', type: 'uuid', required: true },
          { name: 'plan_id', type: 'uuid', required: true },
          { name: 'status', type: 'text', required: true },
        ],
        relations: [
          { target_table: 'users', field: 'user_id' },
          { target_table: 'plans', field: 'plan_id' },
        ],
        indexes: ['payments_user_idx'],
      },
      {
        name: 'analytics_snapshots',
        columns: [
          { name: 'id', type: 'uuid', required: true },
          { name: 'metric_name', type: 'text', required: true },
          { name: 'value', type: 'number', required: true },
        ],
        relations: [],
        indexes: [],
      },
    ],
  };
}
