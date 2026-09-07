'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, sanitizeData } from '@/lib/firebase';
import {
  Transaction,
  Category,
  UserFilter,
  UserProfile,
  TransactionType,
  TransactionStatus,
  Budget,
  SavingsGoal,
} from '@/types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGETS,
  DEFAULT_SAVINGS_GOALS,
  calculateSplitwiseBalance,
  calculateSavingsPower,
  getMonthlyMetrics,
  getCategoryDistribution,
  calculateBudgetStatuses,
  getUpcomingBills,
} from '@/lib/finance';
import { exportTransactionsToCSV } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { BalanceCard } from '@/components/BalanceCard';
import { SavingsPowerCard } from '@/components/SavingsPowerCard';
import { MetricsCharts } from '@/components/MetricsCharts';
import { TransactionFilters } from '@/components/TransactionFilters';
import { TransactionList } from '@/components/TransactionList';
import { TransactionModal } from '@/components/TransactionModal';
import { CategoryModal } from '@/components/CategoryModal';
import { BudgetManager } from '@/components/BudgetManager';
import { BillsCalendar } from '@/components/BillsCalendar';
import { SavingsGoalsSection } from '@/components/SavingsGoalsSection';
import { FirebaseConfigBanner } from '@/components/FirebaseConfigBanner';
import {
  Plus,
  LayoutDashboard,
  Target,
  CalendarDays,
  PiggyBank,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

type ActiveTab = 'resumen' | 'presupuestos' | 'vencimientos' | 'chanchitos';

const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'sample-1',
    type: 'ingreso',
    title: 'Sueldo Tomas',
    amount: 1200000,
    category: 'Sueldo / Ingresos',
    paidBy: 'Tomas',
    splitType: 'exclusivo_tomas',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-05',
    status: 'pagado',
    notes: 'Haberes mensuales',
  },
  {
    id: 'sample-2',
    type: 'ingreso',
    title: 'Sueldo Miranda',
    amount: 1100000,
    category: 'Sueldo / Ingresos',
    paidBy: 'Miranda',
    splitType: 'exclusivo_miranda',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-05',
    status: 'pagado',
    notes: 'Honorarios profesionales',
  },
  {
    id: 'sample-3',
    type: 'gasto',
    title: 'Alquiler Departamento',
    amount: 550000,
    category: 'Alquiler',
    paidBy: 'Tomas',
    splitType: 'compartido_50_50',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-06',
    dueDate: new Date().toISOString().slice(0, 7) + '-10',
    status: 'pagado',
    notes: 'Mes en curso',
  },
  {
    id: 'sample-4',
    type: 'gasto',
    title: 'Supermercado Coto',
    amount: 160000,
    category: 'Supermercado',
    paidBy: 'Miranda',
    splitType: 'compartido_50_50',
    paymentMethod: 'debito',
    date: new Date().toISOString().slice(0, 7) + '-07',
    status: 'pagado',
    notes: 'Compra mensual grande',
  },
  {
    id: 'sample-5',
    type: 'gasto',
    title: 'Edenor (Luz)',
    amount: 42000,
    category: 'Luz',
    paidBy: 'Tomas',
    splitType: 'compartido_50_50',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-10',
    dueDate: new Date().toISOString().slice(0, 7) + '-18',
    status: 'pendiente',
  },
  {
    id: 'sample-6',
    type: 'gasto',
    title: 'Metrogas',
    amount: 18500,
    category: 'Gas',
    paidBy: 'Tomas',
    splitType: 'compartido_50_50',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-12',
    dueDate: new Date().toISOString().slice(0, 7) + '-22',
    status: 'pendiente',
  },
  {
    id: 'sample-7',
    type: 'gasto',
    title: 'Flow & Internet Fibra',
    amount: 34000,
    category: 'Flow / Internet',
    paidBy: 'Miranda',
    splitType: 'compartido_50_50',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-14',
    dueDate: new Date().toISOString().slice(0, 7) + '-15',
    status: 'pagado',
  },
  {
    id: 'sample-8',
    type: 'gasto',
    title: 'Cena Restaurante Palermo',
    amount: 68000,
    category: 'Salidas y Restaurantes',
    paidBy: 'Tomas',
    splitType: 'compartido_50_50',
    paymentMethod: 'credito',
    installments: { current: 1, total: 3 },
    date: new Date().toISOString().slice(0, 7) + '-15',
    status: 'pagado',
  },
  {
    id: 'sample-9',
    type: 'gasto',
    title: 'Tarjeta de Crédito Visa (Tomas)',
    amount: 120000,
    category: 'Tarjetas / Deudas Pendientes',
    paidBy: 'Tomas',
    splitType: 'exclusivo_tomas',
    paymentMethod: 'transferencia',
    date: new Date().toISOString().slice(0, 7) + '-20',
    dueDate: new Date().toISOString().slice(0, 7) + '-20',
    status: 'pendiente',
    notes: 'Vence el 20',
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resumen');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [goals, setGoals] = useState<SavingsGoal[]>(DEFAULT_SAVINGS_GOALS);
  const [activeUser, setActiveUser] = useState<UserFilter>('Todos');
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Notificaciones y errores
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const isLiveFirebase = isFirebaseConfigured() && db !== null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Sincronización de Transacciones
  useEffect(() => {
    if (isLiveFirebase && db) {
      const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setFirestoreError(null);
          const list: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            list.push({
              id: docSnap.id,
              ...docSnap.data(),
            } as Transaction);
          });
          setTransactions(list);
        },
        (error) => {
          console.error('Error Firestore transactions:', error);
          if (error.code === 'permission-denied') {
            setFirestoreError(
              '⚠️ Permiso denegado en Firestore: Asegúrate de publicar las reglas en Firebase Console > Firestore Database > Reglas.'
            );
          }
          // Cargar de local si Firestore falla
          try {
            const local = localStorage.getItem('local_transactions');
            if (local) setTransactions(JSON.parse(local));
          } catch (e) {
            console.warn(e);
          }
        }
      );
      return () => unsubscribe();
    } else {
      try {
        const local = localStorage.getItem('local_transactions');
        if (local) setTransactions(JSON.parse(local));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isLiveFirebase]);

  // 2. Sincronización de Categorías
  useEffect(() => {
    if (isLiveFirebase && db) {
      const q = query(collection(db, 'categories'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const customCats: Category[] = [];
          snapshot.forEach((docSnap) => {
            customCats.push({
              id: docSnap.id,
              ...docSnap.data(),
            } as Category);
          });
          const defaultNames = new Set(DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase()));
          const uniqueCustom = customCats.filter(
            (c) => !defaultNames.has(c.name.toLowerCase())
          );
          setCategories([...DEFAULT_CATEGORIES, ...uniqueCustom]);
        },
        (error) => console.warn('Error categories:', error)
      );
      return () => unsubscribe();
    }
  }, [isLiveFirebase]);

  // 3. Sincronización de Presupuestos
  useEffect(() => {
    if (isLiveFirebase && db) {
      const q = query(collection(db, 'budgets'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Budget[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as Budget);
            });
            setBudgets(list);
          } else {
            try {
              const local = localStorage.getItem('local_budgets');
              if (local !== null) {
                setBudgets(JSON.parse(local));
              }
            } catch (e) {
              console.warn(e);
            }
          }
        },
        (error) => console.warn('Error budgets:', error)
      );
      return () => unsubscribe();
    } else {
      try {
        const local = localStorage.getItem('local_budgets');
        if (local !== null) setBudgets(JSON.parse(local));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isLiveFirebase]);

  // 4. Sincronización de Metas de Ahorro (Chanchitos)
  useEffect(() => {
    if (isLiveFirebase && db) {
      const q = query(collection(db, 'savings_goals'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: SavingsGoal[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as SavingsGoal);
            });
            setGoals(list);
          }
        },
        (error) => console.warn('Error savings_goals:', error)
      );
      return () => unsubscribe();
    }
  }, [isLiveFirebase]);

  const saveLocalTransactions = (newTxList: Transaction[]) => {
    setTransactions(newTxList);
    try {
      localStorage.setItem('local_transactions', JSON.stringify(newTxList));
    } catch (e) {
      console.warn(e);
    }
  };

  // Cargar datos de ejemplo en Firestore o Local
  const handleLoadMockData = async () => {
    if (isLiveFirebase && db) {
      try {
        for (const sample of INITIAL_SAMPLE_TRANSACTIONS) {
          const { id, ...data } = sample;
          await addDoc(collection(db, 'transactions'), {
            ...sanitizeData(data),
            createdAt: serverTimestamp(),
          });
        }
        showToast('✅ Datos iniciales cargados en Firebase Firestore.');
      } catch (err) {
        console.error(err);
        saveLocalTransactions(INITIAL_SAMPLE_TRANSACTIONS);
        showToast('✅ Datos cargados localmente.');
      }
    } else {
      saveLocalTransactions(INITIAL_SAMPLE_TRANSACTIONS);
      showToast('✅ Datos de ejemplo cargados.');
    }
  };

  // Crear o Editar Transacción
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id'>) => {
    const cleanData = sanitizeData(txData);

    if (isLiveFirebase && db) {
      try {
        if (editingTx) {
          const docRef = doc(db, 'transactions', editingTx.id);
          await updateDoc(docRef, cleanData);
          showToast('✅ Movimiento actualizado correctamente.');
        } else {
          await addDoc(collection(db, 'transactions'), {
            ...cleanData,
            createdAt: serverTimestamp(),
          });
          showToast('✅ Movimiento registrado en tiempo real.');
        }
      } catch (err: any) {
        console.error('Error al guardar en Firestore:', err);
        // Fallback local
        if (editingTx) {
          const updated = transactions.map((t) =>
            t.id === editingTx.id ? { ...txData, id: editingTx.id } : t
          );
          saveLocalTransactions(updated);
        } else {
          const newTx: Transaction = {
            ...txData,
            id: 'local-' + Date.now(),
          };
          saveLocalTransactions([newTx, ...transactions]);
        }
        showToast('💾 Guardado localmente (Revisa reglas de Firestore).');
      }
    } else {
      if (editingTx) {
        const updated = transactions.map((t) =>
          t.id === editingTx.id ? { ...txData, id: editingTx.id } : t
        );
        saveLocalTransactions(updated);
      } else {
        const newTx: Transaction = {
          ...txData,
          id: 'local-' + Date.now(),
        };
        saveLocalTransactions([newTx, ...transactions]);
      }
      showToast('✅ Movimiento guardado.');
    }
    setEditingTx(null);
  };

  // Eliminar Transacción
  const handleDeleteTransaction = async (id: string) => {
    if (isLiveFirebase && db) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
        showToast('🗑️ Movimiento eliminado.');
      } catch (err) {
        console.error('Error al eliminar en Firestore:', err);
        const filtered = transactions.filter((t) => t.id !== id);
        saveLocalTransactions(filtered);
        showToast('🗑️ Movimiento eliminado localmente.');
      }
    } else {
      const filtered = transactions.filter((t) => t.id !== id);
      saveLocalTransactions(filtered);
      showToast('🗑️ Movimiento eliminado.');
    }
  };

  // Alternar Estado Pagado / Pendiente
  const handleToggleStatus = async (transaction: Transaction) => {
    const nextStatus: TransactionStatus =
      transaction.status === 'pagado' ? 'pendiente' : 'pagado';
    if (isLiveFirebase && db) {
      try {
        const docRef = doc(db, 'transactions', transaction.id);
        await updateDoc(docRef, { status: nextStatus });
      } catch (err) {
        console.error(err);
        const updated = transactions.map((t) =>
          t.id === transaction.id ? { ...t, status: nextStatus } : t
        );
        saveLocalTransactions(updated);
      }
    } else {
      const updated = transactions.map((t) =>
        t.id === transaction.id ? { ...t, status: nextStatus } : t
      );
      saveLocalTransactions(updated);
    }
  };

  const handleToggleStatusById = async (id: string, currentStatus: 'pendiente' | 'pagado') => {
    const nextStatus: TransactionStatus = currentStatus === 'pagado' ? 'pendiente' : 'pagado';
    if (isLiveFirebase && db) {
      try {
        const docRef = doc(db, 'transactions', id);
        await updateDoc(docRef, { status: nextStatus });
        showToast(`Estado cambiado a ${nextStatus}`);
      } catch (err) {
        console.error(err);
        const updated = transactions.map((t) =>
          t.id === id ? { ...t, status: nextStatus } : t
        );
        saveLocalTransactions(updated);
      }
    } else {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, status: nextStatus } : t
      );
      saveLocalTransactions(updated);
    }
  };

  // Categoría
  const handleSaveCategory = async (catData: Omit<Category, 'id'>) => {
    const clean = sanitizeData(catData);
    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'categories'), clean);
        showToast('✅ Categoría creada.');
      } catch (err) {
        setCategories([...categories, { ...catData, id: 'cat-' + Date.now() }]);
      }
    } else {
      setCategories([...categories, { ...catData, id: 'cat-' + Date.now() }]);
    }
  };

  // Presupuestos
  const handleSaveBudget = async (budgetData: Omit<Budget, 'id'>, id?: string) => {
    const clean = sanitizeData(budgetData);
    const existingIdx = budgets.findIndex(
      (b) => (id && b.id === id) || b.category.toLowerCase() === budgetData.category.toLowerCase()
    );

    const budgetId = id || (existingIdx >= 0 ? budgets[existingIdx].id : 'b-' + Date.now());
    let updatedList: Budget[];

    if (existingIdx >= 0) {
      updatedList = budgets.map((b, idx) =>
        idx === existingIdx ? ({ ...clean, id: budgetId } as Budget) : b
      );
    } else {
      updatedList = [...budgets, { ...clean, id: budgetId } as Budget];
    }

    setBudgets(updatedList);
    try {
      localStorage.setItem('local_budgets', JSON.stringify(updatedList));
    } catch (e) {
      console.warn(e);
    }

    if (isLiveFirebase && db) {
      try {
        if (id && !id.startsWith('b-')) {
          await updateDoc(doc(db, 'budgets', id), clean);
        } else {
          const docRef = await addDoc(collection(db, 'budgets'), clean);
          setBudgets((prev) =>
            prev.map((b) => (b.id === budgetId ? { ...b, id: docRef.id } : b))
          );
        }
      } catch (err) {
        console.warn('Firestore budget save:', err);
      }
    }
    showToast('🎯 Presupuesto guardado con éxito.');
  };

  const handleDeleteBudget = async (identifier: string) => {
    const filtered = budgets.filter(
      (b) => b.id !== identifier && b.category.toLowerCase() !== identifier.toLowerCase()
    );
    setBudgets(filtered);
    try {
      localStorage.setItem('local_budgets', JSON.stringify(filtered));
    } catch (e) {
      console.warn(e);
    }

    if (isLiveFirebase && db) {
      try {
        await deleteDoc(doc(db, 'budgets', identifier));
      } catch (err) {
        console.warn('Firestore budget delete:', err);
      }
    }
    showToast('🗑️ Presupuesto eliminado.');
  };

  const handleResetDefaultBudgets = () => {
    setBudgets(DEFAULT_BUDGETS);
    try {
      localStorage.setItem('local_budgets', JSON.stringify(DEFAULT_BUDGETS));
    } catch (e) {
      console.warn(e);
    }
    showToast('🔄 Presupuestos predeterminados restaurados.');
  };

  // Metas de Ahorro
  const handleSaveGoal = async (goalData: Omit<SavingsGoal, 'id'>) => {
    const clean = sanitizeData(goalData);
    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'savings_goals'), clean);
        showToast('🐷 Chanchito creado con éxito.');
      } catch {
        setGoals([...goals, { ...goalData, id: 'goal-' + Date.now() }]);
      }
    } else {
      setGoals([...goals, { ...goalData, id: 'goal-' + Date.now() }]);
      showToast('🐷 Chanchito creado.');
    }
  };

  const handleContributeGoal = async (goalId: string, amountToAdd: number) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;
    const newAmount = target.currentAmount + amountToAdd;

    if (isLiveFirebase && db) {
      try {
        await updateDoc(doc(db, 'savings_goals', goalId), { currentAmount: newAmount });
        showToast('💰 ¡Aporte registrado con éxito!');
      } catch {
        setGoals(
          goals.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g))
        );
      }
    } else {
      setGoals(
        goals.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g))
      );
      showToast('💰 ¡Aporte registrado!');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (isLiveFirebase && db) {
      try {
        await deleteDoc(doc(db, 'savings_goals', goalId));
      } catch {
        setGoals(goals.filter((g) => g.id !== goalId));
      }
    } else {
      setGoals(goals.filter((g) => g.id !== goalId));
    }
  };

  // Saldar Deuda
  const handleSettleDebt = async (
    debtor: 'Tomas' | 'Miranda',
    creditor: 'Tomas' | 'Miranda',
    amount: number
  ) => {
    const settlementTx: Omit<Transaction, 'id'> = {
      type: 'gasto',
      title: `Compensación de saldo: ${debtor} saldó deuda con ${creditor}`,
      amount,
      category: 'Tarjetas / Deudas Pendientes',
      paidBy: debtor,
      splitType: debtor === 'Tomas' ? 'exclusivo_miranda' : 'exclusivo_tomas',
      paymentMethod: 'transferencia',
      date: new Date().toISOString().slice(0, 10),
      status: 'pagado',
      isSettlement: true,
      notes: 'Movimiento automático para equilibrar balance Splitwise',
      createdAt: Date.now(),
    };

    if (isLiveFirebase && db) {
      try {
        await addDoc(collection(db, 'transactions'), {
          ...sanitizeData(settlementTx),
          createdAt: serverTimestamp(),
        });
        showToast('🤝 ¡Deuda saldada en tiempo real!');
      } catch {
        const newTx: Transaction = {
          ...settlementTx,
          id: 'settle-' + Date.now(),
        };
        saveLocalTransactions([newTx, ...transactions]);
      }
    } else {
      const newTx: Transaction = {
        ...settlementTx,
        id: 'settle-' + Date.now(),
      };
      saveLocalTransactions([newTx, ...transactions]);
      showToast('🤝 ¡Deuda saldada!');
    }
  };

  // Filtros aplicados a la lista de transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (monthFilter && (!t.date || !t.date.startsWith(monthFilter))) return false;
      if (activeUser !== 'Todos' && t.paidBy !== activeUser) return false;
      if (categoryFilter !== 'Todas' && t.category !== categoryFilter) return false;
      if (statusFilter !== 'todos' && t.status !== statusFilter) return false;
      return true;
    });
  }, [transactions, monthFilter, activeUser, categoryFilter, statusFilter]);

  // Cálculos reactivos
  const splitwiseBalance = useMemo(
    () => calculateSplitwiseBalance(transactions),
    [transactions]
  );

  const savingsPower = useMemo(
    () => calculateSavingsPower(transactions, monthFilter),
    [transactions, monthFilter]
  );

  const monthlyMetrics = useMemo(
    () => getMonthlyMetrics(transactions, 6),
    [transactions]
  );

  const categoryDistribution = useMemo(
    () => getCategoryDistribution(transactions, categories, monthFilter),
    [transactions, categories, monthFilter]
  );

  const budgetStatuses = useMemo(
    () => calculateBudgetStatuses(transactions, budgets, categories, monthFilter),
    [transactions, budgets, categories, monthFilter]
  );

  const upcomingBills = useMemo(
    () => getUpcomingBills(transactions, monthFilter),
    [transactions, monthFilter]
  );

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      filteredTransactions,
      `finanzas-${activeUser.toLowerCase()}-${monthFilter || 'todas'}.csv`
    );
  };

  const handleResetFilters = () => {
    setMonthFilter(new Date().toISOString().slice(0, 7));
    setActiveUser('Todos');
    setCategoryFilter('Todas');
    setStatusFilter('todos');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-bold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Barra de navegación superior */}
      <Navbar
        activeUser={activeUser}
        onSelectUser={setActiveUser}
        isLiveFirebase={isLiveFirebase}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Alerta de Error de Firestore si no tiene permisos */}
        {firestoreError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">Reglas de Seguridad de Firestore Pendientes</p>
              <p className="mt-0.5">{firestoreError}</p>
              <p className="mt-1 text-slate-300">
                Entra a <strong>Firebase Console &gt; Firestore Database &gt; Reglas</strong>, pega <code className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-200">allow read, write: if true;</code> y haz clic en <strong>Publicar</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Banner si Firebase no está vinculado */}
        {!isLiveFirebase && (
          <FirebaseConfigBanner
            onLoadMockData={handleLoadMockData}
            hasMockData={transactions.length > 0}
          />
        )}

        {/* Banner si la base de datos está vacía */}
        {isLiveFirebase && transactions.length === 0 && (
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Base de Datos Conectada y Lista</h4>
                <p className="text-slate-300 text-xs">
                  Tu base de datos en Firebase está vacía. Puedes comenzar a cargar tus gastos o iniciar con datos de ejemplo.
                </p>
              </div>
            </div>

            <button
              onClick={handleLoadMockData}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all self-start sm:self-auto whitespace-nowrap"
            >
              Cargar Gastos Iniciales
            </button>
          </div>
        )}

        {/* Selector de Pestañas Principales */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'resumen'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Resumen & Splitwise</span>
          </button>

          <button
            onClick={() => setActiveTab('presupuestos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'presupuestos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Presupuestos</span>
          </button>

          <button
            onClick={() => setActiveTab('vencimientos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'vencimientos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Vencimientos</span>
            {upcomingBills.some((b) => b.urgency === 'overdue' || b.urgency === 'today') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chanchitos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'chanchitos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Chanchitos (Metas)</span>
          </button>
        </div>

        {/* VISTA 1: RESUMEN GENERAL (Splitwise, Poder de Ahorro, Métricas, Historial) */}
        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Módulo Splitwise */}
            <BalanceCard
              balance={splitwiseBalance}
              onSettleDebt={handleSettleDebt}
            />

            {/* 2. Módulo de Poder de Ahorro */}
            <SavingsPowerCard
              savings={savingsPower}
              activeUser={activeUser}
              monthLabel={monthFilter}
            />

            {/* 3. Métricas y Gráficos Visuales */}
            <MetricsCharts
              monthlyMetrics={monthlyMetrics}
              categoryDistribution={categoryDistribution}
            />

            {/* 4. Barra de Filtros y Búsqueda */}
            <TransactionFilters
              monthFilter={monthFilter}
              onMonthChange={setMonthFilter}
              userFilter={activeUser}
              onUserChange={setActiveUser}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categories={categories}
              onExportCSV={handleExportCSV}
              onResetFilters={handleResetFilters}
            />

            {/* 5. Historial de Transacciones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Historial de Movimientos
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {filteredTransactions.length}
                  </span>
                </h3>

                <button
                  onClick={() => {
                    setEditingTx(null);
                    setIsTxModalOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Movimiento</span>
                </button>
              </div>

              <TransactionList
                transactions={filteredTransactions}
                onEdit={(tx) => {
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </div>
        )}

        {/* VISTA 2: PRESUPUESTOS POR CATEGORÍA */}
        {activeTab === 'presupuestos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <BudgetManager
              budgetStatuses={budgetStatuses}
              categories={categories}
              budgets={budgets}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
              onResetDefaultBudgets={handleResetDefaultBudgets}
              monthLabel={monthFilter}
            />
          </div>
        )}

        {/* VISTA 3: CALENDARIO DE VENCIMIENTOS */}
        {activeTab === 'vencimientos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <BillsCalendar
              bills={upcomingBills}
              onToggleStatus={handleToggleStatusById}
              monthLabel={monthFilter}
            />
          </div>
        )}

        {/* VISTA 4: METAS DE AHORRO ("CHANCHITOS") */}
        {activeTab === 'chanchitos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SavingsGoalsSection
              goals={goals}
              onSaveGoal={handleSaveGoal}
              onContributeGoal={handleContributeGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>
        )}
      </main>

      {/* Botón Flotante Rápido (+) Mobile-First */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <button
          onClick={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white shadow-2xl shadow-indigo-600/50 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-slate-950"
          aria-label="Registrar movimiento"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
        defaultUser={activeUser === 'Miranda' ? 'Miranda' : 'Tomas'}
        initialData={editingTx}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSaveCategory={handleSaveCategory}
      />
    </div>
  );
}
