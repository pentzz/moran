export enum PaymentMethod {
  Transfer = 'העברה',
  Cash = 'מזומן',
  Check = 'צ\'ק',
}

// New interface for dynamic categories
export interface Category {
  id: string;
  name:string;
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

export interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface Expense {
  id: string;
  category: string; // Changed from ExpenseCategory to string
  date: string;
  supplier: string;
  supplierId?: string; // Reference to supplier ID
  description: string;
  amount: number;
  amountWithVat?: number; // סכום כולל מע"מ (18%)
  hasVat: boolean; // האם כולל מע"מ
}

export interface Project {
  id: string;
  name: string;
  description: string;
  contractAmount: number;
  incomes: Income[];
  expenses: Expense[];
  isArchived: boolean;
}

export interface ExportOptions {
  includeSummary: boolean;
  includeIncomes: boolean;
  expenseFormat: 'single-sheet' | 'multi-sheet' | 'none';
}

export type SortKey = 'name' | 'contractAmount' | 'remainingBudget' | 'profitMargin';