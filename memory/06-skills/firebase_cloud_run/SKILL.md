---
name: firebase-cloud-run
description: Skill for deploying E-CMIS components (Blazor Web App and Express agent service) to Firebase Hosting and Google Cloud Run.
---

# 🚀 Firebase & Cloud Run Deployment Skill

This skill provides step-by-step playbooks, deployment configurations, and automated script templates to deploy the E-CMIS Blazor Web App ([ecmis-web](file:///C:/Users/iznamu/OneDrive%20-%20Panyapiwat%20Institute%20of%20Management/CAI%202nd%20Year%202025/CAI%202.2%202026/PMO1-03-08-2026/E-CMIS/ecmis-web)) and Express agent service ([ecmis-agent-service](file:///C:/Users/iznamu/OneDrive%20-%20Panyapiwat%20Institute%20of%20Management/CAI%202nd%20Year%202025/CAI%202.2%202026/PMO1-03-08-2026/E-CMIS/ecmis-agent-service)) using GCP.

## 📋 When to use this skill
- When preparing production deployments for E-CMIS components.
- When configuring deployment pipelines (GitLab CI, Cloud Build).
- When resolving security and scaling settings for Google Cloud Run services.

## 🏢 Architecture Overview

1. **Frontend (E-CMIS Web):** A .NET Blazor Web App.
   - Option A: Compiled to static WebAssembly files and deployed to **Firebase Hosting** for global, low-latency CDN delivery.
   - Option B: Containerized using a Dockerfile and deployed to **Google Cloud Run** for server-side hosting.
2. **Backend (Agent Service):** A Node.js Express application running agent workflows.
   - Containerized and deployed to **Google Cloud Run** with auto-scaling (0-10 instances) to optimize cost.

## 📖 Playbooks & Guidelines

### 1. Preparing the Backend (Agent Service)
Ensure the container runs on the port specified by the `$PORT` environment variable (default: `8080` in Cloud Run).
Our code uses:
```typescript
const PORT = process.env.PORT || 3001;
```
This is fully compatible since Cloud Run passes `PORT=8080`.

### 2. Google Cloud Run Deployment
Deploy the backend using Google Cloud SDK:
```bash
# 1. Build the container using Cloud Build
gcloud builds submit --tag gcr.io/your-project-id/ecmis-agent-service

# 2. Deploy to Cloud Run with unauthenticated access allowed for public API endpoints
gcloud run deploy ecmis-agent-service \
  --image gcr.io/your-project-id/ecmis-agent-service \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars="OPENAI_API_KEY=your-api-key,PORT=8080"
```

### 3. Firebase Hosting Deployment for Blazor (Static WebAssembly)
If building Blazor as WebAssembly:
1. Publish the project:
   ```bash
   dotnet publish ecmis-web/src/EcmisWeb.csproj -c Release -o release-output
   ```
2. Initialize Firebase in the root:
   ```bash
   firebase init hosting
   ```
   *Choose `release-output/wwwroot` as your public directory and configure as a single-page app (redirect all URLs to `index.html`).*
3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

---
*Created for the E-CMIS Agent Project.*
