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
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  Transaction,
  Category,
  UserFilter,
  UserProfile,
  TransactionType,
  TransactionStatus,
} from '@/types';
import {
  DEFAULT_CATEGORIES,
  calculateSplitwiseBalance,
  calculateSavingsPower,
  getMonthlyMetrics,
  getCategoryDistribution,
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
import { FirebaseConfigBanner } from '@/components/FirebaseConfigBanner';
import { Plus } from 'lucide-react';

const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'sample-1',
    type: 'ingreso',
    title: 'Sueldo Tomas',
    amount: 1200000,
    category: 'Sueldo / Ingresos',
    paidBy: 'Tomas',
    splitType: 'exclusivo_tomas',
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
    date: new Date().toISOString().slice(0, 7) + '-06',
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
    date: new Date().toISOString().slice(0, 7) + '-10',
    status: 'pagado',
  },
  {
    id: 'sample-6',
    type: 'gasto',
    title: 'Metrogas',
    amount: 18500,
    category: 'Gas',
    paidBy: 'Tomas',
    splitType: 'compartido_50_50',
    date: new Date().toISOString().slice(0, 7) + '-12',
    status: 'pagado',
  },
  {
    id: 'sample-7',
    type: 'gasto',
    title: 'Flow & Internet Fibra',
    amount: 34000,
    category: 'Flow / Internet',
    paidBy: 'Miranda',
    splitType: 'compartido_50_50',
    date: new Date().toISOString().slice(0, 7) + '-14',
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
    date: new Date().toISOString().slice(0, 7) + '-20',
    status: 'pendiente',
    notes: 'Vence el 20',
  },
];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeUser, setActiveUser] = useState<UserFilter>('Todos');
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const isLiveFirebase = isFirebaseConfigured() && db !== null;

  // 1. Sincronización en tiempo real con Firestore para Transacciones
  useEffect(() => {
    if (isLiveFirebase && db) {
      const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              ...data,
            } as Transaction);
          });
          setTransactions(list);
        },
        (error) => {
          console.error('Error suscribiendo a Firestore transactions:', error);
        }
      );
      return () => unsubscribe();
    } else {
      // Modo Local / Demo: Cargar desde localStorage si existe
      try {
        const localData = localStorage.getItem('local_transactions');
        if (localData) {
          setTransactions(JSON.parse(localData));
        }
      } catch (e) {
        console.warn('Error reading local transactions:', e);
      }
    }
  }, [isLiveFirebase]);

  // 2. Sincronización en tiempo real con Firestore para Categorías
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

          // Mezclar categorías por defecto y personalizadas sin duplicar
          const defaultNames = new Set(DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase()));
          const uniqueCustom = customCats.filter(
            (c) => !defaultNames.has(c.name.toLowerCase())
          );
          setCategories([...DEFAULT_CATEGORIES, ...uniqueCustom]);
        },
        (error) => {
          console.error('Error suscribiendo a Firestore categories:', error);
        }
      );
      return () => unsubscribe();
    } else {
      try {
        const localCats = localStorage.getItem('local_categories');
        if (localCats) {
          setCategories(JSON.parse(localCats));
        }
      } catch (e) {
        console.warn('Error reading local categories:', e);
      }
    }
  }, [isLiveFirebase]);

  // Guardar en localStorage cuando se opera en modo local
  const saveLocalTransactions = (newTxList: Transaction[]) => {
    setTransactions(newTxList);
    try {
      localStorage.setItem('local_transactions', JSON.stringify(newTxList));
    } catch (e) {
      console.warn(e);
    }
  };

  const saveLocalCategories = (newCats: Category[]) => {
    setCategories(newCats);
    try {
      localStorage.setItem('local_categories', JSON.stringify(newCats));
    } catch (e) {
      console.warn(e);
    }
  };

  // Cargar datos de ejemplo para demostración rápida
  const handleLoadMockData = () => {
    saveLocalTransactions(INITIAL_SAMPLE_TRANSACTIONS);
  };

  // Crear o Editar Transacción
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (isLiveFirebase && db) {
      if (editingTx) {
        const docRef = doc(db, 'transactions', editingTx.id);
        await updateDoc(docRef, { ...txData });
      } else {
        await addDoc(collection(db, 'transactions'), {
          ...txData,
          createdAt: serverTimestamp(),
        });
      }
    } else {
      // Modo local
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
    }
    setEditingTx(null);
  };

  // Eliminar Transacción
  const handleDeleteTransaction = async (id: string) => {
    if (isLiveFirebase && db) {
      await deleteDoc(doc(db, 'transactions', id));
    } else {
      const filtered = transactions.filter((t) => t.id !== id);
      saveLocalTransactions(filtered);
    }
  };

  // Alternar Estado Pagado / Pendiente con un clic
  const handleToggleStatus = async (transaction: Transaction) => {
    const nextStatus: TransactionStatus =
      transaction.status === 'pagado' ? 'pendiente' : 'pagado';
    if (isLiveFirebase && db) {
      const docRef = doc(db, 'transactions', transaction.id);
      await updateDoc(docRef, { status: nextStatus });
    } else {
      const updated = transactions.map((t) =>
        t.id === transaction.id ? { ...t, status: nextStatus } : t
      );
      saveLocalTransactions(updated);
    }
  };

  // Crear nueva categoría personalizada
  const handleSaveCategory = async (catData: Omit<Category, 'id'>) => {
    if (isLiveFirebase && db) {
      await addDoc(collection(db, 'categories'), catData);
    } else {
      const newCat: Category = {
        ...catData,
        id: 'cat-' + Date.now(),
      };
      saveLocalCategories([...categories, newCat]);
    }
  };

  // Saldar Deuda (Splitwise settlement)
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
      date: new Date().toISOString().slice(0, 10),
      status: 'pagado',
      isSettlement: true,
      notes: 'Movimiento automático para equilibrar balance Splitwise',
      createdAt: Date.now(),
    };

    if (isLiveFirebase && db) {
      await addDoc(collection(db, 'transactions'), {
        ...settlementTx,
        createdAt: serverTimestamp(),
      });
    } else {
      const newTx: Transaction = {
        ...settlementTx,
        id: 'settle-' + Date.now(),
      };
      saveLocalTransactions([newTx, ...transactions]);
    }
  };

  // Filtros aplicados a la lista de transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filtro de mes
      if (monthFilter && (!t.date || !t.date.startsWith(monthFilter))) {
        return false;
      }
      // Filtro de usuario
      if (activeUser !== 'Todos' && t.paidBy !== activeUser) {
        return false;
      }
      // Filtro de categoría
      if (categoryFilter !== 'Todas' && t.category !== categoryFilter) {
        return false;
      }
      // Filtro de estado
      if (statusFilter !== 'todos' && t.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, monthFilter, activeUser, categoryFilter, statusFilter]);

  // Cálculos reactivos de Splitwise, Poder de Ahorro y Gráficos
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
      {/* Barra de navegación superior */}
      <Navbar
        activeUser={activeUser}
        onSelectUser={setActiveUser}
        isLiveFirebase={isLiveFirebase}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner de configuración si Firebase no está vinculado */}
        {!isLiveFirebase && (
          <FirebaseConfigBanner
            onLoadMockData={handleLoadMockData}
            hasMockData={transactions.length > 0}
          />
        )}

        {/* 1. Módulo Splitwise (Balance Compartido) */}
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
