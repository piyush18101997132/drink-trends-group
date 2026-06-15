# drink-india 🥤
### Prestige Heritage Indian Beverages E-Commerce & Management Platform

**drink-india** is a premium, high-density, full-stack e-commerce enterprise solution engineered for distributing, curating, and governing traditional Indian elite beverages (*Mango Saffron Lassi*, *Kulhad Masala Chai*, *Royal Thandai*, *Kokum Sherbet*). 

The platform implements a complete, zero-lockout **Role-Based Access Control (RBAC)** architecture enabling User Customer, Store Content Admin, and System Superadmin control rooms. It utilizes a resilient double-tier database design configured for instant sandboxed local fallback (in-memory state machine) with dynamic auto-routing to production-grade **MySQL** clusters.

---

## 📂 Project Directory Structure

The structure enforces a strict separation of concerns, housing all modular components in neat directories:

```
drink-india/
├── assets/                     # Shared static media, brand design layouts, design vectors
│   └── beverages/              # Mock collections & asset backups
│       └── thandai_mock.jpg
├── dist/                       # Bundled static client and compiled server distribution output
├── public/                     # Static public assets (Vite assets, system launcher icons)
├── server.ts                   # Core Node.js Express server with integrated Vite middleware
├── src/                        # Full Frontend React workspace
│   ├── App.tsx                 # Base controller linking authentication, cart, alerts, and routing
│   ├── index.css               # Global tailwind directive and font configurations
│   ├── main.tsx                # Client-side mounting routine
│   ├── types.ts                # Strict models typing declarations (Products, Users, Orders, Logs)
│   └── components/             # Granular visual panels
│       ├── Navbar.tsx          # Store header with authentication indicators and role selectors
│       ├── UserDashboard.tsx   # Premium shopper catalog, cart drawer slides, tax calculator
│       ├── AdminDashboard.tsx  # Curation panel, inventories editor, order fulfillment pipeline
│       └── SuperadminDashboard.tsx # Platform settings cockpit, access manager, audit log shell
├── .env.example                # Blueprint file listing environmental configurations
├── index.html                  # Core HTML file embedding client entry-point
├── tsconfig.json               # Full compiler tuning for TypeScript ESM resolving
└── vite.config.ts              # Vite configurations binding custom server alias routing
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

The system maps capabilities to privileges strictly:

| Role Level | Intended User | Core Permissions & Capabilities | Preset Demo Account |
| :--- | :--- | :--- | :--- |
| **User (Customer)** | Standard Shopper | Browse catalog, filter prices, manipulate shopping cart, checkout via simulated payment pipelines, track personal historical orders. | `user@drinkindia.com` <br/> *Password: `user123`* |
| **Admin** | Inventory Manager | Add, modify, or delete drink profiles (volume size, stocks, categoric attributes, pictures); manage user orders fulfillment states. | `admin@drinkindia.com` <br/> *Password: `admin123`* |
| **Superadmin** | Executive Director | Global policy toggles (open/close storefront, maintenance modes, GST tax ratios, minimum shipping requirements); user list elevations (elevate to admin, demote actions); read live raw security logstreams; diagnostic database audits. | `superadmin@drinkindia.com` <br/> *Password: `super123`* |

---

## ⚡ Performance, Caching & Scalability Strategies

To ensure sub-second rendering bounds across millions of persistent operations at physical volume scale, the system is designed with horizontal distribution patterns:

1. **Database Connection Pool**: The database abstraction layer configures `mysql2/promise` with robust connection boundaries, recycling database threads instantly (`connectionLimit: 10`) to eliminate handshake latencies.
2. **Read-Heavy Query Optimizations**: Recommended query structures index frequently searched attributes.
3. **Lazy Loading UI Assets**: Images feature optimized dimensions, responsive scaling, and are fetched asynchronously.
4. **GST Tax & Pricing computation**: Financial values are calculated instantly client-side using parameters served directly from Superadmin global states, ensuring zero latency on shopping operations.

---

## 🗄️ Database Architecture & Initialization

The backend is fully compatible with standard **MySQL (v8.0+)** configurations. In production, run the following script to instantiate tables with indexes optimized for scalable e-commerce:

```sql
CREATE DATABASE IF NOT EXISTS drink_india CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE drink_india;

-- Users Identity
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
  status ENUM('active', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Products Catalog
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(512),
  stock INT DEFAULT 0,
  volume VARCHAR(50),
  sales_count INT DEFAULT 0,
  INDEX idx_category (category),
  INDEX idx_sales (sales_count DESC)
) ENGINE=InnoDB;

