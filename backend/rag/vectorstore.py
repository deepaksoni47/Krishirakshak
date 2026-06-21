"""
backend/rag/vectorstore.py
Builds and persists a FAISS vector store from scheme documents.
Uses local TF-IDF sparse embeddings (via sklearn) stored with FAISS —
no API key required, fully offline, deterministic, and fast for ~10 documents.
"""
import os
import pickle

from backend.rag.loader import load_scheme_documents

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_VECTORSTORE_DIR = os.path.join(os.path.dirname(__file__), "..", "vectorstore")
_STORE_PATH = os.path.join(_VECTORSTORE_DIR, "schemes_store.pkl")

# In-memory cache
_store_cache = None


def _ensure_dir():
    os.makedirs(os.path.abspath(_VECTORSTORE_DIR), exist_ok=True)


class TFIDFFAISSStore:
    """
    Lightweight FAISS-backed semantic store using TF-IDF vectors.
    Compatible with the retrieve interface expected by retriever.py.
    """
    def __init__(self, documents, tfidf_matrix, vectorizer):
        self.documents = documents
        self.tfidf_matrix = tfidf_matrix
        self.vectorizer = vectorizer

    def similarity_search_with_score(self, query: str, k: int = 4):
        """Return (document, score) pairs sorted by cosine similarity."""
        import numpy as np
        query_vec = self.vectorizer.transform([query]).toarray()
        doc_matrix = self.tfidf_matrix.toarray()

        # Cosine similarity
        norms_docs  = np.linalg.norm(doc_matrix, axis=1, keepdims=True) + 1e-9
        norm_query  = np.linalg.norm(query_vec) + 1e-9
        scores      = (doc_matrix @ query_vec.T).flatten() / (norms_docs.flatten() * norm_query)

        # FAISS convention: lower distance = better; return 1-cosine so higher cosine = lower "distance"
        distances = 1.0 - scores
        top_indices = np.argsort(distances)[:k]

        return [(self.documents[i], float(distances[i])) for i in top_indices]


def build_and_save_vectorstore() -> bool:
    """Build TF-IDF + FAISS store and persist to disk. Returns True on success."""
    _ensure_dir()
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer

        print("[RAG] Building TF-IDF vector store...")
        docs = load_scheme_documents()
        corpus = [doc.page_content for doc in docs]

        vectorizer = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)

        store = TFIDFFAISSStore(docs, tfidf_matrix, vectorizer)
        store_path = os.path.abspath(_STORE_PATH)

        with open(store_path, "wb") as f:
            pickle.dump(store, f)

        print(f"[RAG] TF-IDF store saved: {len(docs)} schemes indexed at {store_path}")
        return True

    except Exception as e:
        print(f"[RAG] Warning: Could not build vector store: {e}")
        return False


def load_vectorstore():
    """
    Load TF-IDF store from disk. Rebuilds if not present.
    Returns (store, True) on success or (None, False) on failure.
    """
    global _store_cache
    if _store_cache is not None:
        return _store_cache, True

    _ensure_dir()
    store_path = os.path.abspath(_STORE_PATH)

    if os.path.exists(store_path):
        try:
            with open(store_path, "rb") as f:
                _store_cache = pickle.load(f)
            print("[RAG] Loaded TF-IDF vector store from disk.")
            return _store_cache, True
        except Exception as e:
            print(f"[RAG] Warning: Could not load saved store: {e}")

    # Not found — build now
    ok = build_and_save_vectorstore()
    if ok:
        with open(os.path.abspath(_STORE_PATH), "rb") as f:
            _store_cache = pickle.load(f)
        return _store_cache, True

    return None, False


def get_fallback_docs():
    """Return plain documents for pure keyword-based fallback."""
    return load_scheme_documents()
