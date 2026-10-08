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