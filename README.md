# Deposit Account Management System

A full-stack application for managing deposit accounts, built with FastAPI and PostgreSQL.

## Features

- Customer management
- Product management
- Account management
- Transaction management
- RESTful API with Swagger documentation

## Prerequisites

- Python 3.8+
- Docker and Docker Compose
- pip (Python package manager)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd deposit
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Start the PostgreSQL database:
```bash
docker-compose up -d
```

5. Run the FastAPI application:
```bash
cd backend
uvicorn main:app --reload
```

The API will be available at http://localhost:8000
API documentation (Swagger UI) will be available at http://localhost:8000/docs

## API Endpoints

### Customers
- POST /customers/ - Create a new customer
- GET /customers/ - List all customers
- GET /customers/{customer_id} - Get customer details

### Products
- POST /products/ - Create a new product
- GET /products/ - List all products
- GET /products/{product_code} - Get product details

### Accounts
- POST /accounts/ - Create a new account
- GET /accounts/ - List all accounts
- GET /accounts/{account_number} - Get account details

### Transactions
- POST /transactions/ - Create a new transaction
- GET /transactions/ - List all transactions
- GET /accounts/{account_number}/transactions/ - List account transactions

## Environment Variables

The following environment variables can be configured:

- POSTGRES_USER: PostgreSQL username (default: postgres)
- POSTGRES_PASSWORD: PostgreSQL password (default: postgres)
- POSTGRES_DB: PostgreSQL database name (default: deposit)
- POSTGRES_HOST: PostgreSQL host (default: localhost)
- POSTGRES_PORT: PostgreSQL port (default: 5432)

## Development

To run the application in development mode with auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

To run the tests:

```bash
pytest
```

## License

This project is licensed under the MIT License. 