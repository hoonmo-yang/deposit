-- Create database if not exists
SELECT 'CREATE DATABASE deposit'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'deposit')\gexec

-- Connect to the deposit database
\c deposit

-- Create tables
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_type INTEGER NOT NULL,
    real_name_identification_number VARCHAR(13) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    product_code VARCHAR(6) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    eligible_customer_type INTEGER NOT NULL,
    taxation_code VARCHAR(1) NOT NULL,
    eligible_age INTEGER NOT NULL,
    base_interest_rate DECIMAL(5,3) NOT NULL,
    additional_interest_rate DECIMAL(5,3) NOT NULL,
    applied_interest_rate DECIMAL(5,3) NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    account_number VARCHAR(12) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    product_code VARCHAR(6) NOT NULL,
    real_name_identification_number VARCHAR(13) NOT NULL,
    customer_type INTEGER NOT NULL,
    taxation_code VARCHAR(1) NOT NULL,
    initial_deposit_amount DECIMAL(15,2) NOT NULL,
    passbook_exemption_flag BOOLEAN NOT NULL,
    base_interest_rate DECIMAL(5,3) NOT NULL,
    additional_interest_rate DECIMAL(5,3) NOT NULL,
    applied_interest_rate DECIMAL(5,3) NOT NULL,
    account_password VARCHAR(4) NOT NULL,
    cash_amount DECIMAL(15,2) NOT NULL,
    linked_substitute_amount DECIMAL(15,2) NOT NULL,
    linked_substitute_account_number VARCHAR(12),
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_product FOREIGN KEY (product_code) REFERENCES products(product_code) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS account_transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_number VARCHAR(12) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    transaction_type INTEGER NOT NULL,
    transaction_amount DECIMAL(15,2) NOT NULL,
    balance_after_transaction DECIMAL(15,2) NOT NULL,
    CONSTRAINT fk_account FOREIGN KEY (account_number) REFERENCES accounts(account_number) ON DELETE RESTRICT
); 