-- Orders & Logistics Transaction
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Security Audit logs trace
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp DESC)
) ENGINE=InnoDB;
```

---

## 🌐 API Endpoint Specifications

All data pathways require headers forwarding validation states. Here are the core endpoint layouts:

### Authentication Suite
- `POST /api/auth/login` - Authenticate logins. Returns Token wrapper and safe User object.
- `POST /api/auth/register` - Create customer credentials profiles. Returns safe User details.

### Catalog Management
- `GET /api/products` - Return active beverage products catalog.
- `POST /api/products` - *[Admin+ Only]* Append a legacy drink to search queues.
- `PUT /api/products/:id` - *[Admin+ Only]* Edit inventories or pricing tags.
- `DELETE /api/products/:id` - *[Admin+ Only]* Excise drink item from archives.

### Order Logistics
- `POST /api/orders` - Place checkout carts. Handles stocks depletion and raises transaction tags.
- `GET /api/orders` - Pull personal order histories (Customers) or complete transaction registers (Admins+).
- `PUT /api/orders/:id/status` - *[Admin+ Only]* Cycle order states through `pending`, `processing`, `completed`, `cancelled`.

### Administrative Control & Integrity
- `GET /api/system/settings` - *[Admin+ Only]* Load operational configurations.
- `PUT /api/system/settings` - *[Superadmin Only]* Toggle shop status, set tax rate ratios, or control minimum shipping bounds.
- `GET /api/system/logs` - *[Superadmin Only]* Stream raw chronological security audit logs.
- `GET /api/users` - *[Superadmin Only]* List all system users registered in database tables.
- `PUT /api/users/:id/role` - *[Superadmin Only]* Alter roles elevation instantly.
- `PUT /api/users/:id/status` - *[Superadmin Only]* Instantly suspend user operations.

---

## 🚀 Setting Up & Executing the Engine

Follow these unified blocks to install, compile and deploy the platform locally:

### 1. Prerequisites & Clone
Install **Node.js (v18.0+)**, **npm (v9.0+)**, and **MySQL (v8.0+)**.
Clone the repository and jump into the workspace:
```bash
git clone https://github.com/your-username/drink-india.git
cd drink-india
```

### 2. File Variables Allocation
Establish a dynamic configuration file:
```bash
cp .env.example .env
```
Populate variables with relevant connection parameters:
```env
PORT=3000
NODE_ENV=development

# MySQL Configurations
DB_HOST="YOUR_MYSQL_HOST_IP_OR_LOCALHOST"
DB_PORT="3306"
DB_USER="YOUR_DATABASE_USERNAME"
DB_PASSWORD="YOUR_DATABASE_SECURE_PASSWORD"
DB_NAME="drink_india"
```

### 3. Installation of Packages
Initialize node modules and compile type dependencies:
```bash
npm install
```

### 4. Booting the Developer Server
With our compiled Express + Vite model, a single cohesive command boots the backend and sets up the server-side proxy middleware on Port `3000`:
```bash
npm run dev
```

Visit the applet dynamically on: `http://localhost:3000`

---

## ⚙️ Production Builds & Deployments

To prepare, packetize, and run of the platform inside production:

### 1. Compile Assets & Bundle CJS
Run the native compiler script to compress frontend static bundles into `dist/` and pack the server-side code into CJS using `esbuild` for fast, frictionless startup performance:
```bash
npm run build
```

### 2. Standalone Launch
Boot the self-contained Express production build:
```bash
npm run start
```

---

## 🏗️ Production Hosting & Infrastructure Specs Guide

For robust production rollouts, the following infrastructure bounds are recommended:

### recommended Server Types & Specifications
- **Cloud Computing**: VPS or container containers (e.g. AWS Lightsail / EC2, DigitalOcean Basic droplet, Google Cloud Run).
- **Minimum Processing Specs**:
  - **CPU**: 1 vCPU (2 vCPUs recommended for multi-threaded transaction sessions).
  - **Memory/RAM**: 1 GB RAM minimum (2 GB highly recommended).
  - **Disk/Storage Requirements**: 20 GB SSD minimum (allow expansion bounds depending on product image storage).

### Database Hosting & Scaling
- **Hosting**: Standard managed database instances are highly recommended to control replication safety (e.g. AWS RDS MySQL, DigitalOcean Managed Database, Google Cloud SQL).
- **Backups**: Enact daily automated point-in-time recovery logs (PITR) with a minimum 7-day retention period.

---

*Authentic Premium Refreshment - Engineered and Crafted for Scale.*
