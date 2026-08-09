"""Leitura numérica defensiva de células.

A planilha original guarda fórmulas do Excel em algumas células (Total das
Despesas, Resultado Operacional, e parte de Renda Mensal). O openpyxl, sem o
motor de cálculo do Excel, devolve essas células como texto de fórmula (ex.:
"SUM(C4:C42)") ou como erro ("#REF!") em vez de um número calculado. Este
serviço nunca deve travar exibindo essas células — trata qualquer valor não
numérico como 0, deixando o próprio sistema recalcular o valor real quando o
usuário editar aquele mês.
"""


def to_float(valor) -> float:
    if isinstance(valor, bool):
        return 0.0
    if isinstance(valor, (int, float)):
        return float(valor)
    return 0.0
