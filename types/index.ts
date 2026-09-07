export type UserProfile = 'Tomas' | 'Miranda';

export type UserFilter = 'Todos' | 'Tomas' | 'Miranda';

export type TransactionType = 'ingreso' | 'gasto';

export type SplitType = 
  | 'compartido_50_50' 
  | 'exclusivo_tomas' 
  | 'exclusivo_miranda' 
  | 'personalizado';

export type TransactionStatus = 'pendiente' | 'pagado';

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
  date: string; // ISO string YYYY-MM-DD o timestamp string
  status: TransactionStatus;
  notes?: string;
  isSettlement?: boolean; // Si es un movimiento para saldar deuda entre Tomas y Miranda
  createdAt?: string | number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface BalanceSummary {
  tomasPaid: number;
  mirandaPaid: number;
  tomasOwed: number; // lo que otros le deben a Tomas
  mirandaOwed: number; // lo que otros le deben a Miranda
  netDebtor: 'Tomas' | 'Miranda' | null;
  netAmount: number; // Monto absoluto que netDebtor le debe al otro
  message: string;
}

export interface SavingsPower {
  tomasIncome: number;
  tomasExpense: number;
  tomasSavings: number;
  tomasRate: number; // % sobre ingresos

  mirandaIncome: number;
  mirandaExpense: number;
  mirandaSavings: number;
  mirandaRate: number; // % sobre ingresos

  householdIncome: number;
  householdExpense: number;
  householdSavings: number;
  householdRate: number; // % sobre ingresos
}

export interface MonthlyMetric {
  monthKey: string; // YYYY-MM
  monthLabel: string; // Ene, Feb, etc.
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
