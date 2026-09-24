# AGENTS.md

## Project Overview

This repository is a TypeScript project using LangChain to build LLM-powered applications.

The project uses two different databases with different responsibilities:

- SQLite: local relational/application data persistence.
- Qdrant: vector storage and semantic similarity search.

The project also uses Ollama for local LLMs and embeddings and supports OpenAI-compatible APIs.

## General Rules

When modifying this repository:

1. Understand the existing architecture before making changes.
2. Prefer small and focused changes.
3. Reuse existing abstractions and types.
4. Do not introduce duplicate implementations.
5. Do not modify unrelated files.
6. Preserve existing behavior unless the task explicitly requires a behavior change.
7. Do not expose secrets or credentials.
8. Keep documentation synchronized with architectural changes.

## TypeScript

Use strict TypeScript.

Prefer explicit types.

Avoid `any`.

Do not use:

```typescript
const value: any = something;
```

Do not use `as any` to bypass TypeScript errors.

Prefer interfaces, types, generics, unions, and type guards.

## Architecture Rules

Keep responsibilities separated.

### Chains

Chains are responsible for orchestrating LLM-related workflows.

They should not contain unnecessary database implementation details.

### SQLite

SQLite is responsible for local relational/application data.

Do not use SQLite as a replacement for vector search.

### Qdrant

Qdrant is responsible for vector embeddings and semantic similarity search.

Do not treat Qdrant as a relational SQL database.

### Embeddings

Embedding generation should remain isolated from business logic.

The embedding provider may be changed without requiring changes to unrelated application components.

### LLM

LLM configuration should remain isolated from business logic where practical.

Do not hardcode API keys, model credentials, or provider-specific secrets.

## LangChain

Use the LangChain APIs already established by the project.

Before introducing a new abstraction:

1. Check the installed package version.
2. Search the existing codebase for similar functionality.
3. Follow the existing project pattern.
4. Prefer composable Runnables when they improve clarity.
5. Avoid unnecessary abstractions.

Do not mix different LangChain patterns without a clear reason.

## Database Rules

The project intentionally uses two databases.

### SQLite

Use SQLite for:

- Local application data
- Metadata
- Persistent local state
- Relational data
- Data that requires SQL queries or relationships

### Qdrant

Use Qdrant for:

- Embeddings
- Vector storage
- Similarity search
- Semantic retrieval

When adding a feature, choose the database according to the responsibility of the data.

Do not duplicate the same source of truth unnecessarily.

## Environment Variables

Never commit secrets.

Use environment variables for:

- API keys
- Database URLs
- Database credentials
- Model configuration
- External service configuration

Keep `.env.example` synchronized with required environment variables.

Never commit `.env`.

## Error Handling

Do not silently ignore errors.

Avoid empty catch blocks:

```typescript
try {
  await operation();
} catch {}
```

Handle errors when recovery is possible.

Otherwise, propagate the error with enough context for the caller to understand the failure.

## Testing

New behavior should have tests when practical.

Tests should focus on behavior rather than implementation details.

Database-dependent tests should avoid modifying production data.

Prefer isolated test data and test-specific databases/collections.

## Code Style

The project uses:

- ESLint
- Prettier
- TypeScript

Do not disable lint rules just to make the code pass.

If an exception is genuinely necessary, keep it as narrow as possible.

## Validation

Before considering a change complete, run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

If one of these commands does not exist yet, do not invent its result. Add the required script/configuration when appropriate.

## Documentation

Update documentation when changing:

- Architecture
- Database responsibilities
- Public APIs
- Environment variables
- Development workflow
- Important dependencies
- LLM or embedding providers

Architectural decisions should be documented under:

```text
docs/decisions/
```

## AI Agent Workflow

Before changing code:

1. Inspect the relevant files.
2. Understand the current implementation.
3. Identify existing patterns.
4. Determine the smallest appropriate change.
5. Implement the change.
6. Run TypeScript validation.
7. Run ESLint.
8. Run formatting checks.
9. Run relevant tests.
10. Update documentation if necessary.

Do not rewrite the project simply to introduce a preferred architecture.

Follow the architecture that already exists unless the task explicitly requests architectural changes.
