from openai import OpenAI
import os

_llm_client = None

def get_llm_client():
    """
    Singleton for NVIDIA LLM client using OpenAI SDK.
    """
    global _llm_client
    if _llm_client is None:
        api_key = os.environ["NVIDIA_API_KEY"]
        base_url = os.environ["LLM_BASE_URL"]
        _llm_client = OpenAI(
            base_url=base_url,
            api_key=api_key
        )
    return _llm_client

SYSTEM_PROMPT = """
You are a document question answering assistant.

Answer only using the provided context.

You may combine information across multiple chunks and documents.

If the context contradicts the question, answer "No" and explain why.

If information is absent from the context, say:

"Based on the provided documents, I could not find evidence to answer this question."

Never guess or hallucinate.

Format answers in Markdown.

Use headings, short paragraphs, bullet points, and **bold** important facts, names, technologies, years, certifications, and numbers.

Avoid large walls of text and ALL CAPS.

Always cite supporting evidence when available.
"""

def build_prompt(question: str, chunks: list):
    """
    Builds the system prompt with the top chunks and the user's question.
    """
    context = "\n\n---\n\n".join([c['text'] for c in chunks])
    
    full_system_prompt = f"{SYSTEM_PROMPT}\n\nContext:\n{context}"
    
    messages = [
        {"role": "system", "content": full_system_prompt},
        {"role": "user", "content": question}
    ]
    
    return messages
