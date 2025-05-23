from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import engine, get_db
from datetime import datetime
import uuid
from decimal import Decimal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Deposit Account Management System",
    description="API for managing deposit accounts and transactions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Customer endpoints
@app.post("/customers/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = models.Customer(
        customer_id=str(uuid.uuid4()),
        **customer.dict()
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.get("/customers/", response_model=List[schemas.Customer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    customers = db.query(models.Customer).offset(skip).limit(limit).all()
    return customers

@app.get("/customers/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.put("/customers/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: str, customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer.dict().items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if customer has any accounts
    if db_customer.accounts:
        raise HTTPException(status_code=400, detail="Cannot delete customer with existing accounts")
    
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

# Product endpoints
@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[schemas.Product])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_code}", response_model=schemas.Product)
def get_product(product_code: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_code == product_code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_code}", response_model=schemas.Product)
def update_product(product_code: str, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.product_code == product_code).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_code}")
def delete_product(product_code: str, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.product_code == product_code).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product has any accounts
    if db_product.accounts:
        raise HTTPException(status_code=400, detail="Cannot delete product with existing accounts")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# Account endpoints
@app.post("/accounts/", response_model=schemas.Account)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    # Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.customer_id == account.customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify product exists
    product = db.query(models.Product).filter(models.Product.product_code == account.product_code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Generate account number
    account_number = f"100-{db.query(models.Account).count() + 1000:07d}"
    
    db_account = models.Account(
        account_number=account_number,
        **account.dict()
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@app.get("/accounts/", response_model=List[schemas.Account])
def get_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = db.query(models.Account).offset(skip).limit(limit).all()
    return accounts

@app.get("/accounts/{account_number}", response_model=schemas.Account)
def get_account(account_number: str, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.account_number == account_number).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@app.put("/accounts/{account_number}", response_model=schemas.Account)
def update_account(account_number: str, account: schemas.AccountCreate, db: Session = Depends(get_db)):
    db_account = db.query(models.Account).filter(models.Account.account_number == account_number).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Verify customer exists
    customer = db.query(models.Customer).filter(models.Customer.customer_id == account.customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Verify product exists
    product = db.query(models.Product).filter(models.Product.product_code == account.product_code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in account.dict().items():
        setattr(db_account, key, value)
    
    db.commit()
    db.refresh(db_account)
    return db_account

@app.delete("/accounts/{account_number}")
def delete_account(account_number: str, db: Session = Depends(get_db)):
    db_account = db.query(models.Account).filter(models.Account.account_number == account_number).first()
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Check if account has any transactions
    if db_account.transactions:
        raise HTTPException(status_code=400, detail="Cannot delete account with existing transactions")
    
    db.delete(db_account)
    db.commit()
    return {"message": "Account deleted successfully"}

# Transaction endpoints
@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    # Verify account exists
    account = db.query(models.Account).filter(models.Account.account_number == transaction.account_number).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Calculate new balance
    current_balance = Decimal(str(account.initial_deposit_amount))
    last_transaction = db.query(models.AccountTransaction)\
        .filter(models.AccountTransaction.account_number == transaction.account_number)\
        .order_by(models.AccountTransaction.transaction_date.desc())\
        .first()
    
    if last_transaction:
        current_balance = Decimal(str(last_transaction.balance_after_transaction))
    
    transaction_amount = Decimal(str(transaction.transaction_amount))
    
    if transaction.transaction_type == 1:  # Deposit
        new_balance = current_balance + transaction_amount
    else:  # Withdrawal
        if current_balance < transaction_amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        new_balance = current_balance - transaction_amount
    
    # Update transaction with calculated balance
    transaction_data = transaction.dict()
    transaction_data["balance_after_transaction"] = new_balance
    
    db_transaction = models.AccountTransaction(**transaction_data)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[schemas.Transaction])
def get_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(models.AccountTransaction).offset(skip).limit(limit).all()
    return transactions

@app.get("/accounts/{account_number}/transactions/", response_model=List[schemas.Transaction])
def get_account_transactions(account_number: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(models.AccountTransaction)\
        .filter(models.AccountTransaction.account_number == account_number)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return transactions

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(models.AccountTransaction).filter(models.AccountTransaction.transaction_id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"} 