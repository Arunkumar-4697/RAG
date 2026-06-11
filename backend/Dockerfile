FROM python:3.12-slim

WORKDIR /app

# Install build dependencies in case some packages need to compile from source
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Use CPU-only PyTorch index to prevent massive 2.5GB CUDA downloads causing OOM/Disk Full errors on small servers
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
RUN python -m nltk.downloader punkt punkt_tab

COPY preload_models.py .
ARG HF_TOKEN
ARG EMBEDDING_MODEL
ARG RERANKER_MODEL

ENV HF_TOKEN=${HF_TOKEN}
ENV EMBEDDING_MODEL=${EMBEDDING_MODEL}
ENV RERANKER_MODEL=${RERANKER_MODEL}
RUN python preload_models.py

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
