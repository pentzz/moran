const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to allow inline scripts
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'יותר מדי בקשות מכתובת IP זו, נסה שוב מאוחר יותר'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  name: process.env.SESSION_NAME || 'moran_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Serve built files
app.use(express.static('dist'));
app.use(express.static(__dirname));

// Data directory - שמירת נתונים רב-שכבתית עם גיבוי
const PRODUCTION_DATA_DIR = path.join(__dirname, 'data');
const DEV_DATA_DIR = path.join(__dirname, 'public', 'data');
const DIST_DATA_DIR = path.join(__dirname, 'dist', 'data');

// נקבע את תיקיית הנתונים הראשית
let DATA_DIR = PRODUCTION_DATA_DIR;

// בדיקה האם נתונים קיימים בתיקיות שונות ונבחר את הטובה ביותר
async function determineDataDirectory() {
  const dirsToCheck = [PRODUCTION_DATA_DIR, DEV_DATA_DIR, DIST_DATA_DIR];
  
  for (const dir of dirsToCheck) {
    try {
      await fs.access(dir);
      const projectsFile = path.join(dir, 'projects.json');
      const projects = JSON.parse(await fs.readFile(projectsFile, 'utf8'));
      if (projects.length > 0) {
        console.log(`📊 Found ${projects.length} projects in ${dir}`);
        return dir;
      }
    } catch (error) {
      // תיקייה לא קיימת או ריקה, נמשיך הלאה
    }
  }
  
  // אם לא נמצא כלום, נחזור לברירת המחדל
  return PRODUCTION_DATA_DIR;
}

// נתיבי הקבצים יעודכנו ב-startServer
let PROJECTS_FILE;
let CATEGORIES_FILE;
let SUPPLIERS_FILE;
let USERS_FILE;

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
  await ensureDataDir();
  
  console.log('📁 Checking data files...');
  
  try {
    await fs.access(PROJECTS_FILE);
    const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
    console.log(`✅ Found ${projects.length} existing projects`);
  } catch {
    console.log('📝 Creating new projects file...');
    await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
  }
  
  try {
    await fs.access(CATEGORIES_FILE);
    const categories = JSON.parse(await fs.readFile(CATEGORIES_FILE, 'utf8'));
    console.log(`✅ Found ${categories.length} existing categories`);
  } catch {
    console.log('📝 Creating default categories...');
    const defaultCategories = [
      { id: '1', name: 'חומרי בנייה' },
      { id: '2', name: 'קבלני משנה' },
      { id: '3', name: 'חשמל' }
    ];
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
  }
  
  try {
    await fs.access(SUPPLIERS_FILE);
    const suppliers = JSON.parse(await fs.readFile(SUPPLIERS_FILE, 'utf8'));
    console.log(`✅ Found ${suppliers.length} existing suppliers`);
  } catch {
    console.log('📝 Creating default suppliers...');
    const defaultSuppliers = [
      { 
        id: '1', 
        name: 'ספק כללי', 
        description: 'ספק ברירת מחדל',
        createdAt: new Date().toISOString()
      }
    ];
    await fs.writeFile(SUPPLIERS_FILE, JSON.stringify(defaultSuppliers, null, 2));
  }
}

// Helper functions
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// גיבוי אוטומטי לפני כל שינוי
async function createBackup(filePath) {
  try {
    const backupDir = path.join(path.dirname(filePath), 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath, '.json');
    const backupPath = path.join(backupDir, `${fileName}-${timestamp}.json`);
    
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      await fs.copyFile(filePath, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    }
  } catch (error) {
    console.log(`⚠️  Backup failed (continuing anyway): ${error.message}`);
  }
}

