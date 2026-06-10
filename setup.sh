#!/bin/bash

# setup.sh
# Responsibilities:
# 1. Check Docker.
# 2. Check Docker Compose.
# 3. Check Node installation.
# 4. Create .env if missing.
# 5. Create database/qdrant_data, storage/primary_user if missing.
# 6. Execute docker compose up --build

echo "Checking prerequisites..."

if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install it."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null
then
    echo "Docker Compose could not be found. Please install it."
    exit 1
fi

if ! command -v node &> /dev/null
then
    echo "Node could not be found. Please install it."
    exit 1
fi

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Creating necessary directories..."
mkdir -p database/qdrant_data
mkdir -p storage/primary_user

echo "Starting Docker Compose..."
docker compose up --build
