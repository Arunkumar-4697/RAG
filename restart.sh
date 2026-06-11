#!/bin/bash

# Exit on any error
set -e

echo "🛑 Stopping and removing existing containers..."
# We run `down` WITHOUT `-v` to ensure host volumes (like Qdrant data and User Storage) are NEVER deleted.
docker compose down

echo "🧹 Clearing old cached images to force a fresh install..."
# Remove the old built images. We ignore errors here in case they are already deleted.
docker rmi rag-frontend rag-backend 2>/dev/null || true

echo "🏗️  Rebuilding frontend and backend containers from scratch (no-cache)..."
docker compose build --no-cache

echo "🚀 Starting new containers in the background..."
docker compose up -d

echo ""
echo "✅ Restart complete!"
echo "💾 Don't worry! Your Qdrant data and File Storage are mapped to your local filesystem and have been fully preserved."
echo "You can check the logs anytime with: docker compose logs -f"
