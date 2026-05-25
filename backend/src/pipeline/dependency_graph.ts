export type DependencyNode = {
  id: string;
  label: string;
  type: 'ui' | 'api' | 'db' | 'auth' | 'business' | 'runtime';
  metadata?: Record<string, unknown>;
};

export type DependencyEdge = {
  source: string;
  target: string;
  label: string;
};

export type DependencyGraph = {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
};

export function buildDependencyGraph(params: {
  ui: { pages: Array<{ name: string; route: string }> };
  api: { endpoints: Array<{ path: string }> };
  database: { tables: Array<{ name: string }> };
  auth: { roles: Array<{ name: string }> };
  business: { workflows: Array<{ name: string }> };
  runtime: { execution_status: string };
}) {
  const nodes: DependencyNode[] = [
    ...params.ui.pages.map((page) => ({ id: `ui:${page.route}`, label: page.name, type: 'ui' as const, metadata: { route: page.route } })),
    ...params.api.endpoints.map((endpoint) => ({ id: `api:${endpoint.path}`, label: endpoint.path, type: 'api' as const })),
    ...params.database.tables.map((table) => ({ id: `db:${table.name}`, label: table.name, type: 'db' as const })),
    ...params.auth.roles.map((role) => ({ id: `auth:${role.name}`, label: role.name, type: 'auth' as const })),
    ...params.business.workflows.map((workflow) => ({ id: `business:${workflow.name}`, label: workflow.name, type: 'business' as const })),
    { id: 'runtime:simulator', label: 'Runtime Simulator', type: 'runtime', metadata: { status: params.runtime.execution_status } },
  ];

  const edges: DependencyEdge[] = [];

  nodes.forEach((node) => {
    if (node.type === 'ui') {
      params.api.endpoints.forEach((endpoint) => {
        if (endpoint.path.includes(node.metadata?.route as string) || node.metadata?.route === '/contacts' && endpoint.path === '/contacts') {
          edges.push({ source: node.id, target: `api:${endpoint.path}`, label: 'uses' });
        }
      });
    }

    if (node.type === 'api') {
      params.database.tables.forEach((table) => {
        if (node.label.includes(table.name) || node.label.includes('contacts') && table.name === 'contacts' || node.label.includes('billing') && table.name === 'payments') {
          edges.push({ source: node.id, target: `db:${table.name}`, label: 'reads/writes' });
        }
      });
    }

    if (node.type === 'auth') {
      params.api.endpoints.forEach((endpoint) => {
        edges.push({ source: node.id, target: `api:${endpoint.path}`, label: 'protects' });
      });
    }

    if (node.type === 'business') {
      params.database.tables.forEach((table) => {
        edges.push({ source: node.id, target: `db:${table.name}`, label: 'triggers' });
      });
    }
  });

  return { nodes, edges };
}
