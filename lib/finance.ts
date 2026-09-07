import {
  Transaction,
  BalanceSummary,
  SavingsPower,
  MonthlyMetric,
  CategoryDistribution,
  Category,
} from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'luz', name: 'Luz', icon: 'Zap', color: '#f59e0b', isDefault: true },
  { id: 'gas', name: 'Gas', icon: 'Flame', color: '#ef4444', isDefault: true },
  { id: 'abl', name: 'ABL / Impuestos', icon: 'Landmark', color: '#6366f1', isDefault: true },
  { id: 'flow', name: 'Flow / Internet', icon: 'Tv', color: '#06b6d4', isDefault: true },
  { id: 'tarjetas', name: 'Tarjetas / Deudas Pendientes', icon: 'CreditCard', color: '#ec4899', isDefault: true },
  { id: 'supermercado', name: 'Supermercado', icon: 'ShoppingCart', color: '#10b981', isDefault: true },
  { id: 'alquiler', name: 'Alquiler', icon: 'Home', color: '#8b5cf6', isDefault: true },
  { id: 'salidas', name: 'Salidas y Restaurantes', icon: 'Utensils', color: '#f97316', isDefault: true },
  { id: 'transporte', name: 'Transporte / Nafta', icon: 'Car', color: '#3b82f6', isDefault: true },
  { id: 'salud', name: 'Salud y Farmacia', icon: 'HeartPulse', color: '#14b8a6', isDefault: true },
  { id: 'sueldo', name: 'Sueldo / Ingresos', icon: 'TrendingUp', color: '#22c55e', isDefault: true },
  { id: 'otros', name: 'Otros Gastos', icon: 'Layers', color: '#64748b', isDefault: true },
];

/**
 * Calcula el balance tipo Splitwise entre Tomas y Miranda.
 * Determina quién le debe a quién y el saldo neto.
 */
export function calculateSplitwiseBalance(transactions: Transaction[]): BalanceSummary {
  let tomasPaid = 0;
  let mirandaPaid = 0;
  let mirandaOwesTomas = 0;
  let tomasOwesMiranda = 0;

  for (const t of transactions) {
    // Si es un movimiento de liquidación (Saldar Deuda)
    if (t.isSettlement) {
      if (t.paidBy === 'Tomas') {
        // Tomas pagó a Miranda: reduce la deuda de Tomas con Miranda
        tomasOwesMiranda -= t.amount;
      } else {
        // Miranda pagó a Tomas: reduce la deuda de Miranda con Tomas
        mirandaOwesTomas -= t.amount;
      }
      continue;
    }

    if (t.type === 'gasto') {
      if (t.paidBy === 'Tomas') {
        tomasPaid += t.amount;

        if (t.splitType === 'compartido_50_50') {
          mirandaOwesTomas += t.amount / 2;
        } else if (t.splitType === 'exclusivo_miranda') {
          mirandaOwesTomas += t.amount;
        } else if (t.splitType === 'personalizado' && t.customSplit) {
          const mirandaPart =
            t.customSplit.mode === 'amount'
              ? t.customSplit.miranda
              : (t.amount * (t.customSplit.miranda || 0)) / 100;
          mirandaOwesTomas += mirandaPart;
        }
      } else if (t.paidBy === 'Miranda') {
        mirandaPaid += t.amount;

        if (t.splitType === 'compartido_50_50') {
          tomasOwesMiranda += t.amount / 2;
        } else if (t.splitType === 'exclusivo_tomas') {
          tomasOwesMiranda += t.amount;
        } else if (t.splitType === 'personalizado' && t.customSplit) {
          const tomasPart =
            t.customSplit.mode === 'amount'
              ? t.customSplit.tomas
              : (t.amount * (t.customSplit.tomas || 0)) / 100;
          tomasOwesMiranda += tomasPart;
        }
      }
    }
  }

  // Balance neto: positivo = Miranda debe a Tomas; negativo = Tomas debe a Miranda
  const net = mirandaOwesTomas - tomasOwesMiranda;
  const netAmount = Math.round(Math.abs(net) * 100) / 100;

  let netDebtor: 'Tomas' | 'Miranda' | null = null;
  let message = '¡Están a mano! No hay deudas pendientes.';

  if (net > 0.01) {
    netDebtor = 'Miranda';
    message = `Miranda le debe a Tomas`;
  } else if (net < -0.01) {
    netDebtor = 'Tomas';
    message = `Tomas le debe a Miranda`;
  }

  return {
    tomasPaid,
    mirandaPaid,
    tomasOwed: tomasOwesMiranda,
    mirandaOwed: mirandaOwesTomas,
    netDebtor,
    netAmount,
    message,
  };
}

/**
 * Calcula el Poder de Ahorro mensual individual y conjunto del hogar.
 * Fórmula: Ingresos - Gastos correspondientes.
 */
