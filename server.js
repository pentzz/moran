const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('dist')); // Serve built files
app.use(express.static(__dirname)); // Serve logo and other static files from root

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const SUPPLIERS_FILE = path.join(DATA_DIR, 'suppliers.json');

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
  
  try {
    await fs.access(PROJECTS_FILE);
  } catch {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
  }
  
  try {
    await fs.access(CATEGORIES_FILE);
  } catch {
    const defaultCategories = [
      { id: '1', name: 'חומרי בנייה' },
      { id: '2', name: 'קבלני משנה' },
      { id: '3', name: 'חשמל' }
    ];
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
  }
  
  try {
    await fs.access(SUPPLIERS_FILE);
  } catch {
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

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication - in production, use proper hashing and database
  if (username === 'litalb' && password === 'Papi2009') {
    res.json({ 
      success: true, 
      token: 'authenticated',
      user: { username }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'שם משתמש או סיסמה שגויים' 
    });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בקריאת הפרויקטים' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const projects = await readJsonFile(PROJECTS_FILE);
    const newProject = {
      ...req.body,
      id: new Date().toISOString(),
      incomes: [],
      expenses: [],
      isArchived: false
    };
    
    projects.push(newProject);
    const success = await writeJsonFile(PROJECTS_FILE, projects);
    
    if (success) {
      res.json(newProject);
    } else {
      res.status(500).json({ error: 'שגיאה בשמירת הפרויקט' });
    }
  } catch (error) {
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
  await initializeDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
    console.log(`🌐 Access the app at: http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
