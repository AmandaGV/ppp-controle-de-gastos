"""Controller de Renda Mensal e Resultado Operacional."""
from datetime import date

from api.services.income_service import IncomeService


class IncomeController:
    def __init__(self, service: IncomeService):
        self._service = service

    def obter_resumo(self, referencia: date) -> dict:
        if not referencia:
            raise ValueError("Selecione o mês de referência.")
        return {
            "renda_mensal": self._service.obter_renda(referencia),
            "total_despesas": self._service.obter_total_despesas(referencia),
            "resultado_operacional": self._service.obter_resultado_operacional(referencia),
        }

    def atualizar_renda(self, referencia: date, valor) -> float:
        if not referencia:
            raise ValueError("Selecione o mês de referência.")
        try:
            valor_float = float(valor)
        except (TypeError, ValueError):
            raise ValueError("Valor de renda inválido.") from None
        if valor_float < 0:
            raise ValueError("Renda não pode ser negativa.")
        return self._service.atualizar_renda(referencia, valor_float)
