export enum PaymentMethod {
  Transfer = 'העברה',
  Cash = 'מזומן',
  Check = 'צ\'ק',
}

export enum PaymentStatus {
  Paid = 'שולם',
  Pending = 'לגבייה',
  PartiallyPaid = 'שולם חלקי'
}

export enum UserRole {
  SuperAdmin = 'superAdmin',
  Admin = 'admin',
  User = 'user'
}

// Organization interface for multi-tenant support
export interface Organization {
  id: string;
  name: string; // שם הקבלן/ארגון
  logo?: string; // Base64 או URL ללוגו
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  vatNumber?: string; // ע.מ / ח.פ
  businessNumber?: string;
  settings: {
    vatRate: number; // מע"מ באחוזים (ברירת מחדל 18%)
    taxRate: number; // מס הכנסה באחוזים
    currency: string; // מטבע (ברירת מחדל: ILS)
    companyName?: string; // שם החברה המלא
  };
  createdAt: string;
  createdBy: string; // User ID של מורן
  updatedAt?: string;
  isActive: boolean;
}

// User interface
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  organizationId?: string; // null/undefined for SuperAdmin, required for others
  fullName?: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  profilePicture?: string; // URL או Base64 של תמונת פרופיל
  phone?: string;
  address?: string;
  bio?: string; // תיאור אישי
  updatedAt?: string;
}

// User Profile interface for profile management
export interface UserProfile {
  id: string;
  userId: string;
  profilePicture?: string; // URL או Base64 של תמונת פרופיל
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string; // תיאור אישי
  preferences: {
    theme: 'light' | 'dark';
    language: 'he' | 'en';
    notifications: boolean;
    emailNotifications: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}

// Activity log interface for audit trail
export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  organizationId?: string; // Which organization this activity belongs to
  action: string;
  entityType: 'project' | 'income' | 'expense' | 'user' | 'category' | 'supplier' | 'organization';
  entityId: string;
  details: string;
  timestamp: string;
}

// New interface for dynamic categories with subcategories
export interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

// Supplier interface
export interface Supplier {
  id: string;
  name: string;
  description?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  vatNumber?: string; // מספר עוסק מורשה
  businessNumber?: string; // ח.פ / ע.מ
  address?: string;
  createdAt: string;
}

// Project-specific supplier interface
export interface ProjectSupplier {
  id: string;
  projectId: string;
  supplierId?: string; // Reference to global supplier (if copied from global)
  name: string;
  description?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  vatNumber?: string;
  businessNumber?: string;
  address?: string;
  notes?: string; // Project-specific notes about this supplier
  agreementAmount?: number; // סכום ההסכם שנסגר עם הספק
  paidAmount?: number; // סכום ששולם בפועל במצטבר
  createdAt: string;
  isFromGlobal: boolean; // Whether this was copied from global suppliers
}

// Milestone interface for projects
export interface Milestone {
  id: string;
  name: string;
  description?: string;
  amount: number;
  percentage: number; // אחוז מהתקציב הכולל
  targetDate?: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
  projectId: string;
}

export interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount: number; // סכום ששולם בפועל
  remainingAmount: number; // יתרת תשלום
  actualPaymentDate?: string; // תאריך תשלום בפועל
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  milestoneId?: string; // קישור למיילסטון
}

export interface Expense {
  id: string;
  category: string; // Changed from ExpenseCategory to string
  subcategory?: string; // תת-קטגוריה
  date: string;
  supplier: string;
  supplierId?: string; // Reference to supplier ID
  description: string;
  amount: number;
  amountWithVat?: number; // סכום כולל מע"מ (18%)
  hasVat: boolean; // האם כולל מע"מ
  hasInvoice: boolean; // האם קיבלת חשבונית
  invoiceNumber?: string; // מספר חשבונית
  notes?: string; // הערות
  expenseType?: 'regular' | 'addition' | 'exception' | 'daily-worker'; // סוג הוצאה
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
}

export interface Project {
  id: string;
  organizationId: string; // Required - which organization owns this project
  name: string;
  description: string;
  contractAmount: number;
  incomes: Income[];
  expenses: Expense[];
  milestones: Milestone[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  ownerId: string; // User ID - owner of the project
  suppliers?: ProjectSupplier[]; // Project-specific suppliers
}

// Settings interface for tax rates and other configurations
export interface SystemSettings {
  id: string;
  taxRate: number; // מס הכנסה באחוזים
  taxAmount?: number; // מס הכנסה בסכום קבוע
  vatRate: number; // מע"מ באחוזים (ברירת מחדל 18%)
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  updatedAt: string;
  updatedBy: string;
}

// User-specific settings interface
export interface UserSettings {
  id: string;
  userId: string;
  taxRate: number; // מס הכנסה באחוזים
  taxAmount?: number; // מס הכנסה בסכום קבוע
  vatRate: number; // מע"מ באחוזים (ברירת מחדל 18%)
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  defaultCategories: string[]; // קטגוריות ברירת מחדל
  defaultSuppliers: string[]; // ספקים ברירת מחדל
  updatedAt: string;
  updatedBy: string;
}

export interface ExportOptions {
  includeSummary: boolean;
  includeIncomes: boolean;
  expenseFormat: 'single-sheet' | 'multi-sheet' | 'none';
}

export type SortKey = 'name' | 'contractAmount' | 'remainingBudget' | 'profitMargin';