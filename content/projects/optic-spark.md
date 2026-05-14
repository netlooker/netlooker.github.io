+++
title = "Optic-Spark"
date = "2026-05-14T15:10:00+00:00"
lastmod = "2026-05-14T15:10:00+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/project-optic-spark.png"
tags = ["ai", "image-generation", "gpu", "diffusion", "api", "agents"]
keywords = ["Z-Image-Turbo", "GGUF", "diffusion transformer", "NVIDIA DGX Spark", "Grace-Blackwell", "image generation API", "webhook", "photorealistic rendering", "AI agents"]
description = "Asynchronous REST API for ultra-fast photorealistic image generation on Grace-Blackwell GPUs, powered by Z-Image-Turbo."
status = "STABLE"
link = "https://github.com/netlooker/optic-spark"
uid = "PX-2026-004"
showFullContent = false
readingTime = true
hideComments = false
+++

Optic-Spark is the GPU rendering layer for AI agent workflows. Where Sonar owns live-web evidence and Synapse owns private semantic memory, Optic-Spark owns visual generation — turning text prompts into photorealistic images in under 10 seconds, served through a clean async webhook API designed for autonomous consumption.

Built exclusively for the NVIDIA DGX Spark platform (Grace-Blackwell GB10 superchip), it uses the Z-Image-Turbo 6B-parameter diffusion transformer in a Q4_K_M 4-bit quantized GGUF format. The async architecture means agents fire a prompt and get back to work — the rendered image arrives at their webhook when the GPU is done. No polling, no blocking.

## // TECH STACK

- `Python 3.12` — FastAPI service core, async inference pipeline, and webhook dispatch.
- `Z-Image-Turbo (GGUF)` — distilled 6B-parameter single-stream diffusion transformer for sub-10-second inference.
- `diffusers` — Hugging Face diffusion library, `from_single_file` loading for GGUF models.
- `NVIDIA Grace-Blackwell (GB10)` — target hardware, SM 12.1a instruction set, `expandable_segments` memory allocation.
- `Go` — standalone `optic-cli` binary for synchronous agent use (abstracts the async webhook flow).
- `Docker Compose` — containerized deployment with automated model download init-container.
- `FastAPI` — REST API surface with auto-generated OpenAPI spec and Swagger UI.

## // ARCHITECTURE

Two components, clean separation:

1. **GPU Inference Server** — the rendering engine. Receives generation requests via HTTP, queues jobs, loads the Z-Image-Turbo model into VRAM, runs diffusion inference, and dispatches the rendered image back to the caller's webhook URL. Immediate 202 Accepted response, async delivery on completion.
2. **optic-cli** — a lightweight Go client that abstracts the async flow for agents. Spins up an ephemeral webhook receiver, dispatches the prompt, blocks until the image downloads, then exits. One command, one image.

### Async Webhook Flow

The entire API is designed around non-blocking execution:

1. Client POSTs a generation request with `webhook_url`, `prompt`, `aspect_ratio`, and `output_format`.
2. Server responds immediately with `202 Accepted` and a `job_id`.
3. GPU renders the image in the background (typically 5-10 seconds).
4. Background worker POSTs the result to the client's `webhook_url` — either a success payload with `image_url`, or a failure payload with `error_code` and `error_hint`.

### Supported Resolutions

| Aspect Ratio | Resolution |
|---|---|
| 16:9 | 1280×720 |
| 9:16 | 720×1280 |
| 1:1 | 1024×1024 |
| 4:3 | 1024×768 |
| 3:4 | 768×1024 |
| 3:2 | 1200×800 |
| 2:3 | 800×1200 |

Output formats: `png` (default), `webp`, `jpeg`.

## // SURFACE

### HTTP Endpoint

| Endpoint | Purpose |
|---|---|
| `POST /generate` | Async image generation (202 Accepted → webhook callback) |
| `GET /docs` | Interactive Swagger UI |
| `GET /openapi.yaml` | Static OpenAPI spec |

### Request Payload

```json
{
  "webhook_url": "https://your-service.com/api/webhook/receiver",
  "prompt": "A highly detailed cyberpunk server room, glowing neon lights, cinematic",
  "aspect_ratio": "16:9",
  "output_format": "png"
}
```

### CLI

```bash
# Compile
cd cli && go build -o optic-cli main.go

# Generate (blocks until image is downloaded)
./optic-cli --prompt "A massive blackwell GPU cluster, cyberpunk lighting" --aspect 16:9

# Options
./optic-cli --help
```

## // AGENT INTEGRATION

Optic-Spark ships with three reference documents for autonomous agent consumption:

- **`skill.md`** — API agent skill guide. Step-by-step execution flow for orchestrating async webhook callbacks and Z-Image-Turbo prompting rules.
- **`cli/skill.md`** — CLI agent skill guide. Instructions for using `optic-cli` to generate images synchronously without handling webhooks.
- **`llms.txt`** — Compact API reference. Minimal context-window-friendly summary of the endpoint schema and webhook contract.

The Go CLI is the recommended path for agents — it eliminates the webhook choreography entirely. One command, one image, zero async plumbing.

## // PROMPTING (Z-Image-Turbo)

Z-Image-Turbo uses detailed positive prompts only (no negative prompts). Effective prompts follow this structure:

`[Subject] + [Appearance] + [Environment] + [Lighting] + [Mood] + [Style] + [Constraints]`

- 80-250 words for best results
- Encode all constraints in the positive prompt (e.g., "plain background, no text, no watermark, no logos")
- Photorealistic style is the model's native strength
- Cyberpunk, sci-fi, and tech aesthetics render exceptionally well

## // STATUS

Optic-Spark is production-deployed on a dedicated NVIDIA DGX Spark unit. Actively used as the image generation layer in the Nyx agent runtime, powering hero image generation for project pages and visual content creation.

### Current Deployment

| Metric | Value |
|---|---|
| Model | Z-Image-Turbo (GGUF, Q4_K_M 4-bit) |
| Hardware | NVIDIA DGX Spark (Grace-Blackwell GB10) |
| SM Arch | 12.1a |
| Inference | Sub-10 seconds per image |
| API | FastAPI (async webhook) |
| CLI | Go binary (`optic-cli`) |
| Endpoint | HTTP REST + Swagger UI |
| Formats | PNG, WebP, JPEG |

### Active Development

The current lane focuses on:
- Expanding aspect ratio support
- Refining prompt engineering guidelines
- Tightening the agent skill documentation
- Exploring multi-image batch generation

## // DEPLOY

```bash
# Clone and build
git clone https://github.com/netlooker/optic-spark.git
cd optic-spark
docker compose up -d --build

# The init-container automatically downloads the required GGUF models
# before booting the API server.

# CLI (optional)
cd cli && go build -o optic-cli main.go
./optic-cli --api http://your-dgx:7070 --prompt "your prompt here"
```

Point the Docker Compose at your DGX Spark machine, and the grid starts rendering. No manual model management — the init-container handles everything.