async function writeJsonFile(filePath, data) {
  try {
    // יצירת גיבוי לפני שינוי
    await createBackup(filePath);
    
    // בדיקה שהתיקייה קיימת
    const dir = path.dirname(filePath);
    try {
      await fs.access(dir);
      console.log(`✅ Directory exists: ${dir}`);
    } catch {
      console.log(`📁 Creating directory: ${dir}`);
      await fs.mkdir(dir, { recursive: true });
    }

    // בדיקת הרשאות כתיבה
    try {
      await fs.access(dir, fs.constants.W_OK);
      console.log(`✅ Write permissions OK for: ${dir}`);
    } catch {
      console.error(`❌ No write permissions for: ${dir}`);
      throw new Error(`No write permissions for directory: ${dir}`);
    }

    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf8');
    console.log(`💾 Successfully saved data to ${filePath.split('/').pop()} (${jsonString.length} bytes)`);
    
    // אימות שהקובץ נכתב
    const verification = await fs.readFile(filePath, 'utf8');
    if (verification === jsonString) {
      console.log(`✅ File verification successful for ${filePath.split('/').pop()}`);
      
      // שכפול לתיקיות נוספות לבטיחות
      await syncDataToOtherDirectories(filePath, data);
    } else {
      console.error(`❌ File verification FAILED for ${filePath.split('/').pop()}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error.message);
    console.error(`📍 Current working directory: ${process.cwd()}`);
    console.error(`📍 Absolute file path: ${path.resolve(filePath)}`);
    return false;
  }
}

// סנכרון נתונים לתיקיות נוספות לבטיחות
async function syncDataToOtherDirectories(originalFile, data) {
  const fileName = path.basename(originalFile);
  const dirsToSync = [PRODUCTION_DATA_DIR, DEV_DATA_DIR, DIST_DATA_DIR];
  
  for (const dir of dirsToSync) {
    if (dir === path.dirname(originalFile)) continue; // לא לשכפל לתיקייה שממנה שמרנו
    
    try {
      await fs.mkdir(dir, { recursive: true });
      const targetFile = path.join(dir, fileName);
      await fs.writeFile(targetFile, JSON.stringify(data, null, 2), 'utf8');
      console.log(`🔄 Synced data to ${targetFile}`);
    } catch (error) {
      console.log(`⚠️  Sync to ${dir} failed: ${error.message}`);
    }
  }
}

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'נדרש אימות', authenticated: false });
  }
  next();
};

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Load users from JSON file
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Create session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      // Update last login
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex].lastLogin = new Date().toISOString();
      await writeJsonFile(USERS_FILE, users);

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword,
        authenticated: true
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'שם משתמש או סיסמה שגויים',
        authenticated: false
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בתהליך ההתחברות',
      authenticated: false
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'שגיאה בהתנתקות' });
    }
    res.clearCookie(process.env.SESSION_NAME || 'moran_session');
    res.json({ success: true, message: 'התנתקת בהצלחה' });
  });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      username: req.session.username,
      role: req.session.role
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    console.log('🔍 GET /api/projects - Reading projects...');
    const projects = await readJsonFile(PROJECTS_FILE);
    console.log(`✅ Successfully read ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({ error: 'שגיאה בקריאת הפרויקטים' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    console.log('📝 POST /api/projects - Creating new project...');
    console.log('📋 Project data:', JSON.stringify(req.body, null, 2));
    
    const projects = await readJsonFile(PROJECTS_FILE);
    console.log(`📊 Current projects count: ${projects.length}`);
    
    const newProject = {
      ...req.body,
      id: new Date().toISOString(),
      incomes: [],
      expenses: [],
      isArchived: false
    };
    
    console.log('🆕 New project created:', JSON.stringify(newProject, null, 2));
    
    projects.push(newProject);
    console.log(`📈 Total projects after adding: ${projects.length}`);
    
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      console.log('✅ Project saved successfully!');
      res.json(newProject);
    } else {
      console.error('❌ Failed to save project to file');
      res.status(500).json({ error: 'שגיאה בשמירת הפרויקט' });
    }
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'שגיאה ביצירת הפרויקט' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'פרויקט לא נמצא' });
    }
    
    projects[projectIndex] = { ...projects[projectIndex], ...req.body };
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      res.json(projects[projectIndex]);
    } else {
      res.status(500).json({ error: 'שגיאה בעדכון הפרויקט' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הפרויקט' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const filteredProjects = projects.filter(p => p.id !== req.params.id);
    
    const success = await writeJsonFile(PROJECTS_FILE, filteredProjects);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'שגיאה במחיקת הפרויקט' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת הפרויקט' });
  }
});

app.delete('/api/projects', async (req, res) => {
  try {
    const success = await writeJsonFile(PROJECTS_FILE, []);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'שגיאה במחיקת כל הפרויקטים' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת כל הפרויקטים' });
  }
});

// Income endpoints
app.post('/api/projects/:id/incomes', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'פרויקט לא נמצא' });
    }
    
    const newIncome = { ...req.body, id: new Date().toISOString() };
    projects[projectIndex].incomes.push(newIncome);
    
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      res.json(newIncome);
    } else {
      res.status(500).json({ error: 'שגיאה בשמירת ההכנסה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בהוספת ההכנסה' });
  }
});

app.delete('/api/projects/:projectId/incomes/:incomeId', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const projectIndex = projects.findIndex(p => p.id === req.params.projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'פרויקט לא נמצא' });
    }
    
    projects[projectIndex].incomes = projects[projectIndex].incomes.filter(
      i => i.id !== req.params.incomeId
    );
    
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'שגיאה במחיקת ההכנסה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת ההכנסה' });
  }
});

// Expense endpoints
app.post('/api/projects/:id/expenses', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'פרויקט לא נמצא' });
    }
    
    const newExpense = { ...req.body, id: new Date().toISOString() };
    projects[projectIndex].expenses.push(newExpense);
    
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      res.json(newExpense);
    } else {
      res.status(500).json({ error: 'שגיאה בשמירת ההוצאה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בהוספת ההוצאה' });
  }
});

