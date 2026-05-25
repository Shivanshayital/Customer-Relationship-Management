# Architecture Diagram

```mermaid
flowchart TD
  A[User Prompt] --> B[Intent Extraction]
  B --> C[System Design]
  C --> D1[UI Schema Generator]
  C --> D2[API Schema Generator]
  C --> D3[Database Schema Generator]
  C --> D4[Auth Config Generator]
  C --> D5[Business Logic Generator]
  D1 --> E[Validation Engine]
  D2 --> E
  D3 --> E
  D4 --> E
  D5 --> E
  E --> F[Repair Engine]
  F --> G[Runtime Simulator]
  G --> H[Executable Config Export]
```

## Pipeline highlights
- Deterministic intent extraction with strict schemas
- Independent module generation for UI, API, database, auth, and business logic
- Cross-layer validation and targeted repair
- Runtime simulation for routes, permissions, forms, and DB operations
