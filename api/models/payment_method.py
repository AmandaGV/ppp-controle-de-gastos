from dataclasses import dataclass


@dataclass(frozen=True)
class PaymentMethod:
    """Representa um meio de pagamento cadastrado no catálogo da planilha."""

    nome: str
