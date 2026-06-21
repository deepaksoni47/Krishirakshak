"""
backend/rag/retriever.py
Retrieves the most relevant government scheme documents for a given query.
Uses FAISS similarity search with Google embeddings as primary method,
and falls back to TF-IDF keyword scoring if embeddings are unavailable.
"""
import os
import re
from typing import Optional
from backend.rag.vectorstore import load_vectorstore, get_fallback_docs


# ---------------------------------------------------------------------------
# Primary Retriever: FAISS Semantic Search
# ---------------------------------------------------------------------------
def retrieve_schemes_semantic(query: str, k: int = 4) -> list[dict]:
    """
    Retrieve top-k relevant scheme documents using FAISS similarity search.
    Returns list of dicts with scheme_name, scheme_type, content, score.
    """
    vectorstore, ok = load_vectorstore()
    if not ok or vectorstore is None:
        return []

    try:
        results = vectorstore.similarity_search_with_score(query, k=k)
        output = []
        for doc, score in results:
            output.append({
                "scheme_id":   doc.metadata.get("scheme_id", "Unknown"),
                "scheme_name": doc.metadata.get("scheme_name", "Unknown Scheme"),
                "scheme_type": doc.metadata.get("scheme_type", "Government Scheme"),
                "content":     doc.page_content,
                "relevance_score": round(float(score), 4),
            })
        return output
    except Exception as e:
        print(f"[RAG] Semantic retrieval failed: {e}")
        return []


# ---------------------------------------------------------------------------
# Fallback Retriever: TF-IDF Keyword Scoring
# ---------------------------------------------------------------------------
def _keyword_score(content: str, query_tokens: list[str]) -> float:
    """Score document by counting query token matches (case-insensitive)."""
    content_lower = content.lower()
    score = sum(content_lower.count(tok) for tok in query_tokens if len(tok) > 2)
    return float(score)


def retrieve_schemes_keyword(query: str, k: int = 4) -> list[dict]:
    """
    Keyword-based fallback retriever using token frequency scoring.
    """
    docs = get_fallback_docs()
    tokens = re.sub(r"[^a-z0-9 ]", " ", query.lower()).split()

    scored = []
    for doc in docs:
        score = _keyword_score(doc.page_content, tokens)
        scored.append((doc, score))

    # Sort descending by score, take top-k
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:k]

    return [
        {
            "scheme_id":       doc.metadata.get("scheme_id", "Unknown"),
            "scheme_name":     doc.metadata.get("scheme_name", "Unknown Scheme"),
            "scheme_type":     doc.metadata.get("scheme_type", "Government Scheme"),
            "content":         doc.page_content,
            "relevance_score": score,
        }
        for doc, score in top
        if score > 0
    ]


# ---------------------------------------------------------------------------
# Unified Retriever (Auto-selects best available method)
# ---------------------------------------------------------------------------
def retrieve_relevant_schemes(query: str, k: int = 4) -> list[dict]:
    """
    Main retriever function. Attempts FAISS semantic search first,
    falls back to keyword matching if FAISS is unavailable.
    """
    results = retrieve_schemes_semantic(query, k=k)
    if results:
        return results
    print("[RAG] Falling back to keyword retrieval.")
    return retrieve_schemes_keyword(query, k=k)
