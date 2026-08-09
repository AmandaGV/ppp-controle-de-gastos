"""Schemas Pydantic de Meios de Pagamento."""
from pydantic import BaseModel, Field


class PaymentMethodCreate(BaseModel):
    nome: str = Field(min_length=1)


class PaymentMethodUpdate(BaseModel):
    novo_nome: str = Field(min_length=1)


class PaymentMethodOut(BaseModel):
    nome: str
