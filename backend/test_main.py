from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pytest
from datetime import datetime
from decimal import Decimal

from main import app
from database import Base, get_db
from models import Customer, Product, Account, AccountTransaction

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = None
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        if db is not None:
            db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_customer():
    response = client.post(
        "/customers/",
        json={
            "customer_name": "John Doe",
            "customer_type": 1,
            "real_name_identification_number": "1234567890123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["customer_name"] == "John Doe"
    assert data["customer_type"] == 1
    assert data["real_name_identification_number"] == "1234567890123"
    assert "customer_id" in data

def test_create_product():
    response = client.post(
        "/products/",
        json={
            "product_code": "123456",
            "product_name": "Savings Account",
            "eligible_customer_type": 1,
            "taxation_code": "1",
            "eligible_age": 18,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["product_code"] == "123456"
    assert data["product_name"] == "Savings Account"
    assert data["eligible_customer_type"] == 1

def test_create_account():
    # First create a customer
    customer_response = client.post(
        "/customers/",
        json={
            "customer_name": "John Doe",
            "customer_type": 1,
            "real_name_identification_number": "1234567890123"
        }
    )
    customer_id = customer_response.json()["customer_id"]

    # Then create a product
    product_response = client.post(
        "/products/",
        json={
            "product_code": "123456",
            "product_name": "Savings Account",
            "eligible_customer_type": 1,
            "taxation_code": "1",
            "eligible_age": 18,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000"
        }
    )
    product_code = product_response.json()["product_code"]

    # Finally create an account
    response = client.post(
        "/accounts/",
        json={
            "customer_id": customer_id,
            "product_code": product_code,
            "real_name_identification_number": "1234567890123",
            "customer_type": 1,
            "taxation_code": "1",
            "initial_deposit_amount": "1000000",
            "passbook_exemption_flag": False,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000",
            "account_password": "1234",
            "cash_amount": "1000000",
            "linked_substitute_amount": "0",
            "linked_substitute_account_number": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == customer_id
    assert data["product_code"] == product_code
    assert data["initial_deposit_amount"] == "1000000"

def test_create_transaction():
    # First create a customer
    customer_response = client.post(
        "/customers/",
        json={
            "customer_name": "John Doe",
            "customer_type": 1,
            "real_name_identification_number": "1234567890123"
        }
    )
    customer_id = customer_response.json()["customer_id"]

    # Then create a product
    product_response = client.post(
        "/products/",
        json={
            "product_code": "123456",
            "product_name": "Savings Account",
            "eligible_customer_type": 1,
            "taxation_code": "1",
            "eligible_age": 18,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000"
        }
    )
    product_code = product_response.json()["product_code"]

    # Create an account
    account_response = client.post(
        "/accounts/",
        json={
            "customer_id": customer_id,
            "product_code": product_code,
            "real_name_identification_number": "1234567890123",
            "customer_type": 1,
            "taxation_code": "1",
            "initial_deposit_amount": "1000000",
            "passbook_exemption_flag": False,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000",
            "account_password": "1234",
            "cash_amount": "1000000",
            "linked_substitute_amount": "0",
            "linked_substitute_account_number": None
        }
    )
    account_number = account_response.json()["account_number"]

    # Create a transaction
    response = client.post(
        "/transactions/",
        json={
            "account_number": account_number,
            "transaction_date": datetime.utcnow().isoformat(),
            "transaction_type": 1,
            "transaction_amount": "500000"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["account_number"] == account_number
    assert data["transaction_type"] == 1
    assert data["transaction_amount"] == "500000"
    assert data["balance_after_transaction"] == "1500000"

def test_delete_customer_with_accounts():
    # First create a customer
    customer_response = client.post(
        "/customers/",
        json={
            "customer_name": "John Doe",
            "customer_type": 1,
            "real_name_identification_number": "1234567890123"
        }
    )
    customer_id = customer_response.json()["customer_id"]

    # Then create a product
    product_response = client.post(
        "/products/",
        json={
            "product_code": "123456",
            "product_name": "Savings Account",
            "eligible_customer_type": 1,
            "taxation_code": "1",
            "eligible_age": 18,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000"
        }
    )
    product_code = product_response.json()["product_code"]

    # Create an account
    client.post(
        "/accounts/",
        json={
            "customer_id": customer_id,
            "product_code": product_code,
            "real_name_identification_number": "1234567890123",
            "customer_type": 1,
            "taxation_code": "1",
            "initial_deposit_amount": "1000000",
            "passbook_exemption_flag": False,
            "base_interest_rate": "3.500",
            "additional_interest_rate": "0.500",
            "applied_interest_rate": "4.000",
            "account_password": "1234",
            "cash_amount": "1000000",
            "linked_substitute_amount": "0",
            "linked_substitute_account_number": None
        }
    )

    # Try to delete the customer
    response = client.delete(f"/customers/{customer_id}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot delete customer with existing accounts" 