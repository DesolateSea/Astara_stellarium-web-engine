# Setup & Build Guide

This document provides instructions for setting up the development environment and building Stellarium Web Engine. 

**IMPORTANT**: Please do not modify the original source code or build configuration files to fix environment-specific issues. Instead, use the provided Docker-based workflow and Makefile targets described below.

## Table of Contents

- [Recommended Environment (WSL)](#recommended-environment-wsl)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Frontend Commands](#frontend-commands)
- [Engine Commands](#engine-commands)
- [Legacy Compliance](#legacy-compliance)

---

## Recommended Environment (WSL)

For Windows users, it is **highly recommended** to use **Windows Subsystem for Linux (WSL)** (specifically Ubuntu/Debian). 

Native Windows builds often encounter pathing and environment compatibility issues. Using WSL ensures that the build system behaves exactly as it does on Linux.

1.  Install WSL from the Microsoft Store or via command line: `wsl --install`.
2.  Clone the repository **inside** the WSL filesystem (e.g., in `~/projects/`).
3.  Install Docker Desktop on Windows and enable the "WSL 2 based engine" in settings.

---

## Prerequisites

- **Docker**: Required for the containerized build system.
- **Node.js**: (Version 14+ recommended).
- **Python 3**: For data processing scripts.
- **Make**: To run build commands.

---

## Initial Setup

The project uses a containerized build system to ensure all dependencies (Emscripten, SCons, etc.) are version-consistent.

1.  **Navigate to the frontend directory**:
    ```bash
    cd apps/web-frontend
    ```

2.  **Run the automated setup**:
    ```bash
    make setup
    ```
    This command will:
    - Build the `swe-dev` Docker image (Emscripten build environment).
    - Build the `stellarium-web-dev` Docker image (Node.js/Webpack environment).
    - Compile the WebAssembly engine.
    - Install all Node.js dependencies inside the container.

---

## Development Workflow

### 1. Update Engine
If you make changes to the C/C++ source code in `src/`, you need to rebuild the WebAssembly module:

```bash
cd apps/web-frontend
make update-engine        # Release build
# OR
make update-engine-debug  # Debug build with symbols
```

### 2. Run Development Server
To start the Vue.js development server with hot-reloading:

```bash
cd apps/web-frontend
make dev
```
The application will be available at `http://localhost:8080`.

---

## Frontend Commands

All frontend-related tasks are managed via the Makefile in `apps/web-frontend`:

| Command | Description |
|---------|-------------|
| `make setup` | Initial build of all Docker images and dependencies. |
| `make dev` | Starts the development server inside Docker. |
| `make build` | Creates a production build in the `dist/` directory. |
| `make lint` | Runs ESLint to check for code style issues. |
| `make start` | Serves the `dist/` directory locally on port 7070. |

---

## Engine Commands

If you need to trigger engine builds specifically:

| Command | Description |
|---------|-------------|
| `make update-engine` | Compiles the C++ engine to JS/WASM (Release). |
| `make update-engine-debug` | Compiles with debug symbols and assertions. |
| `make gen-es6` | Generates the ES6-compatible WebAssembly module. |

---

## Legacy Compliance

This project utilizes specific build tools that require legacy OpenSSL support in modern Node.js versions (Node 17+).

If you are running commands outside of Docker (locally on your machine), you **must** set the following environment variable:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

The Makefile and Docker setup handle this automatically, so using `make dev` or `make build` is the safest way to avoid these issues.

---

## Warning: No Direct Changes
**Do not modify the original code** in `src/`, `ext_src/`, or the `SConstruct` files just to "get it to compile" on your specific local OS. The Docker-based environment is the source of truth. If a build fails in Docker, please report it as a bug.
