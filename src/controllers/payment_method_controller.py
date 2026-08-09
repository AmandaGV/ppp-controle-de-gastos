"""Controller de Meios de Pagamento: valida entradas e aciona o
PaymentMethodService."""
from src.services.payment_method_service import PaymentMethodService


class PaymentMethodController:
    def __init__(self, service: PaymentMethodService):
        self._service = service

    def listar(self) -> list[str]:
        return self._service.listar()

    def buscar(self, nome: str) -> str | None:
        if not nome or not nome.strip():
            raise ValueError("Informe um nome para buscar.")
        return self._service.buscar(nome)

    def cadastrar(self, nome: str) -> None:
        if not nome or not nome.strip():
            raise ValueError("Informe o nome do meio de pagamento.")
        self._service.cadastrar(nome)

    def atualizar(self, nome_atual: str, novo_nome: str) -> None:
        if not nome_atual:
            raise ValueError("Selecione o meio de pagamento a atualizar.")
        if not novo_nome or not novo_nome.strip():
            raise ValueError("Informe o novo nome.")
        self._service.atualizar(nome_atual, novo_nome)

    def excluir(self, nome: str) -> None:
        if not nome:
            raise ValueError("Selecione o meio de pagamento a excluir.")
        self._service.excluir(nome)
