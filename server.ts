import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';

const logger = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Check if actual MySQL config is available
const hasMySQLConfig = !!(
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_NAME
);

console.log(`[Database Setup] MySQL config checked. Found config: ${hasMySQLConfig}`);

// Seed dataset
let inMemoryUsers = [
  { id: 1, name: 'Aarav Sharma', email: 'user@drinkindia.com', password: 'user123', role: 'user', createdAt: '2026-06-01T10:00:00Z', status: 'active' },
  { id: 2, name: 'Priya Iyer', email: 'admin@drinkindia.com', password: 'admin123', role: 'admin', createdAt: '2026-05-15T09:30:00Z', status: 'active' },
  { id: 3, name: 'Rajesh Nair', email: 'superadmin@drinkindia.com', password: 'super123', role: 'superadmin', createdAt: '2026-04-10T08:00:00Z', status: 'active' }
];

let inMemoryProducts = [
  { id: 1, name: 'Mango Saffron Lassi', description: 'Creamy traditional yogurt beverage blended with sweet Kesar mangoes and pure Himalayan saffron strands.', price: 120, category: 'Lassis & Yogurt', imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=600', stock: 45, volume: '350ml', salesCount: 142 },
  { id: 2, name: 'Kulhad Masala Chai', description: 'Strong brewed organic CTC Assam tea leaves infused with hand-crushed green cardamom, cinnamon, cloves, and ginger.', price: 60, category: 'Hot Beverages', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600', stock: 120, volume: '200ml', salesCount: 389 },
  { id: 3, name: 'Kashmiri Almond Thandai', description: 'Royal heritage milk blend infused with rich almond paste, fennel seeds, watermelon seeds, saffron, and fresh rose petals.', price: 160, category: 'Royal Shakes', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', stock: 30, volume: '400ml', salesCount: 95 },
  { id: 4, name: 'Tangy Coastal Kokum Sherbet', description: 'Vibrant sweet, sour, and refreshing drink prepared from natural kokum rinds, roasted cumin, and black rock salt.', price: 90, category: 'Coolers & Sherbets', imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600', stock: 75, volume: '300ml', salesCount: 164 },
  { id: 5, name: 'Shahi Pudina Jaljeera', description: 'Chilled tangy and spicy digestif crafted with freshly squeezed mint extract, tamarind paste, and a blend of secret spices.', price: 70, category: 'Coolers & Sherbets', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600', stock: 90, volume: '300ml', salesCount: 220 },
  { id: 6, name: 'Mogra Almond Milk', description: 'Exquisite chilled cow milk perfumed with Mogra flower distillate, sweetened with organic honey and rich almond paste.', price: 140, category: 'Royal Shakes', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600', stock: 25, volume: '400ml', salesCount: 48 }
];

let inMemoryOrders = [
  { id: 1001, userId: 1, userName: 'Aarav Sharma', userEmail: 'user@drinkindia.com', items: [{ productId: 1, productName: 'Mango Saffron Lassi', price: 120, quantity: 2 }, { productId: 2, productName: 'Kulhad Masala Chai', price: 60, quantity: 1 }], totalAmount: 300, status: 'processing', shippingAddress: 'Flat 405, Nilgiri Heights, Bandra West, Mumbai, MH - 400050', phone: '+91 98765 43210', createdAt: '2026-06-12T14:32:00Z' },
  { id: 1002, userId: 1, userName: 'Aarav Sharma', userEmail: 'user@drinkindia.com', items: [{ productId: 4, productName: 'Tangy Coastal Kokum Sherbet', price: 90, quantity: 1 }], totalAmount: 90, status: 'completed', shippingAddress: 'Flat 405, Nilgiri Heights, Bandra West, Mumbai, MH - 400050', phone: '+91 98765 43210', createdAt: '2026-06-10T11:15:00Z' }
];

let inMemorySystemSettings = {
  storeOpen: true,
  maintenanceMode: false,
  taxRate: 0.18, // 18% GST standard
  enableRewards: true,
  minOrderValue: 150
};

let inMemoryAuditLogs = [
  { id: 1, userId: 3, userName: 'Rajesh Nair', userRole: 'superadmin', action: 'SYSTEM_STARTUP', details: 'Web server booted and local database driver fallback initialized.', ipAddress: '127.0.0.1', timestamp: '2026-06-15T02:00:00Z' },
  { id: 2, userId: 2, userName: 'Priya Iyer', userRole: 'admin', action: 'UPDATE_STOCK', details: 'Updated stock count for Mogra Almond Milk to 25 bottles.', ipAddress: '192.168.1.10', timestamp: '2026-06-14T17:40:00Z' }
];

// Database Pool Connection (attempts to bridge to real MySQL if DB parameters are configured)
let pool: mysql.Pool | null = null;
if (hasMySQLConfig) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('[MySQL] Connection Pool successfully configured and initialized.');
  } catch (err) {
    console.error('[MySQL Error] Could not connect to the remote MySQL server:', err);
  }
}

// Function to perform basic migration checks inside the MySQL connection if configured
async function initializeMySQLTables() {
  if (!pool) return;
  try {
    const conn = await pool.getConnection();
    console.log('[MySQL Connection] Successfully obtained handle from connection pool.');
    
    // Create Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
        status ENUM('active', 'suspended') DEFAULT 'active',
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create Products table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url VARCHAR(512),
        stock INT DEFAULT 0,
        volume VARCHAR(50),
        sales_count INT DEFAULT 0
      ) ENGINE=InnoDB;
    `);

    // Create Orders table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create Audit Logs table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Log successfully created tables
    console.log('[MySQL Migration] Tables initialized/connected seamlessly.');
    conn.release();
  } catch (err) {
    console.error('[MySQL Setup Fail] Migration could not complete. Reverting completely to robust in-memory database mode:', err);
    pool = null; // Forces fallback to in-memory mode for frictionless playground demonstration
  }
}

initializeMySQLTables();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Helper function to log user actions dynamically
  const logAudit = (userId: number, userName: string, role: string, action: string, details: string, reqIp?: string) => {
    const ip = reqIp || '127.0.0.1';
    const newLog = {
      id: inMemoryAuditLogs.length + 1,
      userId,
      userName,
      userRole: role as any,
      action,
      details,
      ipAddress: ip,
      timestamp: new Date().toISOString()
    };
    inMemoryAuditLogs.unshift(newLog);
    console.log(`[AUDIT LOG] ${role.toUpperCase()} ${userName} performed: ${action} (${details})`);
  };

  // --- API ROUTES ---

  /**
   * AUTHENTICATION & LOGIN
   */
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    let user: any = inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user && pool) {
      try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query(
          'SELECT id, name, email, password, role, status, phone, address, created_at AS createdAt FROM users WHERE email = ?',
          [email]
        );
        conn.release();

        const results = Array.isArray(rows) ? rows : [];
        if (results.length) {
          const dbUser: any = results[0];
          user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            password: dbUser.password,
            role: dbUser.role,
            status: dbUser.status,
            phone: dbUser.phone,
            address: dbUser.address,
            createdAt: dbUser.createdAt
          };
        }
      } catch (dbErr: any) {
        console.error('[MySQL Error] Failed to query user for login:', dbErr);
        return res.status(500).json({ message: 'Login failed due to server database error.' });
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email address.' });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended by a Superadmin.' });
    }

    logAudit(user.id, user.name, user.role, 'USER_LOGIN', `Logged in via IP ${req.ip || '127.0.0.1'}`);
    
    // Return safe user details
    const safeUser: any = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, status: user.status };
    if (user.phone) safeUser.phone = user.phone;
    if (user.address) safeUser.address = user.address;

    res.json({ token: `mock_jwt_token_for_${user.email}`, user: safeUser });
  });

  app.post('/api/auth/register', async (req, res) => {
    
    logger("Register API hit");
    const { name, email, password} = req.body;
      res.json({
    message: "API debug working",
    data: req.body
  });
    // Basic required fields
    const errors: { field: string; message: string }[] = [];
    if (!name) errors.push({ field: 'name', message: 'Name is required.' });
    if (!email) errors.push({ field: 'email', message: 'Email is required.' });
    if (!password) errors.push({ field: 'password', message: 'Password is required.' });

    // Helper validators
    const validateEmail = (e: string) => {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      return re.test(String(e).toLowerCase());
    };
    const validatePassword = (p: string) => {
      // At least 8 chars, one letter and one number
      return /(?=.{8,})(?=.*[0-9])(?=.*[A-Za-z])/.test(p);
    };

    if (email && !validateEmail(email)) errors.push({ field: 'email', message: 'Invalid email format.' });
    if (password && !validatePassword(password)) errors.push({ field: 'password', message: 'Password must be at least 8 characters and include letters and numbers.' });

    if (errors.length) {
      return res.status(400).json({ error: 'validation_error', details: errors });
    }

    const existingUser = inMemoryUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'conflict', message: 'Email address is already registered.' });
    }

    const newUser: any = {
      id: inMemoryUsers.length + 1,
      name,
      email,
      password,
      role: 'user' as const, // default role
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };

    // Persist to MySQL if connected
    if (pool) {
      try {
        const conn = await pool.getConnection();
        await conn.query(
          'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
          [name, email, password, 'user', 'active']
        );
        conn.release();
      } catch (dbErr: any) {
        console.error('[MySQL Error] Failed to insert new user:', dbErr);
        return res.status(500).json({ error: 'server_error', message: 'Could not save user to database.' });
      }
    }

    inMemoryUsers.push(newUser);
    logAudit(newUser.id, newUser.name, 'user', 'USER_REGISTER', `Created new customer account.`);

    const safeUser: any = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt, status: newUser.status };
    
    res.status(201).json({ token: `mock_jwt_token_for_${newUser.email}`, user: safeUser });
  });

  /**
   * PRODUCTS ENDPOINTS
   */
  app.get('/api/products', (req, res) => {
    res.json(inMemoryProducts);
  });

  // Admin access check middleware simulation
  const checkRole = (allowedRoles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const userRole = req.headers['x-user-role'] as string;
      const userName = req.headers['x-user-name'] as string;
      const userIdStr = req.headers['x-user-id'] as string;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access Denied: Insufficient permissions for this action.' });
      }
      next();
    };
  };

  app.post('/api/products', checkRole(['admin', 'superadmin']), (req, res) => {
    const { name, description, price, category, imageUrl, stock, volume } = req.body;
    const adminUser = req.headers['x-user-name'] as string || 'Admin';
    const adminId = parseInt(req.headers['x-user-id'] as string || '2');

    if (!name || isNaN(price) || isNaN(stock)) {
      return res.status(400).json({ message: 'Invalid product properties.' });
    }

    const newProd = {
      id: inMemoryProducts.length + 1,
      name,
      description: description || '',
      price: Number(price),
      category: category || 'Indian Delicacy',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=600',
      stock: Number(stock),
      volume: volume || '300ml',
      salesCount: 0
    };

    inMemoryProducts.unshift(newProd);
    logAudit(adminId, adminUser, req.headers['x-user-role'] as string, 'PRODUCT_CREATE', `Added product: ${newProd.name}`);
    res.status(201).json(newProd);
  });

  app.put('/api/products/:id', checkRole(['admin', 'superadmin']), (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, price, category, imageUrl, stock, volume } = req.body;
    const adminUser = req.headers['x-user-name'] as string || 'Admin';
    const adminId = parseInt(req.headers['x-user-id'] as string || '2');

    const index = inMemoryProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updated = {
      ...inMemoryProducts[index],
      name: name || inMemoryProducts[index].name,
      description: description || inMemoryProducts[index].description,
      price: price !== undefined ? Number(price) : inMemoryProducts[index].price,
      category: category || inMemoryProducts[index].category,
      imageUrl: imageUrl || inMemoryProducts[index].imageUrl,
      stock: stock !== undefined ? Number(stock) : inMemoryProducts[index].stock,
      volume: volume || inMemoryProducts[index].volume
    };

    inMemoryProducts[index] = updated;
    logAudit(adminId, adminUser, req.headers['x-user-role'] as string, 'PRODUCT_EDIT', `Modified product: ${updated.name}`);
    res.json(updated);
  });

  app.delete('/api/products/:id', checkRole(['admin', 'superadmin']), (req, res) => {
    const id = parseInt(req.params.id);
    const adminUser = req.headers['x-user-name'] as string || 'Admin';
    const adminId = parseInt(req.headers['x-user-id'] as string || '2');

    const target = inMemoryProducts.find(p => p.id === id);
    if (!target) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    inMemoryProducts = inMemoryProducts.filter(p => p.id !== id);
    logAudit(adminId, adminUser, req.headers['x-user-role'] as string, 'PRODUCT_DELETE', `Deleted product ID: ${id} (${target.name})`);
    res.json({ message: 'Product successfully removed.' });
  });

  /**
   * ORDERS ENDPOINTS
   */
  app.post('/api/orders', (req, res) => {
    const { items, totalAmount, shippingAddress, phone } = req.body;
    const userId = parseInt(req.headers['x-user-id'] as string || '1');
    const userName = req.headers['x-user-name'] as string || 'Customer';
    const userRole = req.headers['x-user-role'] as string || 'user';

    if (!items || !items.length || !shippingAddress || !phone) {
      return res.status(400).json({ message: 'Invalid order input data.' });
    }

    // Process order & reduce stock
    const itemSummaries = [];
    for (const orderItem of items) {
      const prod = inMemoryProducts.find(p => p.id === orderItem.productId);
      if (prod) {
        if (prod.stock < orderItem.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${prod.name}. Only ${prod.stock} left.` });
        }
        prod.stock -= orderItem.quantity;
        prod.salesCount += orderItem.quantity;
        itemSummaries.push({
          productId: prod.id,
          productName: prod.name,
          price: prod.price,
          quantity: orderItem.quantity
        });
      }
    }

    const newOrder = {
      id: 1000 + inMemoryOrders.length + 1,
      userId,
      userName,
      userEmail: req.headers['x-user-email'] as string || 'user@drinkindia.com',
      items: itemSummaries,
      totalAmount: totalAmount,
      status: 'pending' as const,
      shippingAddress,
      phone,
      createdAt: new Date().toISOString()
    };

    inMemoryOrders.unshift(newOrder);
    logAudit(userId, userName, userRole, 'ORDER_PLACE', `Ordered #${newOrder.id} totaling ₹${totalAmount}`);
    res.status(201).json(newOrder);
  });

  app.get('/api/orders', (req, res) => {
    const userId = parseInt(req.headers['x-user-id'] as string);
    const userRole = req.headers['x-user-role'] as string;

    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins and Superadmins retrieve all logs
      return res.json(inMemoryOrders);
    }

    // Standard customers retrieved only customized ones
    const filtered = inMemoryOrders.filter(o => o.userId === userId);
    res.json(filtered);
  });

  app.put('/api/orders/:id/status', checkRole(['admin', 'superadmin']), (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const adminUser = req.headers['x-user-name'] as string || 'Admin';
    const adminId = parseInt(req.headers['x-user-id'] as string || '2');

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order state supplied.' });
    }

    const order = inMemoryOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ message: 'Order could not be identified.' });
    }

    order.status = status;
    logAudit(adminId, adminUser, req.headers['x-user-role'] as string, 'ORDER_STATUS_UPDATE', `Marked order #${id} as ${status.toUpperCase()}`);
    res.json(order);
  });

  /**
   * SYSTEM SETTINGS (SUPERADMIN ONLY)
   */
  app.get('/api/system/settings', checkRole(['admin', 'superadmin']), (req, res) => {
    res.json(inMemorySystemSettings);
  });

  app.put('/api/system/settings', checkRole(['superadmin']), (req, res) => {
    const superAdminName = req.headers['x-user-name'] as string || 'Superadmin';
    const superAdminId = parseInt(req.headers['x-user-id'] as string || '3');

    const { storeOpen, maintenanceMode, taxRate, enableRewards, minOrderValue } = req.body;

    inMemorySystemSettings = {
      storeOpen: storeOpen !== undefined ? !!storeOpen : inMemorySystemSettings.storeOpen,
      maintenanceMode: maintenanceMode !== undefined ? !!maintenanceMode : inMemorySystemSettings.maintenanceMode,
      taxRate: taxRate !== undefined ? Number(taxRate) : inMemorySystemSettings.taxRate,
      enableRewards: enableRewards !== undefined ? !!enableRewards : inMemorySystemSettings.enableRewards,
      minOrderValue: minOrderValue !== undefined ? Number(minOrderValue) : inMemorySystemSettings.minOrderValue
    };

    logAudit(superAdminId, superAdminName, 'superadmin', 'SYSTEM_SETTINGS_CHANGE', 'Modified store systemic settings policy.');
    res.json(inMemorySystemSettings);
  });

  /**
   * SYSTEM AUDIT LOGS (SUPERADMIN ONLY)
   */
  app.get('/api/system/logs', checkRole(['superadmin']), (req, res) => {
    res.json(inMemoryAuditLogs);
  });

  /**
   * USER MANAGER (SUPERADMIN ONLY)
   */
  app.get('/api/users', checkRole(['superadmin']), (req, res) => {
    // Return all users for management
    const safeUsers = inMemoryUsers.map(({ id, name, email, role, createdAt, status }) => ({ id, name, email, role, createdAt, status }));
    res.json(safeUsers);
  });

  app.put('/api/users/:id/role', checkRole(['superadmin']), (req, res) => {
    const superAdminName = req.headers['x-user-name'] as string || 'Superadmin';
    const superAdminId = parseInt(req.headers['x-user-id'] as string || '3');
    const id = parseInt(req.params.id);
    const { role } = req.body;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = inMemoryUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    logAudit(superAdminId, superAdminName, 'superadmin', 'USER_ROLE_CHANGE', `Changed user ${user.email} from ${oldRole.toUpperCase()} to ${role.toUpperCase()}`);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
  });

  app.put('/api/users/:id/status', checkRole(['superadmin']), (req, res) => {
    const superAdminName = req.headers['x-user-name'] as string || 'Superadmin';
    const superAdminId = parseInt(req.headers['x-user-id'] as string || '3');
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const user = inMemoryUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.id === superAdminId) {
      return res.status(400).json({ message: 'Superadmin cannot suspend their own administrative system account.' });
    }

    user.status = status;
    logAudit(superAdminId, superAdminName, 'superadmin', 'USER_STATUS_CHANGE', `Marked user ${user.email} status as ${status.toUpperCase()}`);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status });
  });

  // Database Connection Health Status Endpoint
  app.get('/api/db-status', (req, res) => {
    res.json({
      connected: hasMySQLConfig && pool !== null,
      mode: hasMySQLConfig && pool !== null ? 'PRODUCTION_MYSQL' : 'PREVIEW_FALLBACK_SANDBOX',
      host: process.env.DB_HOST || 'In-Memory State Store'
    });
  });

  // Vite Integration Setup
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Startup Listener bound to 0.0.0.0 (necessary for Cloud Run/Playground integration)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Drink India Server] Running beautifully in port ${PORT}`);
    console.log(`[Environment] Node Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL SEVERE WORKSPACE SYSTEM ERROR] Startup Failed:', err);
});
