// מערכת סנכרון נתונים עם fallback ל-localStorage
import { Project, Category, Supplier } from '../types';

// פונקציית עזר ליצירת ID ייחודי
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// מפתחות localStorage
const STORAGE_KEYS = {
  projects: 'kablan_projects_backup',
  categories: 'kablan_categories_backup', 
  suppliers: 'kablan_suppliers_backup',
  lastSync: 'kablan_last_sync',
  serverStatus: 'kablan_server_status'
};

// בדיקת זמינות localStorage
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// שמירת נתונים ב-localStorage
function saveToLocalStorage<T>(key: string, data: T): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
    console.log(`💾 Data saved to localStorage: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
    return false;
  }
}

// קריאת נתונים מ-localStorage
function loadFromLocalStorage<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
    return null;
  }
}

// טעינת נתונים ראשוניים מקבצי JSON 
async function loadInitialData<T>(fileName: string, defaultData: T): Promise<T> {
  try {
    const response = await fetch(`/data/${fileName}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`📥 Loaded initial data from ${fileName}:`, data.length || Object.keys(data).length, 'items');
      return data;
    }
  } catch (error) {
    console.log(`⚠️ Could not load ${fileName}, using default data`);
  }
  return defaultData;
}

// קביעה האם להשתמש בנתונים מקומיים
function shouldUseLocalData(): boolean {
  const serverStatus = localStorage.getItem(STORAGE_KEYS.serverStatus);
  return serverStatus === 'offline';
}

// מחלקה לניהול סנכרון נתונים
export class DataSyncManager {
  private static instance: DataSyncManager;
  
  static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  // סנכרון נתוני פרויקטים - רק localStorage
  async syncProjects(data?: Project[]): Promise<Project[]> {
    if (data) {
      // שמירת נתונים ב-localStorage
      saveToLocalStorage(STORAGE_KEYS.projects, data);
      return data;
    } else {
      // קריאת נתונים - קודם מ-localStorage, אם אין - מקבצי JSON
      let localData = loadFromLocalStorage<Project[]>(STORAGE_KEYS.projects);
      if (!localData || localData.length === 0) {
        console.log('📥 Loading initial projects from JSON files...');
        localData = await loadInitialData('projects.json', []);
        if (localData && localData.length > 0) {
          saveToLocalStorage(STORAGE_KEYS.projects, localData);
        }
      }
      return localData || [];
    }
  }

  // סנכרון נתוני קטגוריות - רק localStorage
  async syncCategories(data?: Category[]): Promise<Category[]> {
    if (data) {
      saveToLocalStorage(STORAGE_KEYS.categories, data);
      return data;
    } else {
      let localData = loadFromLocalStorage<Category[]>(STORAGE_KEYS.categories);
      if (!localData || localData.length === 0) {
        console.log('📥 Loading initial categories from JSON files...');
        const defaultCategories = [
          { id: '1', name: 'חומרי בנייה' },
          { id: '2', name: 'קבלני משנה' },
          { id: '3', name: 'חשמל' }
        ];
        localData = await loadInitialData('categories.json', defaultCategories);
        if (localData && localData.length > 0) {
          saveToLocalStorage(STORAGE_KEYS.categories, localData);
        }
      }
      return localData || [];
    }
  }

  // סנכרון נתוני ספקים - רק localStorage
  async syncSuppliers(data?: Supplier[]): Promise<Supplier[]> {
    if (data) {
      saveToLocalStorage(STORAGE_KEYS.suppliers, data);
      return data;
    } else {
      let localData = loadFromLocalStorage<Supplier[]>(STORAGE_KEYS.suppliers);
      if (!localData || localData.length === 0) {
        console.log('📥 Loading initial suppliers from JSON files...');
        const defaultSuppliers = [
          { 
            id: '1', 
            name: 'ספק כללי', 
            description: 'ספק ברירת מחדל',
            createdAt: new Date().toISOString()
          }
        ];
        localData = await loadInitialData('suppliers.json', defaultSuppliers);
        if (localData && localData.length > 0) {
          saveToLocalStorage(STORAGE_KEYS.suppliers, localData);
        }
      }
      return localData || [];
    }
  }

  // מחיקת כל הנתונים המקומיים (לאיפוס)
  clearAllLocalData(): void {
    if (isLocalStorageAvailable()) {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🗑️ All local data cleared');
    }
  }

  // קבלת סטטוס הסנכרון
  getSyncStatus(): { lastSync: string | null; serverStatus: string | null } {
    return {
      lastSync: localStorage.getItem(STORAGE_KEYS.lastSync),
      serverStatus: localStorage.getItem(STORAGE_KEYS.serverStatus)
    };
  }

  // סנכרון ידני של כל הנתונים
  async fullSync(): Promise<void> {
    console.log('🔄 Starting full data sync...');
    
    try {
      await Promise.all([
        this.syncProjects(),
        this.syncCategories(), 
        this.syncSuppliers()
      ]);
      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('❌ Full sync failed:', error);
    }
  }
}

// יצוא singleton instance
export const dataSyncManager = DataSyncManager.getInstance();
