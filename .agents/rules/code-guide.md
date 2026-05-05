---
trigger: always_on
---

# Project Rules & Standards: The Loading Screen

## 1. Universal Language Policy
* **Code & Documentation:** All technical assets must be in **English**. This includes:
    * Variable, function, and class names.
    * Inline comments and Docstrings.
    * Commit messages and Pull Request titles/descriptions.
    * Documentation (README, RULES, CONTRIBUTING).
* **Communication:** Internal team discussions may occur in Spanish, but the repository's "public" face is strictly English.

## 2. Git Workflow
* **Branching Strategy:** We use a feature-branch workflow.
    * Never commit directly to `main`.
    * Branch naming convention: `feature/description`, `fix/issue-id`, or `refactor/component`.
* **Conventional Commits:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
    * `feat:` A new feature.
    * `fix:` A bug fix.
    * `docs:` Documentation changes only.
    * `chore:` Maintenance tasks, dependencies, etc.

## 3. Technical Constraints (Cloud Run)
* **Statelessness:** The application must be stateless. Use external services (Cloud Storage, Firestore) for persistence.
* **Port Mapping:** The application MUST listen on the port defined by the `$PORT` environment variable (default 8080).
* **Containerization:** A clean `Dockerfile` is mandatory. Keep images lightweight to reduce cold start times.