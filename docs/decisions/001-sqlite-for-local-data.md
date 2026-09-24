# ADR 001: Use SQLite for Local Application Data

## Status

Accepted

## Context

The application requires local persistent storage for relational and application-level information.

The project also uses Qdrant, but Qdrant is designed for vector storage and semantic similarity search rather than general relational application data.

## Decision

Use SQLite for local relational/application data.

SQLite is responsible for data that benefits from:

- SQL queries
- Relational structures
- Local persistence
- Application metadata
- Structured application state

## Consequences

The application has a simple local database without requiring a separate relational database server.

Qdrant remains responsible for vector data.

The same information should not be unnecessarily duplicated between SQLite and Qdrant.