export function calculateSavingsPower(
  transactions: Transaction[],
  monthFilter?: string // Formato 'YYYY-MM', si no se pasa se toma el mes actual
): SavingsPower {
  const targetMonth = monthFilter || new Date().toISOString().slice(0, 7);

  const monthTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    return t.date.startsWith(targetMonth) && !t.isSettlement;
  });

  let tomasIncome = 0;
  let mirandaIncome = 0;
  let tomasExpense = 0;
  let mirandaExpense = 0;

  for (const t of monthTransactions) {
    if (t.type === 'ingreso') {
      if (t.paidBy === 'Tomas') {
        tomasIncome += t.amount;
      } else {
        mirandaIncome += t.amount;
      }
    } else if (t.type === 'gasto') {
      // Distribución real del gasto según corresponda a cada uno
      if (t.splitType === 'compartido_50_50') {
        tomasExpense += t.amount / 2;
        mirandaExpense += t.amount / 2;
      } else if (t.splitType === 'exclusivo_tomas') {
        tomasExpense += t.amount;
      } else if (t.splitType === 'exclusivo_miranda') {
        mirandaExpense += t.amount;
      } else if (t.splitType === 'personalizado' && t.customSplit) {
        if (t.customSplit.mode === 'amount') {
          tomasExpense += t.customSplit.tomas || 0;
          mirandaExpense += t.customSplit.miranda || 0;
        } else {
          tomasExpense += (t.amount * (t.customSplit.tomas || 0)) / 100;
          mirandaExpense += (t.amount * (t.customSplit.miranda || 0)) / 100;
        }
      } else {
        // Fallback por defecto según quién pagó
        if (t.paidBy === 'Tomas') tomasExpense += t.amount;
        else mirandaExpense += t.amount;
      }
    }
  }

  const tomasSavings = tomasIncome - tomasExpense;
  const tomasRate = tomasIncome > 0 ? (tomasSavings / tomasIncome) * 100 : 0;

  const mirandaSavings = mirandaIncome - mirandaExpense;
  const mirandaRate = mirandaIncome > 0 ? (mirandaSavings / mirandaIncome) * 100 : 0;

  const householdIncome = tomasIncome + mirandaIncome;
  const householdExpense = tomasExpense + mirandaExpense;
  const householdSavings = householdIncome - householdExpense;
  const householdRate = householdIncome > 0 ? (householdSavings / householdIncome) * 100 : 0;

  return {
    tomasIncome,
    tomasExpense,
    tomasSavings,
    tomasRate: Math.round(tomasRate * 10) / 10,

    mirandaIncome,
    mirandaExpense,
    mirandaSavings,
    mirandaRate: Math.round(mirandaRate * 10) / 10,

    householdIncome,
    householdExpense,
    householdSavings,
    householdRate: Math.round(householdRate * 10) / 10,
  };
}

/**
 * Agrupa transacciones por mes para el gráfico de barras Ingresos vs Gastos
 */
export function getMonthlyMetrics(transactions: Transaction[], monthsCount = 6): MonthlyMetric[] {
  const monthsMap = new Map<string, { ingresos: number; gastos: number }>();

  // Generar los últimos N meses en orden cronológico
  const now = new Date();
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    monthsMap.set(key, { ingresos: 0, gastos: 0 });
  }

  for (const t of transactions) {
    if (t.isSettlement) continue;
    const key = (t.date || '').slice(0, 7);
    if (monthsMap.has(key)) {
      const entry = monthsMap.get(key)!;
      if (t.type === 'ingreso') entry.ingresos += t.amount;
      if (t.type === 'gasto') entry.gastos += t.amount;
    }
  }

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const results: MonthlyMetric[] = [];
  monthsMap.forEach((val, key) => {
    const [, monthStr] = key.split('-');
    const mIdx = parseInt(monthStr, 10) - 1;
    const label = monthNames[mIdx] || key;
    results.push({
      monthKey: key,
      monthLabel: label,
      ingresos: val.ingresos,
      gastos: val.gastos,
      ahorro: val.ingresos - val.gastos,
    });
  });

  return results;
}

/**
 * Calcula la distribución de gastos por categoría para el gráfico Doughnut
 */
export function getCategoryDistribution(
  transactions: Transaction[],
  categories: Category[],
  monthFilter?: string
): CategoryDistribution[] {
  const categoryMap = new Map<string, number>();
  let totalExpense = 0;

  const filtered = transactions.filter((t) => {
    if (t.type !== 'gasto' || t.isSettlement) return false;
    if (monthFilter && !t.date.startsWith(monthFilter)) return false;
    return true;
  });

  for (const t of filtered) {
    const cat = t.category || 'Otros Gastos';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
    totalExpense += t.amount;
  }

  if (totalExpense === 0) return [];

  const categoryColorMap = new Map(categories.map((c) => [c.name, c.color]));

  const result: CategoryDistribution[] = [];
  categoryMap.forEach((amount, category) => {
    result.push({
      category,
      amount,
      percentage: Math.round((amount / totalExpense) * 1000) / 10,
      color: categoryColorMap.get(category) || '#94a3b8',
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}
