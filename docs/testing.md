# Testing Guide

## Purpose

Tests verify application behavior and help prevent regressions.

## Test Types

The project may contain:

- Unit tests
- Integration tests
- LLM-related tests
- Database integration tests

## Unit Tests

Unit tests should isolate the component being tested whenever practical.

External services should not be required for simple unit tests.

## SQLite Tests

Database tests should use an isolated test database.

Tests should not modify the developer's normal application database.

## Qdrant Tests

Qdrant integration tests should use a dedicated test collection.

Test data should be isolated from development or production collections.

## LLM Tests

LLM-dependent tests can be slower and less deterministic than normal unit tests.

When possible, separate deterministic application tests from tests that require an actual model.

## Test Naming

Use descriptive names that explain the behavior being verified.

Example:

```typescript
it("classifies a health-related document", async () => {
  // ...
});
```

Avoid names such as:

```typescript
it("works", async () => {
  // ...
});
```

## Before Pull Request

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```
