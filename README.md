# ThriftHub

**ThriftHub** is a full-stack e-commerce web application designed as an online marketplace for **affordable and sustainable thrift fashion (ukay-ukay)**. The platform allows users to browse curated second-hand clothing, create accounts, add items to their cart, and place orders through a modern responsive web interface.

This project demonstrates the implementation of a **modern serverless full-stack architecture** using Angular, MongoDB, Netlify Functions, and TailwindCSS.

---

# Project Overview

ThriftHub aims to replicate the experience of a modern online clothing marketplace while focusing on affordability and sustainability. It enables users to browse products, manage a shopping cart, authenticate accounts, and complete purchases in a seamless single-page application.

The system is built using:

* **Angular** for the frontend SPA
* **Netlify Serverless Functions** for backend APIs
* **MongoDB Atlas** as the database
* **Mongoose** for database modeling
* **TailwindCSS** for styling
* **Netlify** for deployment

The architecture separates frontend presentation from backend business logic, allowing the application to scale easily in a serverless environment.

---

# Key Features

## User Features

* User registration and authentication
* Secure password hashing with bcrypt
* Product catalog browsing
* Product detail viewing
* Add/remove items from shopping cart
* Checkout flow
* Order confirmation page
* User profile dashboard
* Order history tracking

## Store Features

* Product catalog management
* Inventory stock tracking
* Product categorization
* Serverless product retrieval API
* Image asset management

## Platform Features

* Serverless backend architecture
* MongoDB database integration
* Responsive mobile-first design
* Modular Angular component structure
* Environment-based configuration
* Netlify deployment pipeline

---

# Tech Stack

## Frontend

* Angular 21
* TypeScript
* RxJS
* TailwindCSS
* PostCSS

## Backend

* Netlify Functions (Serverless)
* Node.js
* MongoDB Atlas
* Mongoose ODM
* bcryptjs (password hashing)

## Tooling

* Angular CLI
* Prettier
* Vitest
* PostCSS
* npm

---

# Application Architecture

The project follows a **modern serverless full-stack architecture**.

```
Frontend (Angular SPA)
        │
        │ HTTP Requests
        ▼
Netlify Serverless Functions
        │
        │ Mongoose ODM
        ▼
MongoDB Atlas Database
```

### Frontend

The Angular application manages UI rendering, routing, and client-side logic.

### Backend

Netlify Functions provide API endpoints responsible for:

* Authentication
* Product retrieval
* Database operations

### Database

MongoDB Atlas stores application data including:

* Users
* Products
* Carts
* Orders

---

# Project Folder Structure

```
AWEB-FinalProject/
│
├── netlify/
│   └── functions/
│       ├── login.js
│       ├── register.js
│       ├── product.js
│       ├── products.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── product.model.js
│       │   ├── cart.model.js
│       │   └── order.model.js
│       └── utils/
│           └── db.js
│
├── public/
│   └── assets/
│       └── images/
│
├── src/
│   ├── app/
│   │   ├── pages/
│   │   ├── services/
│   │   └── shared/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
│
├── angular.json
├── package.json
├── netlify.toml
└── proxy.conf.json
```

---

# Frontend Architecture

The Angular application follows a **component-based architecture**.

## Root Application

| File         | Purpose                          |
| ------------ | -------------------------------- |
| `index.html` | Main HTML entry point            |
| `main.ts`    | Bootstraps Angular application   |
| `styles.css` | Global styling and design system |

---

## Core Application Files

| File            | Description                  |
| --------------- | ---------------------------- |
| `app.ts`        | Root Angular component       |
| `app.html`      | Root layout template         |
| `app.css`       | Root component styles        |
| `app.routes.ts` | Application routing          |
| `app.config.ts` | Angular global configuration |

---

# Pages (Route Components)

Each page represents a full view in the Angular router.

```
src/app/pages/
```

| Page               | Purpose               |
| ------------------ | --------------------- |
| Home               | Landing page          |
| Catalog            | Product browsing      |
| Product Detail     | Individual item page  |
| Cart               | Shopping cart         |
| Checkout           | Purchase workflow     |
| Order Confirmation | Purchase success      |
| Order History      | Past purchases        |
| Login              | User authentication   |
| Register           | Account creation      |
| Profile            | User account page     |
| About              | Platform information  |
| Contact            | Support communication |
| Privacy            | Privacy policy        |
| Terms              | Terms of service      |

---

# Shared Components

Reusable UI components used throughout the application.

```
src/app/shared/
```

Components include:

| Component    | Purpose              |
| ------------ | -------------------- |
| Navbar       | Global navigation    |
| Footer       | Global page footer   |
| Product Card | Product display card |

---

# Services

Angular services manage shared application logic.

