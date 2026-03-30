+++
title = "// OPERATION: TURBOQUANT — Deploy vLLM on DGX Spark"
date = "2026-03-30T12:00:00+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/operation-turboquant-dgx.jpg"
tags = ["ai", "llm", "nvidia", "vllm", "quantization", "self-hosted"]
keywords = ["turboquant", "vllm", "dgx spark", "grace blackwell", "kv cache compression", "qwen", "256k context", "aarch64", "cuda 13"]
description = "Compress the KV cache to 3.5 bits and run a 35B-parameter model with a 256K context window on a single DGX Spark. A step-by-step build guide for the GB10 platform."
showFullContent = false
readingTime = true
hideComments = false
+++

## // TARGET: NVIDIA DGX SPARK (GRACE BLACKWELL / GB10)
**OBJECTIVE:** FULL 35B MODEL, 256K CONTEXT, SINGLE MACHINE
**TECH:** vLLM + TurboQuant KV Cache Compression

The memory wall is real. Running a 35B-parameter model at 256K context normally demands hardware that costs more than a small house. TurboQuant punches through that wall by compressing the KV Cache — the model's working memory — down to **3.5 bits per value**. The result: a model that would otherwise choke fits cleanly on a single DGX Spark.

This is a build-from-source guide. No shortcuts, no prebuilt wheels — the GB10 Blackwell architecture requires it. Follow the steps in order.

---

## // PREREQUISITES

- **Hardware**: NVIDIA DGX Spark (Grace Blackwell, GB10 SoC)
- **OS**: Ubuntu 22.04+ (aarch64)
- **Drivers**: CUDA 13.0+ installed and functional

Verify before starting:

```bash
nvcc --version   # must show 13.x
uname -m         # must show aarch64
```

---

## // STEP 1: Clone the Repository

Pull the source:

```bash
cd ~
git clone https://github.com/netlooker/vllm-turboquant.git
cd vllm-turboquant
```

---

## // STEP 2: Python Environment

Use `uv` — it resolves and installs dependencies an order of magnitude faster than standard `pip`, which matters here given the size of what we're installing.

**Install uv:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

**Create an isolated virtual environment:**

```bash
uv venv --python 3.12 ~/.venvs/vllm-tq
source ~/.venvs/vllm-tq/bin/activate
```

---

## // STEP 3: Install Dependencies

The Blackwell architecture requires specific PyTorch builds against CUDA 13. Use the exact versions below — mixing builds will silently corrupt the stack.

**PyTorch for CUDA 13:**

```bash
uv pip install torch==2.10.0 torchaudio==2.10.0 torchvision==0.25.0 \
  --index-url https://download.pytorch.org/whl/cu130
```

**Build toolchain:**

```bash
uv pip install "setuptools>=78" setuptools-scm wheel cmake ninja packaging
```

---

## // STEP 4: Build vLLM from Source

This is where most guides fail — prebuilt vLLM wheels don't exist for GB10 yet. We build from source with the `VLLM_USE_PRECOMPILED=1` flag, which pulls precompiled CUDA kernels for the inner loops while building the Python layer locally. It's the fastest path that actually works.

```bash
export CUDA_HOME=/usr/local/cuda
export TORCH_CUDA_ARCH_LIST="12.0"
export MAX_JOBS=4
export VLLM_TARGET_DEVICE=cuda
export VLLM_VERSION_OVERRIDE="0.18.1+turboquant"

VLLM_USE_PRECOMPILED=1 uv pip install --no-build-isolation -e .
```

> `MAX_JOBS=4` prevents the build from spawning too many parallel compiler processes. On a memory-constrained build environment this avoids OOM kills mid-compile.

---

## // STEP 5: Prepare the Model and Calibration Metadata

TurboQuant needs a calibration map to know how to compress each layer's KV cache. This is a one-time step per model.

**Locate your downloaded model snapshot** (download via `huggingface-cli` if you haven't already):

```bash
MODEL_PATH=~/.cache/huggingface/hub/models--cyankiwi--Qwen3.5-35B-A3B-AWQ-8bit/snapshots/YOUR_SNAPSHOT_ID
```

Replace `YOUR_SNAPSHOT_ID` with the actual hash — use `ls` on the `snapshots/` directory if unsure.

**Generate the calibration metadata:**

```bash
python3 calibration/generate_quick_metadata.py \
  --model "$MODEL_PATH" \
  --kv-cache-dtype turboquant35 \
  --output calibration/turboquant_kv.json
```

This runs a short calibration pass over the model and writes the compression map to `turboquant_kv.json`. The "quick" variant takes a few minutes; a full calibration pass is more accurate but optional for most workloads.

---

## // STEP 6: Launch the Engine

```bash
bash scripts/start_vllm_turboquant.sh
```

The launch script sets the engine flags — `--kv-cache-dtype turboquant35`, the metadata path, GPU memory utilization, and the API port. Review it before the first run so you understand what it's tuning.

---

## // STEP 7: Send a Test Request

Open a second terminal and probe the endpoint:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-35b",
    "messages": [{"role":"user","content":"Hello DGX Spark! Who are you?"}],
    "max_tokens": 100
  }'
```

A clean response means the engine loaded the model, the KV cache compression is active, and the API is serving requests.

---

## // TROUBLESHOOTING

| Symptom | Fix |
|---|---|
| `CUDA out of memory` | Lower `--gpu-memory-utilization` in the launch script (try `0.85`) |
| Version mismatch errors on start | Check you're in the venv: `source ~/.venvs/vllm-tq/bin/activate` |
| Model download fails / hangs | Check `/etc/resolv.conf` — the DGX Spark's DNS config can be misconfigured out of the box |
| Build fails mid-compile | Reduce `MAX_JOBS` to `2` and retry |

---

## // WHAT YOU JUST DID

At 3.5 bits per KV cache value, TurboQuant stores roughly **4.5× more context** per gigabyte of memory than a standard FP16 cache. That's what enables 256K context on a single machine instead of a multi-GPU cluster — not magic, just aggressive, calibrated compression at the layer that bottlenecks large-context inference.

The GB10 SoC's unified memory architecture is well-suited to this workload. The model stays resident; the cache breathes.

---

*(C) 2026 NETLOOKER\_OS // END OF FILE*
