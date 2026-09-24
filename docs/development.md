# Development Guide

## Requirements

Install:

- Node.js
- npm
- Ollama
- Qdrant

## Installation

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required environment variables.

## Ollama

Pull the models required by the project:

```bash
ollama pull llama3.2:3b
ollama pull gemma3:4b
```

Verify Ollama is running:

```bash
ollama list
```

## Qdrant

Configure the Qdrant connection using environment variables.

Example:

```env
QDRANT_URL=
QDRANT_API_KEY=
```

Do not commit credentials.

## SQLite

SQLite is used for local persistent application data.

The database file should normally remain local and should not be committed when it contains runtime data.

Add database files to `.gitignore` when appropriate.

## Development

Run the development application:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

## Formatting

Format files:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

## Tests

```bash
npm test
```

## Recommended Workflow

Before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

## Environment Variables

Keep `.env.example` updated whenever a new environment variable becomes required.

Never commit `.env`.
