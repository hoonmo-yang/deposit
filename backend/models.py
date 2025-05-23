from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Customer(Base):
    __tablename__ = "customer"

    customer_id = Column(String, primary_key=True)
    customer_name = Column(String, nullable=False)
    customer_type = Column(Integer, nullable=False)  # 1: Individual, 2: Corporate
    real_name_identification_number = Column(String(13), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    accounts = relationship("Account", back_populates="customer")

class Product(Base):
    __tablename__ = "product"

    product_code = Column(String(6), primary_key=True)
    product_name = Column(String, nullable=False)
    eligible_customer_type = Column(Integer, nullable=False)  # 1: Individual, 2: Corporate
    taxation_code = Column(String(1), nullable=False)
    eligible_age = Column(Integer)
    base_interest_rate = Column(Numeric(5, 3), nullable=False)
    additional_interest_rate = Column(Numeric(5, 3), nullable=False)
    applied_interest_rate = Column(Numeric(5, 3), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    accounts = relationship("Account", back_populates="product")

class Account(Base):
    __tablename__ = "account"

    account_number = Column(String, primary_key=True)
    customer_id = Column(String, ForeignKey("customer.customer_id"), nullable=False)
    product_code = Column(String(6), ForeignKey("product.product_code"), nullable=False)
    real_name_identification_number = Column(String(13), nullable=False)
    customer_type = Column(Integer, nullable=False)
    taxation_code = Column(String(1), nullable=False)
    initial_deposit_amount = Column(Numeric(12, 0), nullable=False)
    passbook_exemption_flag = Column(Boolean, default=False)
    base_interest_rate = Column(Numeric(5, 3), nullable=False)
    additional_interest_rate = Column(Numeric(5, 3), nullable=False)
    applied_interest_rate = Column(Numeric(5, 3), nullable=False)
    account_password = Column(String(4), nullable=False)
    cash_amount = Column(Numeric(12, 0), nullable=False)
    linked_substitute_amount = Column(Numeric(12, 0), nullable=False)
    linked_substitute_account_number = Column(String(10))
    account_opening_date = Column(DateTime, default=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="accounts")
    product = relationship("Product", back_populates="accounts")
    transactions = relationship("AccountTransaction", back_populates="account")

class AccountTransaction(Base):
    __tablename__ = "account_transaction"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    account_number = Column(String, ForeignKey("account.account_number"), nullable=False)
    transaction_date = Column(DateTime, nullable=False)
    transaction_type = Column(Integer, nullable=False)  # 1: Deposit, 2: Withdrawal
    transaction_amount = Column(Numeric(12, 0), nullable=False)
    balance_after_transaction = Column(Numeric(12, 0), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions") 