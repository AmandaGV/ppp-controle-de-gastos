"""Testes de fumaça da API: garantem que rotas, schemas Pydantic e
composition root estão corretamente conectados, usando o TestClient do
FastAPI sobre uma cópia temporária da planilha (nunca a de data/)."""
import shutil

import pytest
from fastapi.testclient import TestClient

from api import config
from api.dependencies import get_context


@pytest.fixture
def client(tmp_path, monkeypatch):
    destino = tmp_path / "PLANILHA CONTROLE DE GASTOS.xlsx"
    shutil.copy(config.PLANILHA_PATH, destino)
    monkeypatch.setattr(config, "PLANILHA_PATH", destino)

    get_context.cache_clear()
    from api.main import app

    yield TestClient(app)
    get_context.cache_clear()


def test_listar_categorias(client):
    resp = client.get("/despesas/categorias")
    assert resp.status_code == 200
    assert "ALIMENTAÇÃO" in resp.json()


def test_cadastrar_busca_e_exclui_despesa(client):
    payload = {
        "valor": 100.0,
        "data": "2026-06-15",
        "categoria": "ALIMENTAÇÃO",
        "subcategoria": "Supermercado",
        "meio_pagamento": "Pix",
    }
    resp = client.post("/despesas", json=payload)
    assert resp.status_code == 201
    corpo = resp.json()
    assert corpo["valor"] == 100.0
    assert corpo["meios_pagamento"] == ["Pix"]

    params = {"categoria": "ALIMENTAÇÃO", "subcategoria": "Supermercado", "ano": 2026, "mes": 6}
    resp = client.get("/despesas", params=params)
    assert resp.status_code == 200
    assert resp.json()["valor"] == 100.0

    resp = client.delete("/despesas", params=params)
    assert resp.status_code == 204

    resp = client.get("/despesas", params=params)
    assert resp.json()["valor"] == 0.0


def test_cadastrar_despesa_com_valor_invalido_e_rejeitado_pelo_schema(client):
    payload = {
        "valor": -10.0,
        "data": "2026-06-15",
        "categoria": "ALIMENTAÇÃO",
        "subcategoria": "Supermercado",
        "meio_pagamento": "Pix",
    }
    resp = client.post("/despesas", json=payload)
    assert resp.status_code == 422


def test_meio_pagamento_crud(client):
    resp = client.post("/meios-pagamento", json={"nome": "Vale Alimentação"})
    assert resp.status_code == 201

    resp = client.get("/meios-pagamento/Vale Alimentação")
    assert resp.status_code == 200

    resp = client.delete("/meios-pagamento/Vale Alimentação")
    assert resp.status_code == 204

    resp = client.get("/meios-pagamento/Vale Alimentação")
    assert resp.status_code == 404


def test_renda_e_resultado_operacional(client):
    resp = client.put("/renda", params={"ano": 2026, "mes": 6}, json={"valor": 1000.0})
    assert resp.status_code == 200
    assert resp.json()["renda_mensal"] == 1000.0

    client.post(
        "/despesas",
        json={
            "valor": 300.0,
            "data": "2026-06-15",
            "categoria": "ALIMENTAÇÃO",
            "subcategoria": "Supermercado",
            "meio_pagamento": "Pix",
        },
    )

    resp = client.get("/renda", params={"ano": 2026, "mes": 6})
    corpo = resp.json()
    assert corpo["total_despesas"] == 300.0
    assert corpo["resultado_operacional"] == 700.0
