"""Configurações centrais do sistema: caminhos e rótulos usados para localizar
dinamicamente as células na planilha. Nenhuma coordenada (linha/coluna) é fixada
aqui — apenas os textos que o SheetLayoutService usa para encontrá-las em tempo
de execução, tornando o sistema resiliente a pequenas mudanças na planilha.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
_default_path = BASE_DIR / "data" / "PLANILHA CONTROLE DE GASTOS.xlsx"
PLANILHA_PATH = Path(os.environ.get("PLANILHA_CONTROLE_GASTOS_PATH", _default_path))

SHEET_DESPESAS = "Pessoa Física"
SHEET_MEIOS_PAGAMENTO = "Meios de Pagamento"

LABEL_MESES = "MESES"
LABEL_MEIO_PAGAMENTO = "Meio de Pagamento"
LABEL_TOTAL_DESPESAS = "Total das Despesas"
LABEL_RENDA_MENSAL = "Renda Mensal"
LABEL_RESULTADO_OPERACIONAL = "Resultado Operacional (renda - despesas)"

MESES_PT_BR = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
}
