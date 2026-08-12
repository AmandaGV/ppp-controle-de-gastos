"""Única camada da interface que se comunica com o mundo exterior: faz
requisições HTTP para a API REST do backend Node.js. Nenhuma outra parte da
UI acessa a planilha, abre o .xlsx ou importa código do backend — tudo passa
por aqui, usando a biblioteca `requests`.
"""
import os
from dataclasses import dataclass
from datetime import date
from urllib.parse import quote

import pandas as pd
import requests

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:3000/api").rstrip("/")


class ApiError(Exception):
    """Erro de negócio ou validação retornado pela API (4xx)."""


class ApiConnectionError(Exception):
    """A API não respondeu (processo fora do ar, rede, etc.)."""


@dataclass(frozen=True)
class ExpenseCellDTO:
    categoria: str
    subcategoria: str
    mes_referencia: date
    valor: float
    meios_pagamento: list[str]


def _request(
    method: str, path: str, ignore_statuses: frozenset[int] = frozenset(), **kwargs
) -> requests.Response:
    try:
        resp = requests.request(method, f"{API_BASE_URL}{path}", timeout=10, **kwargs)
    except requests.RequestException as erro:
        raise ApiConnectionError(
            f"Não foi possível conectar à API em {API_BASE_URL}. "
            f"Verifique se o servidor Node da API está em execução."
        ) from erro

    if resp.status_code in ignore_statuses:
        return resp
    if resp.status_code >= 400:
        detail = resp.text
        try:
            detail = resp.json().get("detail", detail)
        except ValueError:
            pass
        raise ApiError(detail)
    return resp


def _parse_cell(data: dict) -> ExpenseCellDTO:
    return ExpenseCellDTO(
        categoria=data["categoria"],
        subcategoria=data["subcategoria"],
        mes_referencia=date.fromisoformat(data["mes_referencia"]),
        valor=data["valor"],
        meios_pagamento=data["meios_pagamento"],
    )


class ExpenseApiClient:
    """Consome os endpoints /despesas da API."""

    def listar_categorias(self) -> list[str]:
        return _request("GET", "/despesas/categorias").json()

    def listar_subcategorias(self, categoria: str) -> list[str]:
        return _request("GET", f"/despesas/categorias/{quote(categoria)}/subcategorias").json()

    def listar_meses_disponiveis(self) -> list[date]:
        meses = []
        for label in _request("GET", "/despesas/meses").json():
            mes_str, ano_str = label.split("/")
            meses.append(date(int(ano_str), int(mes_str), 1))
        return meses

    def obter_dataframe(self) -> pd.DataFrame:
        payload = _request("GET", "/despesas/planilha").json()
        meses = payload["meses"]

        colunas = []
        for mes in meses:
            colunas.append((mes, "Valor (R$)"))
            colunas.append((mes, "Meio de Pagamento"))
        columns = pd.MultiIndex.from_tuples(colunas)

        indices = []
        linhas = []
        for linha in payload["linhas"]:
            indices.append((linha["categoria"], linha["subcategoria"]))
            por_mes = {v["mes"]: v for v in linha["valores"]}
            valores = []
            for mes in meses:
                cel = por_mes.get(mes, {"valor": 0.0, "meio_pagamento": ""})
                valores.extend([cel["valor"], cel["meio_pagamento"]])
            linhas.append(valores)

        index = pd.MultiIndex.from_tuples(indices, names=["Categoria", "Subcategoria"])
        return pd.DataFrame(linhas, index=index, columns=columns)

    def cadastrar(
        self, valor, data: date, categoria: str, subcategoria: str, meio_pagamento: str
    ) -> ExpenseCellDTO:
        payload = {
            "valor": float(valor),
            "data": data.isoformat(),
            "categoria": categoria,
            "subcategoria": subcategoria,
            "meio_pagamento": meio_pagamento,
        }
        resp = _request("POST", "/despesas", json=payload)
        return _parse_cell(resp.json())

    def buscar(self, categoria: str, subcategoria: str, referencia: date) -> ExpenseCellDTO:
        params = {
            "categoria": categoria,
            "subcategoria": subcategoria,
            "ano": referencia.year,
            "mes": referencia.month,
        }
        resp = _request("GET", "/despesas", params=params)
        return _parse_cell(resp.json())

    def atualizar(
        self,
        categoria: str,
        subcategoria: str,
        referencia: date,
        novo_valor,
        meio_pagamento: str | None = None,
    ) -> ExpenseCellDTO:
        params = {
            "categoria": categoria,
            "subcategoria": subcategoria,
            "ano": referencia.year,
            "mes": referencia.month,
        }
        payload = {"novo_valor": float(novo_valor), "meio_pagamento": meio_pagamento}
        resp = _request("PUT", "/despesas", params=params, json=payload)
        return _parse_cell(resp.json())

    def excluir(self, categoria: str, subcategoria: str, referencia: date) -> None:
        params = {
            "categoria": categoria,
            "subcategoria": subcategoria,
            "ano": referencia.year,
            "mes": referencia.month,
        }
        _request("DELETE", "/despesas", params=params)


class PaymentMethodApiClient:
    """Consome os endpoints /meios-pagamento da API."""

    def listar(self) -> list[str]:
        return _request("GET", "/meios-pagamento").json()

    def buscar(self, nome: str) -> str | None:
        resp = _request("GET", f"/meios-pagamento/{quote(nome)}", ignore_statuses=frozenset({404}))
        if resp.status_code == 404:
            return None
        return resp.json()["nome"]

    def cadastrar(self, nome: str) -> None:
        _request("POST", "/meios-pagamento", json={"nome": nome})

    def atualizar(self, nome_atual: str, novo_nome: str) -> None:
        _request("PUT", f"/meios-pagamento/{quote(nome_atual)}", json={"novo_nome": novo_nome})

    def excluir(self, nome: str) -> None:
        _request("DELETE", f"/meios-pagamento/{quote(nome)}")


class IncomeApiClient:
    """Consome os endpoints /renda da API."""

    def obter_resumo(self, referencia: date) -> dict:
        params = {"ano": referencia.year, "mes": referencia.month}
        return _request("GET", "/renda", params=params).json()

    def atualizar_renda(self, referencia: date, valor) -> float:
        params = {"ano": referencia.year, "mes": referencia.month}
        resp = _request("PUT", "/renda", params=params, json={"valor": float(valor)})
        return resp.json()["renda_mensal"]


class SystemApiClient:
    """Consome os endpoints /sistema da API."""

    def recarregar(self) -> None:
        _request("POST", "/sistema/reload")
