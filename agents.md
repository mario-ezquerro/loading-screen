# Agents & Technology Stack

> Complete reference for the AI agents, coding standards, and technologies powering **The Loading Screen**.

---

## Table of Contents

1. [AI Agents](#ai-agents)
   - [Code Guide Agent](#1-code-guide-agent)
   - [Frontend Loading Screen Agent](#2-frontend-loading-screen-agent)
2. [Technology Stack](#technology-stack)
   - [Runtime & Backend](#runtime--backend)
   - [Frontend](#frontend)
   - [Real-Time Communication](#real-time-communication)
   - [Containerization & Deployment](#containerization--deployment)
   - [CI/CD Pipeline](#cicd-pipeline)
   - [External CDN Libraries](#external-cdn-libraries)
   - [Browser APIs](#browser-apis)
3. [Project Architecture](#project-architecture)
4. [File Map](#file-map)

---

## AI Agents

Two always-on agent rule sets live under `.agents/rules/` and govern all AI-assisted development on this repository.

### 1. Code Guide Agent

**File:** `.agents/rules/code-guide.md`  
**Trigger:** `always_on`  
**Scope:** General codebase standards and repository hygiene.

| Area | Rule |
|------|------|
| **Language Policy** | All code, comments, docstrings, commit messages, PR titles, and documentation must be in **English**. Internal discussions may be in Spanish; public-facing assets must not. |
| **Git Branching** | Feature-branch workflow. Never commit directly to `main`. Naming convention: `feature/description`, `fix/issue-id`, `refactor/component`. |
| **Conventional Commits** | `feat:` new features · `fix:` bug fixes · `docs:` documentation only · `chore:` maintenance & dependencies. |
| **Statelessness** | The application must be stateless. Use Cloud Storage or Firestore for any persistence needs. |
| **Port Mapping** | The server **must** listen on the `$PORT` environment variable (default `8080`). |
| **Containerization** | A clean, lightweight `Dockerfile` is mandatory. Minimize image size to reduce Cloud Run cold start times. |

---

### 2. Frontend Loading Screen Agent

**File:** `.agents/rules/front-loading-screen.md`  
**Trigger:** `always_on`  
**Scope:** Frontend behavior, interaction design, and deployment workflow.

| Area | Rule |
|------|------|
| **English-Only Codebase** | All technical assets (variables, functions, classes, schemas, comments, commits, docs) and **all user-facing UI text** must be in English. |
| **Statelessness** | 100% stateless. No local file storage. Use Cloud Storage or Firestore for persistence. |
| **Port Configuration** | Bind to `$PORT` (default `8080`). |
| **Containerization** | Use `alpine` or `slim` base images to minimize cold start latency. |
| **Concurrency** | The backend must handle multiple simultaneous WebSocket connections for real-time updates. |
| **Git Workflow** | Feature-branch workflow. Merge to `main` only via PRs. Every PR requires ≥1 approval and must pass CI/CD tests. |
| **Conventional Commits** | Same spec as Code Guide: `feat:`, `fix:`, `docs:`, `refactor:`. |
| **Stage View** | Must include a dynamic QR Code, a transparent chat overlay zone, and real-time WebSocket updates. |
| **Mobile View** | Responsive smartphone design. Single input field for "Name/Message" with a **strict 25-character limit**. Input sanitization on both client and server. |
| **Deployment** | Merges to `main` auto-trigger build & deploy to Google Cloud Run via GitHub Actions. Secrets managed via GCP Console, never hardcoded. |

---

## Technology Stack

### Runtime & Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | `>= 20.0.0` | Server runtime (specified in `engines` field of `package.json`). |
| **Express** | `^4.19.0` | HTTP server, static file serving, REST API (`/health`, `/api/tracks`). |
| **Socket.io** | `^4.7.0` | WebSocket server for real-time bidirectional communication. |
| **`node:fs`** | built-in | Dynamic audio track listing from the filesystem. |
| **`node:path`** | built-in | Cross-platform path resolution for static assets. |
| **`node:http`** | built-in | HTTP server creation (required by Socket.io). |

### Frontend

| Technology | Purpose |
|------------|---------|
| **Vanilla HTML5** | Semantic structure for Stage View (`index.html`) and Mobile View (`mobile.html`). |
| **Vanilla CSS3** | Premium dark-mode design system with CSS custom properties, glassmorphism, gradients, and keyframe animations. |
| **Vanilla JavaScript (ES6+)** | All client-side logic — canvas rendering, WebSocket events, DOM manipulation. No framework. |
| **HTML5 Canvas API** | Full-screen procedural rendering of the circuit board background, perspective path, portal door, and Muggle sprites. |
| **HTML5 Audio API** | Dynamic 8-bit orchestral music playlist with auto-advancement on track end. |
| **Google Fonts** | `Press Start 2P` (retro pixel font for Stage View) and `Inter` (modern sans-serif for UI). |

### Real-Time Communication

| Component | Detail |
|-----------|--------|
| **Protocol** | WebSockets via Socket.io |
| **Events (Client → Server)** | `launch_muggle` — carries `{ message: string }` |
| **Events (Server → All Clients)** | `muggle_spawned` — carries `{ id, message, timestamp }` |
| **CORS** | Configured with `origin: '*'` for development flexibility. |

### Containerization & Deployment

| Technology | Detail |
|------------|--------|
| **Docker** | Multi-stage-ready `Dockerfile` using `node:20-alpine` base image. |
| **Google Cloud Run** | Stateless, auto-scaling container hosting. Binds to `$PORT`. |
| **Google Container Registry (GCR)** | Docker image storage (`gcr.io/<PROJECT_ID>/loading-screen:<SHA>`). |

### CI/CD Pipeline

| Technology | Detail |
|------------|--------|
| **GitHub Actions** | Automated build & deploy on push to `main` (`.github/workflows/deploy.yml`). |
| **`actions/checkout@v4`** | Code checkout. |
| **`google-github-actions/auth@v2`** | GCP authentication via service account key (`GCP_SA_KEY` secret). |
| **`google-github-actions/setup-gcloud@v2`** | Cloud SDK setup. |
| **`google-github-actions/deploy-cloudrun@v2`** | Cloud Run deployment. |
| **Secrets** | `GCP_SA_KEY` (service account JSON), `GCP_PROJECT_ID` (`fiware-api`). |
| **Region** | `us-central1` (configurable in workflow `env`). |
| **Service Name** | `loading-screen` |
| **Live URL** | `https://loading-screen-xkhf2gu6ka-uc.a.run.app` |

### External CDN Libraries

| Library | CDN | Purpose |
|---------|-----|---------|
| **qrcode.js** | `cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js` | Client-side QR code generation rendered to canvas. |
| **Socket.io Client** | Served automatically by the Socket.io server at `/socket.io/socket.io.js`. | WebSocket client. |

### Browser APIs

| API | Used In | Purpose |
|-----|---------|---------|
| **DeviceMotion API** | `mobile.js` | Detects phone shaking to trigger Muggle launch. Requires explicit permission on iOS 13+. |
| **Vibration API** | `mobile.js` | Haptic feedback (`navigator.vibrate`) on successful launch. |
| **Canvas 2D API** | `stage.js` | Full rendering pipeline: background, perspective grid, portal, Muggle sprites with hue-shift. |
| **Web Audio (HTMLAudioElement)** | `stage.js` | Background music playback and playlist rotation. |
| **Fetch API** | `stage.js` | Loads available audio tracks from `/api/tracks`. |

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Cloud Run                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Node.js 20 (Alpine)                      │  │
│  │                                                       │  │
│  │  ┌─────────────┐     ┌──────────────────────────┐    │  │
│  │  │  Express.js  │────▶│  Static Files (public/)   │    │  │
│  │  │  HTTP Server │     │  ├── index.html (Stage)   │    │  │
│  │  │              │     │  ├── mobile.html (Mobile)  │    │  │
│  │  │  /health     │     │  ├── css/style.css         │    │  │
│  │  │  /api/tracks │     │  ├── js/stage.js           │    │  │
│  │  └──────┬───────┘     │  ├── js/mobile.js          │    │  │
│  │         │             │  ├── images/ (sprites)     │    │  │
│  │  ┌──────▼───────┐     │  └── audio/ (tracks)      │    │  │
│  │  │  Socket.io   │     └──────────────────────────┘    │  │
│  │  │  WebSocket   │                                     │  │
│  │  │  Server      │◀──── launch_muggle ────┐            │  │
│  │  │              │                         │            │  │
│  │  │              │──── muggle_spawned ──▶  │            │  │
│  │  └──────────────┘                         │            │  │
│  └───────────────────────────────────────────┼────────────┘  │
└──────────────────────────────────────────────┼───────────────┘
                                               │
                         ┌─────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Mobile Browsers   │
              │   (Audience Phones) │
              │                     │
              │  📱 Shake / Tap     │
              │  → launch_muggle    │
              └─────────────────────┘
```

### Data Flow

1. **Stage View** loads → connects via WebSocket → generates QR code pointing to `/mobile.html`.
2. **Audience member** scans QR → opens Mobile View → types a message (≤25 chars).
3. **User taps "Ready to Launch"** → iOS requests DeviceMotion permission → shake listener activated.
4. **Phone shake detected** (or manual tap fallback) → `launch_muggle` event emitted via WebSocket.
5. **Server** receives event → broadcasts `muggle_spawned` to all connected clients.
6. **Stage View** receives `muggle_spawned` → spawns a hue-shifted pixel-art Muggle that marches toward the I/O portal with a 3D perspective shrinking effect.

---

## File Map

```
loading-screen/
├── .agents/
│   └── rules/
│       ├── code-guide.md              # General coding standards agent
│       └── front-loading-screen.md    # Frontend & interaction rules agent
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md              # Bug report template
│   │   ├── custom.md                  # Custom issue template
│   │   └── feature_request.md         # Feature request template
│   └── workflows/
│       └── deploy.yml                 # CI/CD: Build → Push → Deploy to Cloud Run
├── public/
│   ├── audio/                         # Epic 8-bit orchestral tracks (.mp3, .wav)
│   ├── css/
│   │   └── style.css                  # Design system (dark mode, glassmorphism, animations)
│   ├── images/
│   │   ├── muggle-01..05.*            # Pixel-art Muggle sprites
│   │   ├── screem-01.jpg              # Splash screen artwork
│   │   └── the-loading-screen-01.jpg  # Project branding image
│   ├── js/
│   │   ├── stage.js                   # Canvas rendering, Muggle logic, music playlist
│   │   └── mobile.js                  # Input handling, shake detection, WebSocket launch
│   ├── index.html                     # Stage View (projector / main screen)
│   └── mobile.html                    # Mobile View (audience phone interface)
├── Dockerfile                         # node:20-alpine container for Cloud Run
├── package.json                       # Dependencies: express, socket.io
├── server.js                          # Entry point: Express + Socket.io server
├── README.md                          # Project overview & setup instructions
├── TECHNICAL_BRIEF.md                 # Detailed technical specification
├── CONTRIBUTING.md                    # Contribution guidelines
├── CODE_OF_CONDUCT.md                 # Community standards
├── SECURITY.md                        # Security policy
└── LICENSE                            # Project license
```

---

*Status: 100% Documented. All systems nominal.* 🚀
