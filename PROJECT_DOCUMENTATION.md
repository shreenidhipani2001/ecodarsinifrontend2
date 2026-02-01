# EcoDarshini - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Frontend Documentation](#frontend-documentation)
5. [Backend Documentation](#backend-documentation)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Authentication Flow](#authentication-flow)
9. [Payment Integration](#payment-integration)
10. [Setup & Installation](#setup--installation)
11. [Environment Variables](#environment-variables)
12. [Key Features](#key-features)

---

## Project Overview

**EcoDarshini** is a full-stack e-commerce platform designed for showcasing and selling artisanal/eco-friendly products. The application features a unique flipbook-style product catalog, role-based access control (Admin/User), integrated payment processing via Razorpay, and real-time order tracking with geolocation support.

### Key Highlights
- Interactive flipbook product browsing experience
- Role-based dashboards (Admin & User)
- Razorpay payment gateway integration
- Real-time order tracking with OpenStreetMap geocoding
- Cloudinary-based image management
- JWT-based authentication with refresh tokens

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.5 | React framework with SSR |
| React | 18.3.1 | UI library |
| TypeScript | - | Type-safe development |
| Tailwind CSS | 4.0 | Utility-first styling |
| Zustand | 5.0.10 | State management |
| react-pageflip | 2.0.3 | Flipbook component |
| react-hot-toast | 2.6.0 | Toast notifications |
| lucide-react | 0.562.0 | Icon library |
| next-cloudinary | 6.17.5 | Image optimization |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5.2.1 | REST API framework |
| Node.js | - | Runtime environment |
| PostgreSQL | - | Database (via Neon) |
| Prisma | 6.19.2 | ORM (schema only) |
| pg | 8.17.1 | PostgreSQL client |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcrypt | 6.0.0 | Password hashing |
| Razorpay | 2.9.6 | Payment processing |
| Cloudinary | 1.41.3 | Image storage |
| Multer | 2.0.2 | File uploads |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Components  │  │    State (Zustand)      │  │
│  │  /          │  │ LoginForm   │  │  useAuthStore           │  │
│  │  /admin     │  │ CartModal   │  │  - user                 │  │
│  │  /dashboard │  │ WishlistModal│ │  - isAuthenticated      │  │
│  └─────────────┘  │ ProfileModal │  └─────────────────────────┘  │
│                   │ ProductModal │                               │
│  ┌─────────────┐  │ TrackOrder   │  ┌─────────────────────────┐  │
│  │ Middleware  │  │ RoleGuard    │  │     API Layer (/lib)    │  │
│  │ (auth)      │  └─────────────┘  │  auth, cart, order,     │  │
│  └─────────────┘                    │  review, wishlist, etc. │  │
│                                     └─────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP (localhost:3004)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │ Controllers │  │     Middleware          │  │
│  │ /api/users  │  │ userCtrl    │  │  - CORS                 │  │
│  │ /api/products│ │ productCtrl │  │  - JSON parser          │  │
│  │ /api/cart   │  │ cartCtrl    │  │  - Cookie parser        │  │
│  │ /api/orders │  │ orderCtrl   │  │  - authMiddleware       │  │
│  │ /api/payments│ │ paymentCtrl │  │  - Multer (uploads)     │  │
│  │ /api/track  │  │ trackingCtrl│  └─────────────────────────┘  │
│  └─────────────┘  └─────────────┘                               │
│                                     ┌─────────────────────────┐  │
│  ┌─────────────┐  ┌─────────────┐  │      Utilities          │  │
│  │    Utils    │  │   Config    │  │  - JWT generation       │  │
│  │  jwt.js     │  │ multer.js   │  │  - Nominatim geocoding  │  │
│  │  nominatim  │  │ cloudinary  │  │  - PayloadCMS images    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │   Cloudinary    │ │    Razorpay     │
│   (Neon Cloud)  │ │  (Image CDN)    │ │   (Payments)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Frontend Documentation

### Directory Structure

```
ecoDarsiniFrontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ��── page.js                   # Login page (/)
│   │   ├── layout.js                 # Root layout with Toaster
│   │   ├── globals.css               # Global styles
│   │   ├── middleware.ts             # Auth middleware
│   │   ├── admin/                    # Admin dashboard
│   │   │   └── page.tsx
│   │   ├── dashboard/                # User dashboard
│   │   │   └── page.tsx
│   │   └── api/auth/refresh/         # Token refresh endpoint
│   │
│   ├── components/                   # React components
│   │   ├── LoginForm.jsx             # Login interface
│   │   ├── RoleGuard.tsx             # Route protection
│   │   ├── BaseModal.tsx             # Reusable modal container
│   │   ├── CartModal.tsx             # Shopping cart
│   │   ├── WishlistModal.tsx         # Wishlist management
│   │   ├── ProfileModal.tsx          # User profile
│   │   ├── ProductDetailModal.tsx    # Product details
│   │   └── TrackOrderModal.tsx       # Order tracking
│   │
│   ├── components/admin/             # Admin-specific components
│   │   ├── Sidebar.tsx               # Admin navigation
│   │   ├── ProductsCatalogue.tsx     # Product flipbook
│   │   ├── OrdersGrid.tsx            # Orders display
│   │   ├── PaymentsList.tsx          # Payments list
│   │   ├── ReviewsGrid.tsx           # Reviews management
│   │   ├── OrderTrackingGrid.tsx     # Tracking management
│   │   ├── UsersGrid.tsx             # User management
│   │   └── DashboardGrid.tsx         # Dashboard stats
│   │
│   ├── store/
│   │   └── useAuthStore.ts           # Zustand auth store
│   │
│   └── types/                        # TypeScript definitions
│
├── lib/                              # API integration layer
│   ├── api.ts                        # Base API handler
│   ├── auth.ts                       # Authentication API
│   ├── cartApi.ts                    # Cart operations
│   ├── orderApi.ts                   # Order operations
│   ├── reviewApi.ts                  # Review operations
│   ├── addressApi.ts                 # Address operations
│   ├── userApi.ts                    # User operations
│   ├── wishlistApi.ts                # Wishlist operations
│   └── cloudinary.ts                 # Image utilities
│
├── public/
│   └── svg/                          # SVG assets
│
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.mjs
```

### Components Reference

#### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| LoginForm | `src/components/LoginForm.jsx` | Email/password authentication with role-based routing |
| RoleGuard | `src/components/RoleGuard.tsx` | Protects routes based on user role (ADMIN/USER) |
| BaseModal | `src/components/BaseModal.tsx` | Reusable modal wrapper component |
| CartModal | `src/components/CartModal.tsx` | Shopping cart with Razorpay integration |
| WishlistModal | `src/components/WishlistModal.tsx` | Wishlist item management |
| ProfileModal | `src/components/ProfileModal.tsx` | User profile editing |
| ProductDetailModal | `src/components/ProductDetailModal.tsx` | Full product information display |
| TrackOrderModal | `src/components/TrackOrderModal.tsx` | Real-time order tracking with location |

#### Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `src/components/admin/Sidebar.tsx` | Admin navigation (6 sections) |
| ProductsCatalogue | `src/components/admin/ProductsCatalogue.tsx` | Interactive flipbook product view |
| OrdersGrid | `src/components/admin/OrdersGrid.tsx` | Orders management grid |
| PaymentsList | `src/components/admin/PaymentsList.tsx` | Payment transactions list |
| ReviewsGrid | `src/components/admin/ReviewsGrid.tsx` | Product reviews moderation |
| OrderTrackingGrid | `src/components/admin/OrderTrackingGrid.tsx` | Delivery tracking management |
| UsersGrid | `src/components/admin/UsersGrid.tsx` | User CRUD operations |
| DashboardGrid | `src/components/admin/DashboardGrid.tsx` | Dashboard statistics |

### State Management (Zustand)

```typescript
// src/store/useAuthStore.ts

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  name?: string;
  phone?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

// Persisted to localStorage with key "auth-store"
```

### Routing Structure

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | `page.js` | Public | Login page |
| `/admin` | `admin/page.tsx` | ADMIN only | Admin dashboard |
| `/dashboard` | `dashboard/page.tsx` | USER only | User dashboard |

### API Layer

All API functions are located in `/lib/` directory:

```typescript
// Base API configuration (lib/api.ts)
const API_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:3004
// All requests include credentials: "include" for cookie-based auth
```

---

## Backend Documentation

### Directory Structure

```
ecodarshinibackend/
├── index.js                          # Main entry point
├── package.json                      # Dependencies
├── .env                              # Environment variables
│
├── routes/                           # Route definitions
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── reviewRoutes.js
│   ├── wishRoutes.js
│   ├── categoryRoutes.js
│   ├── orderTrackingRoutes.js
│   ├── addressRoutes.js
│   └── uploadRoutes.js
│
├── controllers/                      # Business logic
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── wishlistController.js
│   ├── categoryController.js
│   ├── orderTrackingController.js
│   ├── addressController.js
│   └── uploadController.js
│
├── middlewares/
│   └── authMiddleware.js             # JWT verification
│
├── utils/
│   ├── jwt.js                        # Token generation
│   ├── nominatim.js                  # Geocoding helper
│   └── payloadCMS.js                 # Image management
│
├── config/
│   └── multerCloudinary.js           # File upload config
│
├── cms/
│   └── cloudinary.js                 # Cloudinary SDK setup
│
├── db/
│   ├── pgClient.js                   # PostgreSQL connection
│   └── migrations.sql                # Database schema
│
└── prisma/
    ├── schema.prisma                 # Prisma schema
    └── migrations.sql                # SQL migrations
```

### Middleware Stack

```javascript
// Applied in order in index.js
1. cors({ origin: "http://localhost:3000", credentials: true })
2. express.json()
3. cookieParser()
4. authMiddleware (route-specific)
5. multer (file upload routes)
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │   CATEGORIES    │
├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │
│ name            │       │ name            │
│ email (unique)  │       │ slug (unique)   │
│ password_hash   │       │ cms_image_id    │
│ phone           │       │ created_at      │
│ role (ENUM)     │       └────────┬────────┘
│ created_at      │                │
└────────┬────────┘                │
         │                         │
         │    ┌────────────────────┘
         │    │
         ▼    ▼
┌─────────────────────────────────────────┐
│               PRODUCTS                   │
├─────────────────────────────────────────┤
│ id (UUID) PK                            │
│ name, slug (unique)                     │
│ description, price, stock               │
│ category_id FK → categories             │
│ cms_image_ids (JSONB)                   │
│ artist_name, is_active                  │
│ added_by FK → users                     │
│ bought_by FK → users                    │
│ created_at                              │
└─────────────────────────────────────────┘
         │
         │
    ┌────┴────┬────────────┬─────────────┐
    │         │            │             │
    ▼         ▼            ▼             ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌───────────┐
│ CART   │ │WISHLIST│ │REVIEWS │ │ORDER_ITEMS│
│ ITEMS  │ │ ITEMS  │ │        │ │           │
├────────┤ ├────────┤ ├────────┤ ├───────────┤
│ id PK  │ │ id PK  │ │ id PK  │ │ id PK     │
│ user_id│ │ user_id│ │ user_id│ │ order_id  │
│ prod_id│ │ prod_id│ │ prod_id│ │ product_id│
│quantity│ │created │ │ rating │ │ price     │
└────────┘ └────────┘ │ comment│ │ quantity  │
                      └────────┘ └─────┬─────┘
                                       │
                                       ▼
┌─────────────────┐           ┌─────────────────┐
│    ADDRESSES    │           │     ORDERS      │
├─────────────────┤           ├─────────────────┤
│ id (UUID) PK    │           │ id (UUID) PK    │
│ user_id FK      │           │ user_id FK      │
│ address_line1   │           │ total_amount    │
│ city, state     │           │ status (ENUM)   │
│ pincode         │           │ payment_id      │
│ country         │           │ product_id      │
└─────────────────┘           │ created_at      │
                              └────────┬────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────┐
         │                             │                     │
         ▼                             ▼                     ▼
┌─────────────────┐           ┌─────────────────┐   ┌───────────────┐
│    PAYMENTS     │           │ ORDER_TRACKING  │   │ (via orders)  │
├─────────────────┤           ├─────────────────┤   │ payment_id    │
│ id (UUID) PK    │           │ id (UUID) PK    │   └───────────────┘
│ razorpay_order  │           │ order_id FK     │
│ razorpay_pay    │           │ status (ENUM)   │
│ razorpay_sig    │           │ latitude, long  │
│ amount          │           │ address_display │
│ status (ENUM)   │           │ address_road    │
└─────────────────┘           │ address_city    │
                              │ address_state   │
                              │ osm_id, osm_type│
                              │ notes           │
                              └─────────────────┘
```

### Tables Details

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'USER',  -- ENUM: 'USER', 'ADMIN'
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) CHECK (price >= 0),
  stock INT CHECK (stock >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  cms_image_ids JSONB,  -- Array of Cloudinary image IDs
  artist_name VARCHAR(150),
  is_active BOOLEAN DEFAULT TRUE,
  added_by UUID REFERENCES users(id),
  bought_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) CHECK (total_amount >= 0),
  status order_status DEFAULT 'CREATED',
  -- ENUM: 'CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  payment_id TEXT,
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Order Tracking
```sql
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  status tracking_status,
  -- ENUM: 'ORDER_PLACED', 'PROCESSING', 'PACKED', 'SHIPPED',
  --       'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
  --       'FAILED_DELIVERY', 'RETURNED'
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address_display TEXT,
  address_road VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_country VARCHAR(100),
  address_postcode VARCHAR(20),
  osm_id BIGINT,
  osm_type VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### Base URL
```
http://localhost:3004/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Register new user | No |
| POST | `/users/login` | Login user | No |
| POST | `/users/logout` | Logout user | No |
| POST | `/users/me` | Get current user | No |
| GET | `/users/:id` | Get user by ID | Yes |
| PUT | `/users/:id` | Update user | No |
| DELETE | `/users/:id` | Delete user | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Get all active products | No |
| GET | `/products/:id` | Get product by ID | No |
| POST | `/products` | Upload product with images | No |
| POST | `/products/add` | Create product | No |
| PUT | `/products/:id` | Update product | No |
| DELETE | `/products/:id` | Delete product | Yes |

### Cart Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get all cart items | No |
| GET | `/cart/user/:id` | Get cart by user ID | No |
| GET | `/cart/:id` | Get cart item by ID | No |
| POST | `/cart/add` | Add item to cart | No |
| PATCH | `/cart/:id` | Update cart item quantity | No |
| DELETE | `/cart/:id?userId=` | Remove item from cart | No |

### Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders` | Get all orders | No |
| GET | `/orders/:id` | Get order by ID | No |
| GET | `/orders/user/:userId` | Get orders by user | No |
| POST | `/orders/add` | Create new order | No |
| PUT | `/orders/:id` | Update order | No |
| DELETE | `/orders/:id` | Delete order | No |

### Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/payments` | Get all payments | No |
| GET | `/payments/:id` | Get payment by ID | No |
| POST | `/payments/add` | Create payment record | No |
| POST | `/payments/create-order` | Create Razorpay order | No |
| POST | `/payments/verify` | Verify Razorpay payment | No |
| PUT | `/payments/:id` | Update payment | No |
| DELETE | `/payments/:id` | Delete payment | No |

### Review Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/review` | Get all reviews | No |
| GET | `/review/:id` | Get review by ID | No |
| GET | `/review/review-for-this/:id` | Get reviews for product | No |
| GET | `/review/user/:id` | Get reviews by user | No |
| POST | `/review` | Upload review with images | No |
| POST | `/review/add` | Create review | No |
| PUT | `/review/:id` | Update review | No |
| DELETE | `/review/:id` | Delete review | No |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/wishes` | Get all wishlist items | No |
| GET | `/wishes/:id` | Get wishlist item by ID | No |
| POST | `/wishes/add` | Add to wishlist | No |
| PATCH | `/wishes/:id` | Update wishlist item | No |
| DELETE | `/wishes/:id` | Remove from wishlist | No |

### Category Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Get all categories | No |
| GET | `/categories/:id` | Get category by ID | No |
| POST | `/categories` | Create category | Yes |
| PUT | `/categories/:id` | Update category | Yes |
| DELETE | `/categories/:id` | Delete category | Yes |

### Order Tracking Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/track` | Get all tracking entries | No |
| GET | `/track/my/:userId` | Get user's tracking | No |
| GET | `/track/order/:orderId` | Get order tracking history | No |
| GET | `/track/order/:orderId/current` | Get current status | No |
| POST | `/track/add` | Add tracking (coordinates) | No |
| POST | `/track/add-with-address` | Add tracking (address text) | No |
| PUT | `/track/:id` | Update tracking | No |
| DELETE | `/track/:id` | Delete tracking | No |

### Upload Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/uploads/products` | Upload product images | Yes |

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User enters email/password in LoginForm                      │
│                          │                                       │
│                          ▼                                       │
│  2. POST /api/users/login                                        │
│     Body: { email, password }                                    │
│                          │                                       │
│                          ▼                                       │
│  3. Backend validates credentials                                │
│     - Finds user by email                                        │
│     - Compares password hash (bcrypt)                            │
│     - Generates JWT tokens                                       │
│                          │                                       │
│                          ▼                                       │
│  4. Response includes userId, email, role                        │
│     Cookies set: accessToken (15min), refreshToken (7days)       │
│                          │                                       │
│                          ▼                                       │
│  5. Frontend fetches full user profile                           │
│     GET /api/users/{userId}                                      │
│                          │                                       │
│                          ▼                                       │
│  6. Zustand store updated with user data                         │
│     Persisted to localStorage                                    │
│                          │                                       │
│                          ▼                                       │
│  7. Router redirects based on role                               │
│     ADMIN → /admin                                               │
│     USER  → /dashboard                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    ROUTE PROTECTION                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Next.js Middleware (middleware.ts)                              │
│  ├── Checks for accessToken cookie                               │
│  ├── Protected routes: /dashboard, /admin                        │
│  └── Redirects to / if no token                                  │
│                                                                  │
│  RoleGuard Component                                             │
│  ├── Verifies user role matches required role                    │
│  ├── ADMIN can access /admin                                     │
│  ├── USER can access /dashboard                                  │
│  └── Redirects on role mismatch                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```javascript
// Access Token (15 minutes)
{
  id: "user-uuid",
  email: "user@example.com",
  role: "USER" | "ADMIN",
  iat: timestamp,
  exp: timestamp + 15min
}

// Refresh Token (7 days)
{
  id: "user-uuid",
  email: "user@example.com",
  role: "USER" | "ADMIN",
  iat: timestamp,
  exp: timestamp + 7days
}
```

---

## Payment Integration

### Razorpay Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      PAYMENT FLOW                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Checkout" in CartModal                          │
│                          │                                       │
│                          ▼                                       │
│  2. Frontend calls POST /api/payments/create-order               │
│     Body: { amount }  (in rupees)                                │
│                          │                                       │
│                          ▼                                       │
│  3. Backend creates Razorpay order                               │
│     - Converts amount to paise (× 100)                           │
│     - Returns order_id, amount, currency                         │
│                          │                                       │
│                          ▼                                       │
│  4. Frontend opens Razorpay checkout modal                       │
│     - Loads Razorpay script dynamically                          │
│     - Passes order details                                       │
│                          │                                       │
│                          ▼                                       │
│  5. User completes payment in Razorpay                           │
│                          │                                       │
│                          ▼                                       │
│  6. Razorpay returns payment response                            │
│     { razorpay_order_id, razorpay_payment_id, razorpay_signature}│
│                          │                                       │
│                          ▼                                       │
│  7. Frontend calls POST /api/payments/verify                     │
│     Body: { razorpay_order_id, razorpay_payment_id,              │
│             razorpay_signature }                                 │
│                          │                                       │
│                          ▼                                       │
│  8. Backend verifies signature                                   │
│     HMAC-SHA256(order_id + "|" + payment_id, secret)             │
│                          │                                       │
│                          ▼                                       │
│  9. If valid, payment record created with status SUCCESS         │
│     Order status updated to PAID                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Cloudinary account
- Razorpay account (test mode for development)

### Frontend Setup

```bash
# Navigate to frontend directory
cd ecoDarsiniFrontend

# Install dependencies
npm install

# Create .env.local file with required variables
# (see Environment Variables section)

# Run development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd ecodarshinibackend

# Install dependencies
npm install

# Create .env file with required variables
# (see Environment Variables section)

# Run database migrations
# Execute db/migrations.sql in your PostgreSQL database

# Run development server
npm run dev
```

### Running Both Services

```bash
# Terminal 1 - Backend (port 3004)
cd ecodarshinibackend && npm run dev

# Terminal 2 - Frontend (port 3000)
cd ecoDarsiniFrontend && npm run dev
```

---

## Environment Variables

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_NAME=your_cloudinary_name
CMS_API_KEY=your_cloudinary_api_key
CMS_API_SECRET=your_cloudinary_api_secret
```

### Backend (.env)

```env
# Server Configuration
PORT=3004

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_NAME=your_cloudinary_name
CMS_API_KEY=your_cloudinary_api_key
CMS_API_SECRET=your_cloudinary_api_secret

# Payload CMS (optional)
PAYLOAD_URL=http://localhost:3001
```

---

## Key Features

### User Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Email/password login with JWT tokens |
| **Product Browsing** | Interactive flipbook catalog with page navigation |
| **Shopping Cart** | Add/remove items, view totals, proceed to checkout |
| **Wishlist** | Save favorite products for later |
| **Order Tracking** | Real-time delivery status with location tracking |
| **Profile Management** | View and edit user information |
| **Payment** | Secure checkout via Razorpay |

### Admin Features

| Feature | Description |
|---------|-------------|
| **Product Management** | CRUD operations for products with image uploads |
| **Order Management** | View and manage all customer orders |
| **Payment Monitoring** | Track payment transactions and statuses |
| **Review Moderation** | View and manage customer reviews |
| **User Management** | Manage user accounts and roles |
| **Order Tracking** | Update delivery status with location |
| **Category Management** | Organize products into categories |

### Technical Features

| Feature | Description |
|---------|-------------|
| **Role-Based Access** | Separate dashboards for Admin and User |
| **JWT Authentication** | Secure token-based auth with refresh tokens |
| **Image CDN** | Cloudinary integration for optimized images |
| **Geolocation** | OpenStreetMap/Nominatim for address lookup |
| **State Persistence** | Zustand with localStorage persistence |
| **Responsive Design** | Tailwind CSS for mobile-friendly UI |

---

## Project Statistics

### Frontend
- **Total Components:** 19+
- **API Modules:** 8
- **Pages:** 3 (/, /admin, /dashboard)
- **State Stores:** 1 (useAuthStore)

### Backend
- **API Routes:** 11 route files
- **Controllers:** 11 controller files
- **Database Tables:** 11
- **Utility Modules:** 3

---

## Color Scheme & Design

### Primary Colors
- **Primary Green:** #16a34a, #22c55e, #4ade80
- **Dark Background:** gray-900, black
- **Status Colors:**
  - Blue: Processing
  - Yellow: Packed
  - Orange: Shipped
  - Purple: In Transit
  - Cyan: Out for Delivery
  - Green: Delivered
  - Red: Failed/Cancelled

### Custom Animations
- `greenBorderRun` - Animated gradient border
- `greenShift` - Green color shifting animation

---

## License

This project is proprietary and confidential.

---

*Documentation generated on January 26, 2026*
