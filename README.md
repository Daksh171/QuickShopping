# QuickBasket 🛒

A full-stack MERN grocery delivery application inspired by Blinkit and Zepto, featuring a distinctive **Neo-Brutalist** design system with bold typography, thick black borders, hard shadows, and vibrant yellow accents.

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS v4         |
| Backend   | Express 5, TypeScript, Mongoose, Zod                |
| Database  | MongoDB (local or Atlas)                            |
| Auth      | JWT (HttpOnly cookies), bcrypt                      |
| Dev Tools | Docker Compose, ESLint, Prettier                    |

## Features

- 🔐 Secure authentication (signup, login, logout) with HttpOnly JWT cookies
- 📦 Product catalog with search, filtering, sorting, and pagination
- 🗂️ Category-based browsing (9 categories, 33+ products)
- 🛒 Real-time shopping cart with stock validation
- 💳 Checkout flow with idempotent order creation (MongoDB transactions)
- 📋 Order history with item snapshots
- 🎨 Neo-Brutalist UI design system
- 🏥 Health check endpoints (liveness & readiness)
- 🔒 Security: Helmet, CORS, rate limiting, request ID tracing

## Project Structure

```
QuickBasket/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment validation (Zod)
│   │   ├── db/             # MongoDB connection & seed script
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas (User, Product, Cart, Order, Category)
│   │   └── modules/        # Route modules (auth, products, cart, orders, health)
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, LoadingSpinner
│   │   ├── contexts/       # AuthContext, CartContext
│   │   ├── lib/            # Axios API client
│   │   ├── pages/          # All page components
│   │   └── types/          # TypeScript interfaces
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js ≥ 18
- MongoDB (local install or Atlas connection string)

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Copy the example and edit
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quickbasket
JWT_SECRET=your-secret-here
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed the database

```bash
cd backend
npx ts-node src/db/seed.ts
```

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** — the Vite dev server proxies `/api` requests to the backend on port 5000.

### Docker Compose (alternative)

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint               | Auth | Description                    |
| ------ | ---------------------- | ---- | ------------------------------ |
| POST   | `/api/auth/signup`     | No   | Register a new user            |
| POST   | `/api/auth/login`      | No   | Login and set JWT cookie       |
| POST   | `/api/auth/logout`     | Yes  | Clear JWT cookie               |
| GET    | `/api/auth/me`         | Yes  | Get current user profile       |
| GET    | `/api/categories`      | No   | List all categories            |
| GET    | `/api/products`        | No   | List products (search/filter)  |
| GET    | `/api/products/:id`    | No   | Get product by ID              |
| GET    | `/api/products/slug/:s`| No   | Get product by slug            |
| GET    | `/api/cart`            | Yes  | Get user's cart                |
| POST   | `/api/cart/items`      | Yes  | Add item to cart               |
| PATCH  | `/api/cart/items/:id`  | Yes  | Update cart item quantity       |
| DELETE | `/api/cart/items/:id`  | Yes  | Remove item from cart          |
| POST   | `/api/orders`          | Yes  | Place an order (with idempotency) |
| GET    | `/api/orders`          | Yes  | Get order history              |
| GET    | `/api/orders/:id`      | Yes  | Get order by ID                |
| GET    | `/api/health/live`     | No   | Liveness probe                 |
| GET    | `/api/health/ready`    | No   | Readiness probe                |

## License

MIT
