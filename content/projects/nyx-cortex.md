+++
title = "Nyx Cortex"
date = "2026-03-29T00:00:00+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/project-nyx-cortex-v2.jpg"
tags = ["ai", "docker", "nix", "self-hosted", "telegram"]
keywords = ["self-hosted ai", "openclaw", "nix docker", "local llm", "sovereign agent"]
description = "A self-sovereign AI cortex — runs on your silicon, answers only to you, corporate grid has no reach."
status = "STABLE"
link = "https://github.com/netlooker/nyx"
uid = "PX-2026-001"
showFullContent = false
readingTime = true
hideComments = false
+++

Nyx is a self-sovereign AI cortex. Clone it, configure it, bake it, run it — four moves and your agent is live on your own hardware. OpenClaw handles the intelligence layer, Telegram handles the uplink, and Nix handles the build: every binary in the image is pinned to a cryptographic hash so the toolchain is identical on every machine, every time. No subscriptions. No cloud dependency. No data exfiltration. The corporate grid has no reach here.

## // TECH STACK

- **OpenClaw** — the AI agent daemon, runs inside the container, exposes a gateway on `:18789`
- **qwen-coder** — local code-focused model, wired into OpenClaw for inference tasks
- **Nix flakes** — deterministic build system; pins every dependency to a hash via `flake.lock`
- **Docker multi-stage build** — Stage 1 compiles the Nix toolchain inside a `nixos/nix` container; Stage 2 drops it into a clean Debian image
- **Telegram Bot API** — primary uplink channel; `dmPolicy: pairing` means nobody talks to the agent without your explicit approval
- **just** — task runner wrapping all docker-compose and build commands into single-word ops
- **age** — encryption for secrets at rest

## // ARCHITECTURE

The build is two-stage. Stage 1 spins a `nixos/nix` container inside Docker and compiles the full toolchain — Node.js, Python, gcc, gh CLI, ripgrep, and the rest — with every package pinned by `flake.lock`. Docker caches this layer aggressively; it only reruns when the Nix config changes. Stage 2 takes that compiled toolchain, drops it into a minimal Debian base, and installs OpenClaw and qwen-coder on top. The result is `nyx-cortex:latest`.

At runtime, two volumes bridge your Mac to the container: `secrets/` mounts into `/config` (OpenClaw watches it live — edit on your Mac, the agent reloads in seconds, no restart), and `data/` mounts into `/data` where all agent state lives — sessions, workspace files, gh auth tokens, agent sandboxes. The container is disposable. The data is not.

Updates follow a strict three-layer hierarchy: config changes hot-reload instantly, OpenClaw/qwen-coder upgrades hit only Stage 2 (fast, cache hit on Stage 1), and Nix toolchain updates bump `flake.lock` and trigger a full Stage 1 recompile. Even `just rebuild` — scorched earth, no cache — leaves `/data` untouched.

## // STATUS

Cortex is stable and in daily use. OpenClaw gateway runs on `:18789` with optional LAN-accessible dashboard. Telegram pairing is operational; WhatsApp uplink is supported. Local inference via any OpenAI-compatible endpoint (Ollama, llama.cpp) wires in through the config. Multi-architecture builds confirmed on `aarch64-darwin` (Apple Silicon) and `x86_64-linux`.

What's next: tighter bubblewrap sandboxing on Linux for agent subprocesses, SBOM verification hooks in CI, and an optional WhatsApp-first config template.

## // DEPLOY

```bash
# Install Nix (once)
curl -sSfL https://artifacts.nixos.org/nix-installer | sh -s -- install

# Clone and enter dev shell
git clone https://github.com/netlooker/nyx.git
cd nyx
nix develop

# Configure
cp secrets/openclaw.json5.example secrets/openclaw.json5
$EDITOR secrets/openclaw.json5

# Bake and boot
just build
just up
just logs
```

```bash
just restart   # swap container, keep data
just rebuild   # scorched earth — still keeps /data
```

One command to build, one to run — the cortex either works or it tells you exactly why it doesn't.
