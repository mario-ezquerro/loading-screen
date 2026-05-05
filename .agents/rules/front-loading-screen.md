---
trigger: always_on
---

# Project Rules & Standards: The Loading Screen

## 1. Universal Language Policy
* **English-Only Codebase:** All technical assets must be in **English**. This is non-negotiable.
    * Variables, functions, classes, and database schemas.
    * Inline comments, Docstrings, and Git commit messages.
    * Documentation (README, RULES, CONTRIBUTING).
* **UI Language:** All text visible to the end-user (Mobile and Stage views) must be in English.

## 2. Technical Architecture (Cloud Run)
* **Statelessness:** The application must be 100% stateless. No local file storage is allowed. Use Cloud Storage or Firestore for persistence.
* **Port Configuration:** The service must bind to the `$PORT` environment variable (defaulting to 8080).
* **Containerization:** A `Dockerfile` must be present. Keep images lightweight (use alpine or slim versions) to minimize "Cold Start" latency.
* **Concurrency:** Ensure the backend can handle multiple simultaneous connections for real-time updates.

## 3. Git Workflow & Rules
* **Branching:** Use a feature-branch workflow. Merge to `main` only via Pull Requests (PRs).
* **Conventional Commits:** All commits must follow the specification:
    * `feat:` New features (e.g., the QR generator).
    * `fix:` Bug fixes.
    * `docs:` Changes to documentation.
    * `refactor:` Code changes that neither fix a bug nor add a feature.
* **PR Reviews:** Every PR requires at least one approval and must pass CI/CD automated tests.

## 4. Frontend & Interaction Requirements
* **The Stage View (Main Screen):**
    * Must feature a **QR Code** that encodes the URL for the mobile interface.
    * Must include a **Transparent Chat Overlay** zone.
    * Real-time updates are mandatory (WebSockets or Real-time DB listeners).
* **The Mobile View (User Input):**
    * Responsive design for smartphone browsers.
    * Single input field for "Name/Message".
    * **Strict Constraint:** Maximum length of **25 characters**.
    * Input sanitization is required on both client and server sides.

## 5. Deployment Workflow
* All merges to the `main` branch trigger an automated build and deploy to **Google Cloud Run** via GitHub Actions.
* Environment variables (Secrets) must be managed through the Google Cloud Console, never hardcoded.

---
*Status: 99% Loaded... Ready for Execution.*
