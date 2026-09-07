export type UserProfile = 'Tomas' | 'Miranda';

export type UserFilter = 'Todos' | 'Tomas' | 'Miranda';

export type TransactionType = 'ingreso' | 'gasto';

export type SplitType = 
  | 'compartido_50_50' 
  | 'exclusivo_tomas' 
  | 'exclusivo_miranda' 
  | 'personalizado';

export type TransactionStatus = 'pendiente' | 'pagado';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'debito' | 'credito';

export interface Installments {
  current: number; // Cuota actual (ej: 2)
  total: number;   // Total de cuotas (ej: 6)
}

export interface CustomSplit {
  tomas: number; // Porcentaje (0-100) o monto
  miranda: number; // Porcentaje (0-100) o monto
  mode?: 'percentage' | 'amount';
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number; // en Pesos Argentinos (ARS)
  category: string;
  paidBy: UserProfile;
  splitType: SplitType;
  customSplit?: CustomSplit;
  paymentMethod?: PaymentMethod;
  installments?: Installments;
  dueDate?: string; // Fecha de vencimiento YYYY-MM-DD para servicios o impuestos
  date: string; // ISO string YYYY-MM-DD
  status: TransactionStatus;
  notes?: string;
  isSettlement?: boolean; // Si es un movimiento para saldar deuda entre Tomas y Miranda
  isRecurring?: boolean;  // Gasto fijo recurrente
  createdAt?: string | number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number; // ARS
  month?: string; // YYYY-MM (opcional, si es por mes específico)
}

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  color?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number; // ARS
  currentAmount: number; // ARS
  deadline?: string; // YYYY-MM-DD
  color?: string;
  icon?: string;
  createdBy: UserProfile | 'Ambos';
  notes?: string;
  createdAt?: string | number;
}

export interface BillStatus {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  paidBy: UserProfile;
  status: TransactionStatus;
  daysRemaining: number;
  urgency: 'overdue' | 'today' | 'soon' | 'future' | 'paid';
}

export interface BalanceSummary {
  tomasPaid: number;
  mirandaPaid: number;
  tomasOwed: number;
  mirandaOwed: number;
  netDebtor: 'Tomas' | 'Miranda' | null;
  netAmount: number;
  message: string;
}

export interface SavingsPower {
  tomasIncome: number;
  tomasExpense: number;
  tomasSavings: number;
  tomasRate: number;

  mirandaIncome: number;
  mirandaExpense: number;
  mirandaSavings: number;
  mirandaRate: number;

  householdIncome: number;
  householdExpense: number;
  householdSavings: number;
  householdRate: number;
}

export interface MonthlyMetric {
  monthKey: string;
  monthLabel: string;
  ingresos: number;
  gastos: number;
  ahorro: number;
}

export interface CategoryDistribution {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}
