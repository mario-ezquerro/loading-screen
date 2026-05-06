# Technical Brief: Project "The Loading Screen" (Final Version)

## 1. Project Overview
The Loading Screen is an interactive, real-time web application for pre-event entertainment. It is a web-only experience (no native app install required) hosted on Google Cloud Run. The architecture is strictly stateless; the server coordinates real-time events without a persistent database.

## 2. Audio & Visual Environment
* **Epic Soundtrack:** The Stage View must play a continuous loop of epic orchestral music (e.g., Conan the Barbarian or Game of Thrones).
* **Google I/O Aesthetic:** UI must follow Material Design, using clean geometric shapes and the event’s color palette.

## 3. Core Interaction Flow (Web-Based)

### A. Stage View (Main Screen)
* Displays a dynamic QR Code linking to the mobile web interface.
* **The Muggle March:**
  * When a user "launches" a Muggle, it appears on the screen with a 25-character message above its head (Sims-style).
  * Muggles must walk toward a distant vanishing point.
  * **Perspective Logic:** Muggles must dynamically shrink in size as they move further away to create a depth effect.

### B. Mobile Interface (Web App)
* **No-Install Experience:** A lightweight HTML5 page accessed via QR.
* **Input:** Text field for "Message" (capped at 25 characters).
* **Permissions Handling (CRITICAL):** Since it's a web browser, the UI must include a "Ready to Launch" button. This button click is required to request DeviceMotion API permissions (especially for iOS) to access the accelerometer.
* **The Shake Trigger:** Once permission is granted, the user shakes the phone to send their Muggle to the Stage View.

## 4. Technical Requirements
* **Language:** 100% English for code, comments, and documentation.
* **Real-Time:** Use WebSockets (Socket.io) or Firestore Realtime Listeners to sync the shake event instantly with the Stage View.
* **Scaling:** The system must handle high concurrency (hundreds of Muggles walking simultaneously).
* **Cloud Run Configuration:** Bound to `$PORT`. Memory-based coordination (stateless).

> **Note to Antigravity:** Ensure the "Muggle" assets are extremely lightweight (SVG or optimized PNG sprites) to maintain performance on the Stage View as the crowd grows. Don't forget to handle the asynchronous permission request for the motion sensors on the mobile web side.
