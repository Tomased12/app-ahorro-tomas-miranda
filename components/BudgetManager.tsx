'use client';

import React, { useState } from 'react';
import { Target, Plus, AlertCircle, CheckCircle2, TrendingUp, Edit3, X, Sparkles } from 'lucide-react';
import { Budget, BudgetStatus, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BudgetManagerProps {
  budgetStatuses: BudgetStatus[];
  categories: Category[];
  budgets: Budget[];
  onSaveBudget: (budget: Omit<Budget, 'id'>, id?: string) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
  monthLabel: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgetStatuses,
  categories,
  budgets,
  onSaveBudget,
  onDeleteBudget,
  monthLabel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAddModal = (existingCategory?: string, currentLimit?: number, id?: string) => {
    if (existingCategory) {
      setSelectedCategory(existingCategory);
      setLimitAmount(currentLimit ? currentLimit.toString() : '');
      setEditingBudgetId(id || null);
    } else {
      setSelectedCategory(categories[0]?.name || '');
      setLimitAmount('');
      setEditingBudgetId(null);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limitAmount);
    if (isNaN(numLimit) || numLimit <= 0) {
      alert('Ingresa un límite mensual válido mayor a 0');
      return;
    }

    try {
      setIsSaving(true);
      await onSaveBudget(
        {
          category: selectedCategory,
          monthlyLimit: numLimit,
        },
        editingBudgetId || undefined
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el presupuesto');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Presupuestos y Límites por Categoría
              <span className="text-xs font-normal text-slate-400">({monthLabel})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Controla topes de gasto mensual para no excederte del presupuesto
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Fijar Presupuesto</span>
        </button>
      </div>

      {/* Listado de Presupuestos */}
      {budgetStatuses.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-500 text-xs">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-300">No tienes presupuestos configurados</p>
          <p className="mt-1">Define límites en Supermercado, Salidas o Servicios para alertarte cuando estés por alcanzarlos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatuses.map((bs) => {
            const isExceeded = bs.isOverBudget;
            const isWarning = bs.percentage >= 80 && !isExceeded;
            const existingBudget = budgets.find(
              (b) => b.category.toLowerCase() === bs.category.toLowerCase()
            );

            return (
              <div
                key={bs.category}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: bs.color || '#6366f1' }}
                    />
                    <span className="font-bold text-sm text-slate-100">{bs.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                        isExceeded
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {bs.percentage}% consumido
                    </span>

                    <button
                      onClick={() =>
                        handleOpenAddModal(bs.category, bs.limit, existingBudget?.id)
                      }
                      className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Editar límite"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Barra de progreso de consumo */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, bs.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Valores numéricos */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                  <div>
                    <span>Gastado: </span>
                    <strong className={isExceeded ? 'text-rose-400' : 'text-slate-200'}>
                      {formatCurrency(bs.spent)}
                    </strong>
                  </div>
                  <div>
                    <span>Límite: </span>
                    <strong className="text-white">{formatCurrency(bs.limit)}</strong>
                  </div>
                </div>

                {/* Estado restante o excedido */}
                <div className="text-[11px] font-medium flex items-center gap-1.5 pt-0.5">
                  {isExceeded ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400">
                        Excedido por {formatCurrency(bs.spent - bs.limit)}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400">
                        Te quedan <strong className="text-emerald-400">{formatCurrency(bs.remaining)}</strong> disponibles
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear / Editar Presupuesto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {editingBudgetId ? 'Editar Límite' : 'Fijar Presupuesto'}
                </h4>
                <p className="text-xs text-slate-400">Define el monto mensual máximo</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={Boolean(editingBudgetId)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Límite Mensual (ARS)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    placeholder="250000"
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {editingBudgetId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Eliminar este presupuesto?')) {
                        onDeleteBudget(editingBudgetId);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Eliminar
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
