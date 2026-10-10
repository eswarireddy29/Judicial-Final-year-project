import json
import os

import chromadb
import torch
from transformers import AutoModel, AutoTokenizer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models"))
PRECEDENTS_PATH = os.path.join(MODELS_DIR, "precedents.json")
CHROMA_PATH = os.path.join(MODELS_DIR, "chroma_db")

tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
model = AutoModel.from_pretrained("law-ai/InLegalBERT")
model.eval()


def embed(text):
    inputs = tokenizer(
        text, return_tensors="pt", truncation=True, max_length=512, padding=True
    )
    with torch.no_grad():
        out = model(**inputs)
    mask = inputs["attention_mask"].unsqueeze(-1).float()
    summed = (out.last_hidden_state * mask).sum(dim=1)
    counts = mask.sum(dim=1).clamp(min=1e-9)
    return (summed / counts)[0].tolist()


def main():
    with open(PRECEDENTS_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)
    print("Loaded", len(cases), "cases")

    ids = [c["id"] for c in cases]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate ids found in precedents.json")

    client = chromadb.PersistentClient(path=CHROMA_PATH)
    try:
        client.delete_collection("precedents")
    except Exception:
        pass
    collection = client.create_collection(
        name="precedents", metadata={"hnsw:space": "cosine"}
    )

    documents, embeddings, metadatas = [], [], []
    for i, c in enumerate(cases, start=1):
        text = c["case_name"] + ". " + ", ".join(c["topics"]) + ". " + c["summary"]
        documents.append(text)
        embeddings.append(embed(text))
        metadatas.append(
            {
                "case_name": c["case_name"],
                "year": int(c["year"]),
                "court": c["court"],
                "citation": c["citation"],
                "topics": ", ".join(c["topics"]),
                "summary": c["summary"],
            }
        )
        print("Embedded", i, "of", len(cases), "-", c["case_name"])

    collection.add(
        ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas
    )
    print("Done. Saved", collection.count(), "cases to", CHROMA_PATH)


if __name__ == "__main__":
    main()