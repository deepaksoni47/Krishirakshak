"""
backend/rag/loader.py
Loads government scheme documents from backend/data/schemes/ directory.
Each .txt file becomes a LangChain Document with scheme name metadata.
"""
import os
from langchain_core.documents import Document

SCHEMES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "schemes")


def load_scheme_documents() -> list[Document]:
    """
    Load all .txt scheme files from the schemes directory.
    Returns a list of LangChain Document objects with metadata.
    """
    documents: list[Document] = []
    schemes_path = os.path.abspath(SCHEMES_DIR)

    if not os.path.exists(schemes_path):
        raise FileNotFoundError(f"Schemes directory not found: {schemes_path}")

    for filename in sorted(os.listdir(schemes_path)):
        if not filename.endswith(".txt"):
            continue

        scheme_id = filename.replace(".txt", "")
        filepath = os.path.join(schemes_path, filename)

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()

        # Extract scheme name from first line (format: "SCHEME: <Name>")
        first_line = content.split("\n")[0]
        scheme_name = first_line.replace("SCHEME:", "").strip() if "SCHEME:" in first_line else scheme_id

        # Extract type from second line
        second_line = content.split("\n")[1] if len(content.split("\n")) > 1 else ""
        scheme_type = second_line.replace("TYPE:", "").strip() if "TYPE:" in second_line else "Government Scheme"

        doc = Document(
            page_content=content,
            metadata={
                "scheme_id": scheme_id,
                "scheme_name": scheme_name,
                "scheme_type": scheme_type,
                "source": filepath,
            }
        )
        documents.append(doc)

    return documents


def get_scheme_names() -> list[str]:
    """Return list of all scheme IDs (filenames without .txt)."""
    schemes_path = os.path.abspath(SCHEMES_DIR)
    return [f.replace(".txt", "") for f in os.listdir(schemes_path) if f.endswith(".txt")]