| Service           | Purpose                               |
| ----------------- | ------------------------------------- |
| `auth.service.ts` | Authentication and session management |
| `cart.service.ts` | Shopping cart state management        |

---

# Backend Architecture

Backend APIs are implemented using **Netlify Serverless Functions**.

```
netlify/functions/
```

Each file represents an HTTP endpoint.

| Endpoint        | Function                 |
| --------------- | ------------------------ |
| `/api/login`    | User authentication      |
| `/api/register` | User account creation    |
| `/api/products` | Retrieve product catalog |
| `/api/product`  | Retrieve single product  |

---

# Database Models

The application uses **Mongoose schemas** to define database structure.

## User Model

Fields:

```
name
email
password
createdAt
updatedAt
```

---

## Product Model

Fields:

```
name
description
price
category
image
stock
createdAt
updatedAt
```

---

## Cart Model

Each user has a single cart.

```
userId
items[]
```

Each item contains:

```
productId
name
price
image
quantity
```

---

## Order Model

Orders store completed purchases.

```
userId
items[]
total
status
shippingAddress
createdAt
```

---

# API Endpoints

## Register

```
POST /api/register
```

Request:

```
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "password123"
}
```

---

## Login

```
POST /api/login
```

Request:

```
{
  "email": "john@email.com",
  "password": "password123"
}
```

---

## Get Products

```
GET /api/products
```

Optional query parameters:

```
?limit=20
?category=pants
```

---

## Get Single Product

```
GET /api/product?id=<productId>
```

---

# Environment Variables

Create a `.env` file in the project root.

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thrifthub
```

This variable is used by:

```
netlify/functions/utils/db.js
```

---

# Local Development Setup

## 1. Clone the Repository

```
git clone https://github.com/Jz100505/AWEB-FinalProject.git
cd AWEB-FinalProject
```

---

## 2. Install Dependencies

```
npm install
```

---

## 3. Configure Environment Variables

Create `.env`

```
MONGODB_URI=your_mongodb_connection_string
```

---

## 4. Run Development Server

```
npm start
```

Angular will start at:

```
http://localhost:4200
```

---

# Running Serverless Functions Locally

Install Netlify CLI:

```
npm install -g netlify-cli
```

Run:

```
netlify dev
```

This simulates the full stack environment including serverless APIs.

---

# Database Testing Scripts

Two scripts are included for testing MongoDB connectivity.

## Test MongoDB Atlas Connection

```
node test-atlas.js
```

Expected output:

```
Connected to MongoDB Atlas
Inserted dummy user
```

---

## Test Register Endpoint

```
node test-register.js
```

This simulates a registration request to the serverless function.

---

# Deployment

The project is configured for **automatic deployment on Netlify**.

## Build Command

```
npm run build
```

## Output Directory

```
dist/thrift-hub/browser
```

Defined in:

```
netlify.toml
```

---

# Netlify Configuration

The file `netlify.toml` defines build and routing behavior.

Important rules:

```
/api/* -> /.netlify/functions/*
```

This allows Angular to call backend APIs through Netlify functions.

---

# Styling System

The project uses a **design token system** defined in `styles.css`.

It includes:

* color palette
* typography scale
* spacing system
* component styles
* utility classes

The styling system integrates with **TailwindCSS** for responsive layout utilities.

---

# Testing

Testing is implemented using:

```
Vitest
Angular Test Runner
```

Run tests:

```
npm test
```

---

# Code Formatting

Code formatting rules are defined in:

```
.prettierrc
.editorconfig
```

This ensures consistent formatting across contributors.

---

# Development Notes

Important implementation details:

* MongoDB connections are cached in serverless functions to prevent reconnection overhead.
* Passwords are hashed using bcrypt before being stored.
* Product images are normalized to ensure correct asset paths.
* Angular services manage application state through RxJS.

---

# Future Improvements

Possible enhancements include:

* Payment gateway integration
* Admin product dashboard
* Image upload system
* Wishlist functionality
* JWT authentication
* Product search and filters
* Pagination
* Reviews and ratings
* Order tracking

---

# Authors

Developed as part of an academic full-stack web development project.

Team: **ThriftHub Development Team**

---

# License

This project is created for academic purposes.

---

# Acknowledgements

Technologies used in this project:

* Angular
* MongoDB
* Netlify
* TailwindCSS
* Node.js

---

# Screenshots

(Add screenshots of the application UI here)

Example:

```
Home Page
Catalog Page
Cart Page
Checkout Page
```

---

# Final Notes

ThriftHub demonstrates how modern web technologies can be combined to create a **scalable, serverless full-stack e-commerce application**.

The project emphasizes:

* modular architecture
* maintainable code
* scalable backend infrastructure
* modern frontend practices
