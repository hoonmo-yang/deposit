from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal

class CustomerBase(BaseModel):
    customer_name: str
    customer_type: int = Field(..., ge=1, le=2)
    real_name_identification_number: str = Field(..., min_length=13, max_length=13)

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    customer_id: str
    registration_date: datetime
    last_modified_date: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    product_name: str
    eligible_customer_type: int = Field(..., ge=1, le=2)
    taxation_code: str = Field(..., min_length=1, max_length=1)
    eligible_age: Optional[int] = None
    base_interest_rate: Decimal = Field(..., ge=0, le=100)
    additional_interest_rate: Decimal = Field(..., ge=0, le=100)
    applied_interest_rate: Decimal = Field(..., ge=0, le=100)

class ProductCreate(ProductBase):
    product_code: str = Field(..., min_length=6, max_length=6)

class Product(ProductBase):
    product_code: str
    registration_date: datetime
    last_modified_date: datetime

    class Config:
        from_attributes = True

class AccountBase(BaseModel):
    customer_id: str
    product_code: str = Field(..., min_length=6, max_length=6)
    real_name_identification_number: str = Field(..., min_length=13, max_length=13)
    customer_type: int = Field(..., ge=1, le=2)
    taxation_code: str = Field(..., min_length=1, max_length=1)
    initial_deposit_amount: Decimal = Field(..., ge=0)
    passbook_exemption_flag: bool = False
    base_interest_rate: Decimal = Field(..., ge=0, le=100)
    additional_interest_rate: Decimal = Field(..., ge=0, le=100)
    applied_interest_rate: Decimal = Field(..., ge=0, le=100)
    account_password: str = Field(..., min_length=4, max_length=4)
    cash_amount: Decimal = Field(..., ge=0)
    linked_substitute_amount: Decimal = Field(..., ge=0)
    linked_substitute_account_number: Optional[str] = Field(None, min_length=10, max_length=10)

    @validator('initial_deposit_amount')
    def validate_initial_deposit(cls, v, values):
        if 'cash_amount' in values and 'linked_substitute_amount' in values:
            if v != values['cash_amount'] + values['linked_substitute_amount']:
                raise ValueError('Initial deposit amount must equal the sum of cash amount and linked substitute amount')
        return v

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    account_number: str
    account_opening_date: datetime
    last_modified_date: datetime

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    account_number: str
    transaction_date: datetime
    transaction_type: int = Field(..., ge=1, le=2)
    transaction_amount: Decimal = Field(..., gt=0)
    balance_after_transaction: Decimal = Field(..., ge=0)

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    transaction_id: int
    registration_date: datetime

    class Config:
        from_attributes = True 