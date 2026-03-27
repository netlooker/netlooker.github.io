+++
title = "The Ultimate Local AI Setup for Apple Silicon"
date = "2026-03-19T00:00:00+00:00"
author = "Netlooker"
authorTwitter = ""
cover = "/img/local-ai-apple-silicon.jpg"
tags = ["ai", "macos", "llm", "apple-silicon"]
keywords = ["local llm", "apple silicon", "llama.cpp", "qwen", "hugging face", "macos ai", "private ai"]
description = "Run a fully private, blazing-fast LLM on your Mac using llama.cpp, Hugging Face CLI, and Qwen Code — no cloud, no subscriptions, just raw Apple Silicon."
showFullContent = false
readingTime = true
hideComments = false
+++

## 1. Get the Tools

Alright mates, let's get our environment sorted. We will use Homebrew to install the Hugging Face CLI (`hf`), the `llama.cpp` engine, and the `qwen-code` terminal agent. Run this command and let your Mac do the heavy lifting:

```bash
brew install hf llama.cpp qwen-code
```

## 2. Download the Models to the Cache

Instead of cluttering your project folders, we will use the `hf` tool to download the models securely into a hidden central cache on your Mac. Run these two commands:

```bash
hf download unsloth/Qwen3.5-9B-GGUF Qwen3.5-9B-UD-Q4_K_XL.gguf
hf download unsloth/Qwen3.5-9B-GGUF mmproj-F16.gguf
```

When they finish downloading, your terminal will print out a long path showing exactly where it stored the files (usually looking something like `/Users/your_username/.cache/huggingface/hub/...`). Copy those long paths, because you need them for the next step!

> **A quick tip for your RAM:** I chose the 9B `Q4_K_XL` version because it fits perfectly on a 36GB Mac. If you have 16GB or 18GB of RAM, no worries! Try changing the filename in the download command to a smaller compressed version from the [9B repository](https://huggingface.co/unsloth/Qwen3.5-9B-GGUF) or even test the much smaller [4B version](https://huggingface.co/unsloth/Qwen3.5-4B-GGUF) to avoid slowing down your machine. Experiment with different model sizes and context window limits (`-c`) to see what runs best on your hardware.

## 3. Start the Server

Time to push your GPU. We are going to run the `llama-server` command. You will need to swap out the placeholder paths below with the actual long paths you copied in Step 2.

I have set up these exact flags to squeeze every drop of memory bandwidth out of your Mac's chip:

```bash
llama-server \
  -m /path/to/your/copied/Qwen3.5-9B-UD-Q4_K_XL.gguf \
  --mmproj /path/to/your/copied/Qwen3.5-9B-UD-mmproj-f16.gguf \
  --ctx-size 32768 \
  --n-gpu-layers 99 \
  --flash-attn on \
  --cache-type-k q8_0 \
  --cache-type-v q8_0 \
  --batch-size 512 \
  --threads 6 \
  --prio 2 \
  --port 8080
```

> **Important:** Keep this terminal open. Your server is now humming along in the background.

## 4. The Browser Plot Twist

Here is a fun trick. You might think your server is just a hidden background process waiting for code. But if you open your web browser and go to **`http://localhost:8080`**, you get a fully private chat interface built right into the system!

It gets better. Because we added the `mmproj` vision file, you can drag and drop images or even PDFs directly into the chat. The system processes PDFs as images incredibly fast, meaning you can ask the AI to extract data or explain diagrams for you. If you want to read the deep lore on how this brilliant UI works, check out the [llama.cpp developer discussion](https://github.com/ggml-org/llama.cpp/discussions/16938).

## 5. Setting up Qwen Code

But what if you want a taste of agentic engineering? What if you want a local alternative to Claude Code that runs entirely on your own machine? Bam. Enter Qwen Code.

By default, most coding tools try to connect to cloud servers. We need to point `qwen-code` to your new local setup. Open your settings file (usually located at `~/.qwen/settings.json`) and add this configuration:

```json
{
  "modelProviders": {
    "openai": {
      "baseUrl": "http://localhost:8080/v1",
      "apiKey": "local-key",
      "models": ["qwen"]
    }
  },
  "defaultModel": "openai/qwen"
}
```

Quick alternative: if you want to test it right now without editing any files, just set these variables when you start the programme:

```bash
OPENAI_BASE_URL="http://localhost:8080/v1" OPENAI_API_KEY="local" OPENAI_MODEL="qwen" qwen
```

## 6. Get to Hacking

Open a new terminal window in your project folder and wake up your local AI agent:

```bash
qwen
```

You are in. Use the `@` symbol to tag local files, share software diagrams, and let it write code for you. It all runs privately and super fast on your own Apple Silicon. Happy hacking!
