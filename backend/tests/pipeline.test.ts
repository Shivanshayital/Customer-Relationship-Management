import test from 'node:test';
import assert from 'node:assert/strict';
import { compileApp, runEvaluation } from '../src/pipeline/compiler.js';

test('compileApp generates a complete executable configuration for CRM prompts', async () => {
  const result = await compileApp('Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.');

  assert.equal(result.intent.app_name, 'CRM Workspace');
  assert.equal(result.validation.overall_status, 'pass');
  assert.equal(result.runtime.execution_status, 'pass');
  assert.ok(result.ui.pages.length >= 4);
  assert.ok(result.api.endpoints.length >= 4);
  assert.ok(result.database.tables.length >= 4);
  assert.ok(result.assumptions.length >= 1);
  assert.ok(Object.keys(result.confidence_scores).length >= 3);
  assert.ok(result.dependency_graph.nodes.length >= 4);
});

test('compileApp repairs contradictory payment and auth prompts deterministically', async () => {
  const result = await compileApp('Users can checkout as guests but login is mandatory. Premium users have free access but payment is required.');

  assert.equal(result.validation.overall_status, 'repair_required');
  assert.ok(result.repair_logs.length >= 1);
  assert.ok(result.repair_summary.repaired_modules.length >= 1);
  assert.equal(result.repair_summary.preserved_modules.includes('ui_schema'), true);
});

test('compileApp repairs checkout without login phrasing', async () => {
  const result = await compileApp('Users can checkout without login but login is mandatory');

  assert.equal(result.validation.overall_status, 'repair_required');
  assert.equal(result.validation.repaired, true);
  assert.ok(result.repair_logs.some((log) => log.includes('guest checkout')));
});

test('runEvaluation returns dashboard metrics', async () => {
  const metrics = await runEvaluation();

  assert.equal(metrics.total_prompts, 21);
  assert.ok(metrics.success_rate >= 0);
  assert.ok(metrics.validation_failures >= 0);
  assert.ok(metrics.repaired_failures >= 0);
  assert.ok(metrics.unrecoverable_failures >= 0);
  assert.ok(metrics.repair_success_rate >= 0);
});
