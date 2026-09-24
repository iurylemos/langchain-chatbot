# Architecture

## Overview

The project is a TypeScript application built around LangChain and LLM-based workflows.

The architecture separates application logic, LLM orchestration, embeddings, vector search, and local relational persistence.

The project uses two databases because they solve different problems.

```text
                         Application
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
            LangChain                  Persistence
                 │                         │
        ┌────────┴────────┐          ┌─────┴─────┐
        │                 │          │           │
        ▼                 ▼          ▼           ▼
      LLM             Embeddings   SQLite      Qdrant
        │                 │          │           │
        │                 │          │           │
        │                 │          │       Vector Search
        │                 │          │
        │                 │          Relational /
        │                 │          Local Data
        │                 │
        │             Vector
        │             Generation
        │
        ▼
     Response
```

## Main Components

### LangChain

LangChain provides the abstractions used to compose LLM workflows.

The project uses LangChain components for operations such as:

- Prompt composition
- Runnable pipelines
- Embeddings
- Document processing
- Retrieval
- LLM interaction

LangChain should primarily be used for orchestration and LLM-related workflows.

---

## LLM

The LLM is responsible for generating or transforming information.

The project may use an OpenAI-compatible API, including locally hosted models through Ollama.

The LLM provider should remain configurable.

Example:

```text
Application
    │
    ▼
LangChain
    │
    ▼
LLM Client
    │
    ▼
Ollama / OpenAI-compatible API
```

---

## Embeddings

Embeddings transform text into numerical vectors.

The resulting vectors are stored in Qdrant.

```text
Document
   │
   ▼
Embedding Model
   │
   ▼
Vector
   │
   ▼
Qdrant
```

The embedding model is independent from SQLite.

---

## Qdrant

Qdrant is the vector database.

Its responsibility is semantic retrieval.

Typical flow:

```text
User Query
    │
    ▼
Embedding Model
    │
    ▼
Query Vector
    │
    ▼
Qdrant
    │
    ▼
Similar Documents
```

Qdrant should not be treated as a relational database.

It stores vectors together with payload/metadata required for retrieval.

---

## SQLite

SQLite is used for local relational persistence.

Typical responsibilities include:

- Application data
- Local metadata
- Conversation state
- User/application information
- Persistent local configuration

Typical flow:

```text
Application
    │
    ▼
SQLite
    │
    ▼
Local Persistent Data
```

SQLite and Qdrant should not be considered interchangeable.

---

## Relationship Between SQLite and Qdrant

The two databases may contain related information, but their responsibilities are different.

For example:

```text
                    Document
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
          SQLite               Qdrant
             │                   │
        Metadata             Embedding
        File information    Vector
        Application state   Search data
```

SQLite can contain information about a document while Qdrant contains the representation required for semantic retrieval.

A shared identifier should be used when the application needs to associate vector records with relational records.

---

## Retrieval Flow

A typical RAG flow is:

```text
User Question
      │
      ▼
Generate Query Embedding
      │
      ▼
Qdrant Similarity Search
      │
      ▼
Retrieved Documents
      │
      ▼
Build Prompt
      │
      ▼
LLM
      │
      ▼
Generated Response
```

SQLite may be used alongside this flow when application state, conversation history, or metadata is required.

---

## Classification Flow

The classification workflow follows the application's LangChain chain implementation.

Conceptually:

```text
Input
  │
  ▼
Validation
  │
  ▼
Prompt / Chain
  │
  ▼
LLM
  │
  ▼
Structured Result
```

Input and output schemas should be explicitly defined where practical.

---

## Directory Responsibilities

```text
src/
├── chains/
│   └── LLM orchestration
│
├── interfaces/
│   └── Shared TypeScript contracts
│
├── utils/
│   └── Small reusable utilities
│
└── test/
    └── Test configuration and helpers
```

New directories should only be introduced when they represent a meaningful responsibility.

---

## Architectural Principles

The project follows these principles:

### Separation of concerns

Each component should have one clear responsibility.

### Provider independence

LLM and embedding providers should be replaceable where practical.

### Explicit data ownership

SQLite and Qdrant should have clearly defined responsibilities.

### Type safety

TypeScript should be used to catch invalid states as early as possible.

### Testability

Core logic should be testable without requiring external production services whenever practical.

### Small changes

Changes should be incremental and avoid unnecessary rewrites.
