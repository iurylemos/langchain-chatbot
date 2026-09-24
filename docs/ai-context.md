# AI Context

## Purpose

This document provides architectural and technical context for AI coding assistants working on this repository.

The goal is to help an AI understand the existing project before suggesting or implementing changes.

## Project

This is a TypeScript LangChain project focused on LLM workflows, embeddings, vector search, and local persistence.

The project intentionally uses two databases:

- SQLite for relational/local application data.
- Qdrant for vector data and semantic search.

## Technology Context

Main technologies:

- TypeScript
- LangChain
- Ollama
- OpenAI-compatible APIs
- Qdrant
- SQLite
- Zod
- Jest

## Important Architectural Distinction

Do not confuse SQLite and Qdrant.

SQLite:

```text
Relational data
Metadata
Application state
Local persistence
SQL queries
```

Qdrant:

```text
Embeddings
Vectors
Similarity search
Semantic retrieval
Vector metadata/payloads
```

They solve different problems.

## LLM Context

The application can use local models through Ollama or an OpenAI-compatible API.

The code should avoid coupling business logic directly to one provider when an abstraction is practical.

Model names and endpoints should be configuration rather than hardcoded application behavior whenever possible.

## RAG Context

When implementing RAG functionality, follow this conceptual flow:

```text
Documents
    │
    ▼
Document Loader
    │
    ▼
Text Splitting
    │
    ▼
Embeddings
    │
    ▼
Qdrant
    │
    ▼
Retriever
    │
    ▼
Prompt
    │
    ▼
LLM
    │
    ▼
Response
```

Do not put the entire RAG workflow inside an unrelated utility or controller.

## Chain Context

Chains should primarily orchestrate application/LLM workflows.

A chain should not become a large collection of unrelated responsibilities.

Prefer:

```text
Chain
 ├── Input validation
 ├── Prompt / Runnable composition
 ├── LLM interaction
 └── Output handling
```

over a single class containing database, embedding, HTTP, and business logic.

## Type Context

Prefer existing project types.

Before creating a new interface:

1. Search for an existing type.
2. Check whether it can be reused.
3. Extend it if appropriate.
4. Create a new type only when the responsibility is genuinely different.

Avoid `any`.

## Database Context

When a feature needs persistent data, first determine whether the data is:

- relational/application data → SQLite
- semantic/vector data → Qdrant

If both are required, define how the records are associated.

Prefer stable identifiers rather than duplicating entire records between databases.

## Configuration Context

Configuration should come from environment variables where appropriate.

Never commit:

- API keys
- passwords
- tokens
- private URLs
- production credentials

Keep `.env.example` updated.

## Existing Code First

Before introducing a new pattern, inspect the existing repository.

The AI should prefer consistency with the existing implementation over introducing a new architecture merely because another pattern is popular.

## Change Strategy

For a requested change:

```text
Understand
    ↓
Search existing implementation
    ↓
Identify affected components
    ↓
Make the smallest change
    ↓
Typecheck
    ↓
Lint
    ↓
Test
    ↓
Update documentation
```

Avoid unrelated refactoring.

## Documentation Strategy

Use:

- `README.md` for project introduction and quick start.
- `AGENTS.md` for AI development rules.
- `docs/architecture.md` for system architecture.
- `docs/ai-context.md` for technical context useful to AI agents.
- `docs/development.md` for development workflow.
- `docs/testing.md` for testing strategy.
- `docs/decisions/` for architectural decisions.

## Unknowns

If the existing code does not provide enough information to safely make a change, inspect the repository further before assuming the behavior.

Do not invent undocumented behavior.
