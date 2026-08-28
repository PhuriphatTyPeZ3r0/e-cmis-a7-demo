#!/bin/bash
# deploy_agent_service.sh
# Deployment script for E-CMIS Express Agent Service to Google Cloud Run.

# Exit immediately if a command exits with a non-zero status
set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
REGION="asia-southeast1"
SERVICE_NAME="ecmis-agent-service"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "=== E-CMIS Agent Service Deployment ==="
echo "GCP Project: ${PROJECT_ID}"
echo "Region:      ${REGION}"
echo "Service:     ${SERVICE_NAME}"
echo "Image:       ${IMAGE_TAG}"
echo "======================================"

# Step 1: Set GCP Project
echo "Setting GCP Project configuration..."
gcloud config set project "${PROJECT_ID}"

# Step 2: Build container using Google Cloud Build
echo "Submitting build to Google Cloud Build..."
# Note: Executed from the ecmis-agent-service directory
gcloud builds submit --tag "${IMAGE_TAG}" ./ecmis-agent-service

# Step 3: Deploy to Google Cloud Run
echo "Deploying container to Google Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080" \
  --min-instances=0 \
  --max-instances=5 \
  --memory=512Mi

echo "=== Deployment Completed Successfully ==="
gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format="value(status.url)"