app.delete('/api/projects/:projectId/expenses/:expenseId', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const projectIndex = projects.findIndex(p => p.id === req.params.projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'פרויקט לא נמצא' });
    }
    
    projects[projectIndex].expenses = projects[projectIndex].expenses.filter(
      e => e.id !== req.params.expenseId
    );
    
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'שגיאה במחיקת ההוצאה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת ההוצאה' });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בקריאת הקטגוריות' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    const newCategory = {
      id: new Date().toISOString(),
      name: req.body.name
    };
    
    categories.push(newCategory);
    const success = await writeJsonFile(CATEGORIES_FILE, categories);
    
    if (success) {
      res.json(newCategory);
    } else {
      res.status(500).json({ error: 'שגיאה בשמירת הקטגוריה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת הקטגוריה' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    const categoryIndex = categories.findIndex(c => c.id === req.params.id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'קטגוריה לא נמצאה' });
    }
    
    categories[categoryIndex].name = req.body.name;
    const success = await writeJsonFile(CATEGORIES_FILE, categories);
    
    if (success) {
      res.json(categories[categoryIndex]);
    } else {
      res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    const filteredCategories = categories.filter(c => c.id !== req.params.id);
    
    const success = await writeJsonFile(CATEGORIES_FILE, filteredCategories);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'שגיאה במחיקת הקטגוריה' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת הקטגוריה' });
  }
});

// Suppliers endpoints
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await readJsonFile(SUPPLIERS_FILE);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בקריאת הספקים' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await readJsonFile(SUPPLIERS_FILE);
    const newSupplier = {
      id: new Date().toISOString(),
      name: req.body.name,
      description: req.body.description || '',
      contactPerson: req.body.contactPerson || '',
      phone: req.body.phone || '',
      email: req.body.email || '',
      vatNumber: req.body.vatNumber || '',
      businessNumber: req.body.businessNumber || '',
      address: req.body.address || '',
      createdAt: new Date().toISOString()
    };
    
    suppliers.push(newSupplier);
    const success = await writeJsonFile(SUPPLIERS_FILE, suppliers);
    
    if (success) {
      res.json(newSupplier);
    } else {
      res.status(500).json({ error: 'שגיאה בשמירת הספק' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת הספק' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const suppliers = await readJsonFile(SUPPLIERS_FILE);
    const supplierIndex = suppliers.findIndex(s => s.id === req.params.id);
    
    if (supplierIndex === -1) {
      return res.status(404).json({ error: 'ספק לא נמצא' });
    }
    
    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      name: req.body.name || suppliers[supplierIndex].name,
      description: req.body.description !== undefined ? req.body.description : suppliers[supplierIndex].description,
      contactPerson: req.body.contactPerson !== undefined ? req.body.contactPerson : suppliers[supplierIndex].contactPerson,
      phone: req.body.phone !== undefined ? req.body.phone : suppliers[supplierIndex].phone,
      email: req.body.email !== undefined ? req.body.email : suppliers[supplierIndex].email,
      vatNumber: req.body.vatNumber !== undefined ? req.body.vatNumber : suppliers[supplierIndex].vatNumber,
      businessNumber: req.body.businessNumber !== undefined ? req.body.businessNumber : suppliers[supplierIndex].businessNumber,
      address: req.body.address !== undefined ? req.body.address : suppliers[supplierIndex].address,
    };
    
    const success = await writeJsonFile(SUPPLIERS_FILE, suppliers);
    
    if (success) {
      res.json(suppliers[supplierIndex]);
    } else {
      res.status(500).json({ error: 'שגיאה בעדכון הספק' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הספק' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const suppliers = await readJsonFile(SUPPLIERS_FILE);
    const filteredSuppliers = suppliers.filter(s => s.id !== req.params.id);
    
    const success = await writeJsonFile(SUPPLIERS_FILE, filteredSuppliers);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'שגיאה במחיקת הספק' });
    }
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת הספק' });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
async function startServer() {
  try {
    console.log('🔧 Initializing server...');
    console.log(`📁 Working directory: ${process.cwd()}`);
    
    // קביעת תיקיית הנתונים הטובה ביותר
    DATA_DIR = await determineDataDirectory();
    console.log(`📁 Selected data directory: ${DATA_DIR}`);
    
    // עדכון משתני הקבצים
    PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
    CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
    SUPPLIERS_FILE = path.join(DATA_DIR, 'suppliers.json');
    USERS_FILE = path.join(DATA_DIR, 'users.json');
    
    // בדיקת הרשאות לתיקיית עבודה
    try {
      await fs.access(process.cwd(), fs.constants.W_OK);
      console.log('✅ Write permissions OK for working directory');
    } catch {
      console.error('❌ No write permissions for working directory!');
    }
    
    await initializeDataFiles();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Data stored in: ${DATA_DIR}`);
      console.log(`🌐 Access the app at: http://localhost:${PORT}`);
      console.log('💡 If data is not saving, run: npm run debug');
      console.log('🔄 Auto-backup and sync enabled for all data operations');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
