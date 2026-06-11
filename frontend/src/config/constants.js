export const MODELS_CONFIG = {
  embeddingModels: [
    { value: 'bge-small-v1.5', label: 'BGE Small v1.5' },
    { value: 'openai-text-embed-3', label: 'OpenAI Text-Embed-3' },
    { value: 'nvidia-nemotron', label: 'NVIDIA Nemotron' }
  ],
  languageModels: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' }
  ],
  rerankers: [
    { value: 'bge-reranker-base', label: 'BGE Reranker Base' },
    { value: 'cohere-rerank', label: 'Cohere Rerank' }
  ]
};
