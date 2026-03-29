+++
title = "Synapse"
date = "2026-03-29T14:24:52+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/project-synapse.jpg"
tags = ["ai", "markdown", "retrieval"]
keywords = ["semantic search", "vector database", "markdown vault"]
description = "Semantic retrieval and discovery for markdown vaults with local-first operator control."
status = "STABLE"
link = "https://github.com/netlooker/synapse"
uid = "PX-2026-002"
showFullContent = false
readingTime = true
hideComments = false
+++

Synapse is a semantic cortex for markdown archives. It crawls a folder of notes, carves the signal into chunks, embeds the note stream, and maps hidden links that plain keyword search leaves buried in the subnet. The mission is simple: turn a loose markdown vault into a live retrieval layer that can surface weak signals, broken graph edges, and connections the human eye misses under load.

## // TECH STACK

- `Python 3.12` — runs the indexing, search, discovery, and transport daemons.
- `sqlite-vec` — stores local vector memory in a lightweight SQLite-backed layer.
- `Perplexity embeddings` — power note-level and contextual chunk-level retrieval.
- `Infinity` — serves the high-end `4B` embedding models over a local-compatible endpoint.
- `Ollama` — provides fallback local embeddings and reasoning-model access on silicon.
- `FastAPI` — exposes Synapse over HTTP and OpenAPI for web clients and PWAs.
- `MCP` — exposes the same tool surface to agent runtimes.
- `PydanticAI` — drives `Cipher`, the reasoning shell over the deterministic core.

## // ARCHITECTURE

The stack runs in three bands. The retrieval core scans markdown, extracts metadata, chunks notes, writes vectors, and scores search and discovery results with deterministic Python services. `Cipher` rides above that layer and handles audit, explanation, and maintenance review without taking over the mechanics. On the edge, MCP and HTTP both hit the same service layer, so agents and apps talk to one grid instead of two drifting clones.

## // STATUS

Synapse is live and usable. It indexes generic markdown folders, stores note and chunk embeddings, runs semantic search in `note`, `chunk`, and `hybrid` modes, and exposes aligned MCP and HTTP interfaces. A built-in `synapse-smoke` command now lets agents dry-run provider wiring, indexing, retrieval, validation, and maintenance checks against a fixture vault using a fresh temporary DB by default. The current lane focuses on tuning discovery quality on larger corpora, expanding vector-index audit inside `Cipher`, and preparing the seam for a second backend beyond `sqlite-vec`.

## // DEPLOY

```bash
uv sync
cp config/synapse.example.toml config/synapse.toml
uv run synapse-smoke --config config/synapse.toml
uv run synapse-index --config config/synapse.toml --cortex ~/notes --db ~/notes/.synapse.sqlite
uv run synapse-search --config config/synapse.toml --db ~/notes/.synapse.sqlite --mode hybrid "weak signals across notes"
uv run synapse-discover --config config/synapse.toml --db ~/notes/.synapse.sqlite --threshold 0.20 --max 10
```

Jack in, dry-run the stack, index the vault, and let the grid start whispering back.
