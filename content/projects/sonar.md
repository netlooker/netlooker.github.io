+++
title = "Sonar"
date = "2026-04-04T18:22:00+00:00"
lastmod = "2026-05-14T12:30:00+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/project-sonar.png"
tags = ["ai", "web", "search", "retrieval", "agents"]
keywords = ["web search", "live evidence", "deterministic retrieval", "SearXNG", "document extraction", "MCP", "research pipeline"]
description = "Deterministic live-web search, fetch, and extraction service — the external evidence layer for agent workflows."
status = "STABLE"
link = "https://github.com/netlooker/sonar"
uid = "PX-2026-003"
showFullContent = false
readingTime = true
hideComments = false
+++

Sonar is the external evidence layer for agent workflows. Where Synapse owns private memory and semantic retrieval over a local vault, Sonar owns fresh signal from the live web — search, fetch, extract, and structured handoff, all deterministic, no LLM in the core path.

The design is intentionally narrow. Search through an external SearXNG instance, rank and deduplicate with transparent scoring, cache fetches in SQLite, extract readable text from HTML, PDF, DOCX, ODT, and Markdown, then persist everything as durable bundles for downstream indexing. Two thin transport adapters — HTTP/OpenAPI and MCP — expose the same service layer to apps and agents.

## // TECH STACK

- `Python 3.12` — service core, CLI tools, and transport adapters.
- `SearXNG` — external metasearch backend, configurable per-deployment.
- `httpx` — async HTTP client for fetch operations with TLS impersonation support.
- `trafilatura` — document extraction engine for HTML, PDF, DOCX, ODT, Markdown, and plain text.
- `pypdf` — PDF text extraction.
- `SQLite` — persistent cache for search results, fetched metadata, and prepared-source bundle registries.
- `FastAPI` + `uvicorn` — HTTP/OpenAPI server surface.
- `MCP` — Model Context Protocol adapter for agent runtimes.
- `Pydantic` — typed settings, runtime resolution, and data validation.

## // ARCHITECTURE

Three layers, clean separation:

1. **Settings & Runtime** — typed configuration via Pydantic, resolved from TOML config files with optional secrets overlays. Public-safe tracked configs, sensitive values in `secrets/`.
2. **Deterministic Service Core** — the mechanics engine. Query normalization, variant generation, SearXNG search dispatch, URL canonicalization and deduplication, ranking with freshness decay and domain priors, cached fetch metadata, multi-format text extraction, and durable bundle persistence.
3. **Transport Adapters** — thin HTTP and MCP layers that hit the same service core. Agents and apps talk to one grid.

### Ranking Mechanics

Every search result is scored transparently — no opaque ranking:

- **Position score** — SearXNG rank position, decaying 0.1 per rank.
- **Query overlap** — fraction of query terms found in title + snippet (weighted ×0.8).
- **Freshness boost** — exponential decay with ~30-day half-life, recent documents get up to +0.4.
- **Domain priors** — configurable per-domain bonuses (e.g., `docs.python.org` +0.35, `wikipedia.org` +0.10).
- **Deduplication** — canonical URL dedup with tracking parameter stripping (`utm_*`, `fbclid`, etc.).

### Caching

- Search results cached 15 minutes per query signature.
- Extracted text cached 24 hours.
- `force_refresh` bypasses cache when needed.

## // SURFACE

### HTTP Routes

| Endpoint | Purpose |
|---|---|
| `GET /health` | Runtime readiness check |
| `POST /search` | Live web search via SearXNG |
| `POST /fetch` | Fetch URL and cache metadata |
| `POST /extract` | Extract readable text from URL or cached document |
| `POST /find-papers` | Curated scientific paper candidates |
| `POST /prepare-paper-set` | Search, filter, extract a prepared paper set |
| `POST /collect-sources` | Compact structured source bundle for a topic |

### MCP Tools

Seven tools mirroring the HTTP surface: `sonar_health`, `sonar_search`, `sonar_fetch`, `sonar_extract`, `sonar_find_papers`, `sonar_prepare_paper_set`, `sonar_collect_sources_for_topic`.

The low-level tools (`search`, `fetch`, `extract`) are the canonical composable API. The high-level facade tools (`prepare-paper-set`, `collect-sources`, `find-papers`) collapse the retrieval loop for weaker local runtimes and return structured source bundles instead of requiring repeated orchestration.

## // SYNAPSE HANDOFF

Sonar and Synapse are designed as a pair. The intended downstream flow:

1. Call `prepare-paper-set` or `collect-sources` in Sonar.
2. Persist the prepared bundle manifest (`prepared_source_bundle.json`).
3. Hand the bundle to Synapse via `synapse_ingest_bundle`.
4. Let Synapse own indexing, knowledge compile, and review.

The compatibility contract is `bundle_version = 1`. Synapse normalizes from the core prepared-source fields and tolerates extra metadata, so Sonar can evolve the bundle format without breaking the handoff.

## // STATUS

Sonar v0.1.0 is live and production-deployed. The service is actively used as the web evidence layer in the Nyx agent runtime, powering research workflows, story harvesting, and knowledge base expansion.

### Current Deployment

| Metric | Value |
|---|---|
| Version | 0.1.0 |
| Search backend | SearXNG (dedicated sidecar) |
| Cache | SQLite (`/data/sonar.sqlite`) |
| Extraction | trafilatura + pypdf (HTML, PDF, DOCX, ODT, MD, text) |
| Interfaces | MCP + HTTP (FastAPI) |
| Bundle format | v1 (Synapse-compatible) |
| Config | TOML (`/config/sonar.toml`) |

### Active Development

The current lane focuses on:
- Hardening bundle persistence and sidecar generation
- Refining ranking priors for domain-specific searches
- Expanding extraction format support
- Tightening the Sonar → Synapse handoff pipeline

## // DEPLOY

```bash
# Development
uv sync --extra dev
cp config/sonar.example.toml config/sonar.toml
uv run sonar-smoke --config config/sonar.toml
uv run sonar-api --config config/sonar.toml

# MCP server
SONAR_CONFIG=/absolute/path/to/config/sonar.toml uv run sonar-mcp

# Docker
docker build -t sonar:latest .
docker run --rm -p 8001:8001 \
  -e SONAR_CONFIG=/app/config/sonar.toml \
  -v "$(pwd)/config/sonar.toml:/app/config/sonar.toml:ro" \
  -v sonar-data:/data \
  sonar:latest

# Docker Compose (Sonar + SearXNG)
docker compose up --build
```

Point the config at your SearXNG instance, mount your SQLite volume, and the grid starts listening. No LLM required — just deterministic mechanics doing the work.
