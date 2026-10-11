import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module")
def client():
    # "with" runs the app startup, so all models get loaded once for the tests
    with TestClient(app) as c:
        yield c


VALID_CASE = (
    "The petitioner filed a writ petition before the High Court under Article 32 "
    "challenging the constitutional validity of Section 302 IPC in a murder case. "
    "The prosecution presented 6 witnesses including two eyewitnesses. "
    "The accused was charged along with 2 co-accused persons."
)

HIGH_RISK_CASE = (
    "The accused was charged under UAPA and PMLA before the Sessions Court. "
    "The prosecution examined two witnesses and the High Court heard the appeal."
)

SIMPLE_CASE = (
    "The complainant filed a complaint at the police station and the magistrate "
    "granted bail to the accused."
)


def test_health_check(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


def test_short_text_rejected(client):
    r = client.post("/analyze", json={"text": "too short"})
    assert r.status_code == 422


def test_non_legal_text_rejected(client):
    text = "I love making pasta with tomato sauce and fresh basil every Sunday afternoon with my family at home."
    r = client.post("/analyze", json={"text": text})
    assert r.status_code == 422


def test_valid_case_scores_critical(client):
    r = client.post("/analyze", json={"text": VALID_CASE})
    assert r.status_code == 200
    data = r.json()
    assert 0 <= data["complexity_score"] <= 100
    assert data["risk_level"] == "Critical"
    assert data["witness_count"] == 6


def test_ipc_302_maps_to_bns_103(client):
    r = client.post("/analyze", json={"text": VALID_CASE})
    assert r.json()["ipc_to_bns_mapping"]["IPC 302"] == "BNS 103"


def test_high_risk_override_scores_at_least_75(client):
    r = client.post("/analyze", json={"text": HIGH_RISK_CASE})
    assert r.status_code == 200
    assert r.json()["complexity_score"] >= 75


def test_simple_case_scores_low(client):
    r = client.post("/analyze", json={"text": SIMPLE_CASE})
    assert r.status_code == 200
    assert r.json()["risk_level"] == "Low"


def test_same_input_gives_same_score(client):
    a = client.post("/analyze", json={"text": VALID_CASE}).json()["complexity_score"]
    b = client.post("/analyze", json={"text": VALID_CASE}).json()["complexity_score"]
    assert a == b


def test_embedding_has_768_dimensions(client):
    r = client.post("/analyze", json={"text": VALID_CASE})
    assert r.json()["semantic_embedding_dim"] == 768
    
PRECEDENT_CASE = (
    "Writ petition under Article 32 before the Supreme Court challenging the "
    "validity of Section 66A of the IT Act on grounds of free speech under "
    "Article 19(1)(a). The petitioner argues the provision is vague. "
    "The respondent is the Union of India."
)


def test_returns_three_precedents(client):
    r = client.post("/analyze", json={"text": PRECEDENT_CASE})
    assert r.status_code == 200
    assert len(r.json()["similar_precedents"]) == 3


def test_precedent_has_required_fields(client):
    r = client.post("/analyze", json={"text": PRECEDENT_CASE})
    first = r.json()["similar_precedents"][0]
    for field in ["case_name", "year", "court", "citation", "summary", "similarity"]:
        assert field in first


def test_similarity_is_between_0_and_1(client):
    r = client.post("/analyze", json={"text": PRECEDENT_CASE})
    for p in r.json()["similar_precedents"]:
        assert 0 <= p["similarity"] <= 1


def test_66a_case_retrieves_shreya_singhal(client):
    r = client.post("/analyze", json={"text": PRECEDENT_CASE})
    names = [p["case_name"] for p in r.json()["similar_precedents"]]
    assert "Shreya Singhal v. Union of India" in names

def test_audit_text_mentions_precedents(client):
    r = client.post("/analyze", json={"text": PRECEDENT_CASE})
    reasoning = r.json()["reasoning"]
    assert "Similar Precedents" in reasoning
    assert "Shreya Singhal" in reasoning
def test_ocr_fixes_section_number_and_ipc(client):
    from main import correct_ocr_errors
    fixed = correct_ocr_errors("The accused is charged under Section 3O2 lPC.")
    assert "Section 302 IPC" in fixed


def test_ocr_joins_hyphenated_words(client):
    from main import correct_ocr_errors
    fixed = correct_ocr_errors("The prosecu-\ntion examined two witnesses.")
    assert "prosecution" in fixed
def test_corrupted_pdf_gives_clean_error(client):
    bad = b"%PDF-1.4 this file is corrupted and not a real pdf"
    r = client.post(
        "/analyze-document",
        files={"file": ("bad.pdf", bad, "application/pdf")},
    )
    assert r.status_code in (400, 422)


def test_empty_pdf_gives_clean_error(client):
    r = client.post(
        "/analyze-document",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert r.status_code in (400, 422)