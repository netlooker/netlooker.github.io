+++
title = "Synapse"
date = "2026-03-29T14:24:52+00:00"
lastmod = "2026-05-14T12:00:00+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/project-synapse.jpg"
tags = ["ai", "markdown", "retrieval", "knowledge"]
keywords = ["semantic search", "vector database", "markdown vault", "knowledge layer", "compiled knowledge"]
description = "Semantic retrieval and compiled knowledge layer for markdown vaults with local-first operator control."
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

Synapse is live and production-hardened. The vault currently indexes **375 markdown notes** across **1,597 embedded segments**, with a compiled **knowledge layer** that has processed **13 managed source summaries** through the proposal pipeline.

The retrieval core handles semantic search in `source`, `note`, `evidence`, and `research` modes. The knowledge layer adds a new capability: ingested research bundles can be compiled into structured `source_summary` proposals, reviewed, and applied as managed notes — giving the vault a curated knowledge layer on top of raw indexed content.

A built-in `synapse-smoke` command lets agents dry-run provider wiring, indexing, retrieval, validation, and maintenance checks against a fixture vault using a fresh temporary DB by default.

### Current Deployment

| Metric | Value |
|---|---|
| Indexed notes | 375 |
| Embedded segments | 1,597 |
| Knowledge sources | 13 (Mirrorshades anthology) |
| Applied proposals | 13 |
| Vector backend | `sqlite-vec` |
| Embedding model | Perplexity pplx-embed-v1 (1024-d) |
| Chunk strategy | Contextual (Infinity batch) |
| Interfaces | MCP + HTTP (FastAPI) |

### Knowledge Layer Pipeline

The compiled knowledge layer works in four stages:

1. **Ingest** — a research source bundle (JSON artifact) is loaded into Synapse via `synapse_ingest_bundle`, writing sources and chunks to the vector store.
2. **Compile** — `synapse_knowledge_compile_bundle` generates pending `source_summary` proposals from the ingested sources.
3. **Review** — proposals are inspected via `synapse_knowledge_get_proposal` for accuracy and completeness.
4. **Apply** — `synapse_knowledge_apply_proposal` writes the managed note to disk, updates `index.md` and `log.md`, then reindexes.

First production run processed all 13 stories from Gibson's _Mirrorshades_ anthology into managed knowledge notes under `_knowledge/sources/mirrorshades-manual-2026-05-13/`.

### Active Development

The current lane focuses on:
- Tuning discovery quality on larger corpora
- Expanding vector-index audit inside `Cipher`
- Preparing the seam for a second backend beyond `sqlite-vec`
- Scaling the knowledge pipeline to additional source bundles (scientific paper archives, cyberpunk story collections)

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
