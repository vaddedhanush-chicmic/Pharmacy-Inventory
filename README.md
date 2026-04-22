# Pharmacy Inventory Management System (MVP)

A simple, fast, and robust backend system designed for local pharmacy owners to easily manage their inventory and sales without unnecessary complexity.

## Features

- **Authentication & Authorization**: Secure JWT-based login with role-based access control.
- **Simple Inventory Management**: Easily add and update medicines with MRP, selling prices, and reorder levels.
- **Fast Point of Sale (POS)**: Generate bills instantly. The system automatically calculates totals and deducts stock from inventory.
- **Owner's Dashboard**: A single endpoint that provides today's total revenue, low stock alerts, and expiry warnings.
- **Swagger Documentation**: Beautiful, auto-generated API documentation to easily test all endpoints.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose
- **Authentication**: Passport & JWT
- **Validation**: class-validator & class-transformer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A running MongoDB instance (Local or Atlas)

### Installation

```bash
$ npm install
```

### Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/pharmacy
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1d
PORT=3000
```

### Running the Application

```bash
# development
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

### Seeding the Database

To quickly populate the database with dummy medicines for testing:

```bash
$ npm run build
$ node dist/seed.js
```

## API Documentation

Once the application is running, you can access the interactive Swagger API documentation at:

```
http://localhost:3000/api/docs
```

## Core Modules

1. **Auth Module**: Handles `/api/auth/register` and `/api/auth/login`.
2. **Users Module**: Manages staff and admin accounts.
3. **Medicines Module**: CRUD operations for the inventory. Features name-based search for fast POS integration.
4. **Sales Module**: Handles bill generation and automatic stock deduction.
5. **Reports Module**: Powers the owner's dashboard at `/api/reports/dashboard`.
