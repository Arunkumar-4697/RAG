FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
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
