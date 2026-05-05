# Contributing to The Loading Screen

First off, thank you for being part of the "buffer" that makes this event great!

## How to Contribute

### 1. Development Process
1. **Create a Branch:** Always work on a separate branch (`git checkout -b feature/your-feature`).
2. **Naming Convention:** Use English for all code entities and Git messages.
3. **Local Testing:** Verify your changes locally using Docker to simulate the Cloud Run environment.

### 2. Pull Requests (PRs)
* All PRs must be written in English.
* Ensure CI/CD checks (GitHub Actions) pass before requesting a review.
* At least one approval is required to merge into `main`.

### 3. Deployment
* Merges to `main` trigger an automated deployment to **Google Cloud Run**.
* Ensure your `Dockerfile` exposes the correct port and handles SIGTERM signals for graceful shutdowns.

---
*Stay calm and keep loading.*
