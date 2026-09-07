'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  DollarSign,
  Tag,
  User,
  PieChart,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  SplitType,
  UserProfile,
  TransactionStatus,
  Category,
} from '@/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id'>) => Promise<void>;
  categories: Category[];
  onOpenNewCategoryModal: () => void;
  defaultUser?: UserProfile;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  onOpenNewCategoryModal,
  defaultUser = 'Tomas',
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('gasto');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Otros Gastos');
  const [paidBy, setPaidBy] = useState<UserProfile>(defaultUser);
  const [splitType, setSplitType] = useState<SplitType>('compartido_50_50');
  const [customTomas, setCustomTomas] = useState(50);
  const [customMiranda, setCustomMiranda] = useState(50);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TransactionStatus>('pagado');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setPaidBy(initialData.paidBy);
      setSplitType(initialData.splitType);
      setDate(initialData.date);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
      if (initialData.customSplit) {
        setCustomTomas(initialData.customSplit.tomas);
        setCustomMiranda(initialData.customSplit.miranda);
      }
    } else {
      setType('gasto');
      setTitle('');
      setAmount('');
      setCategory(categories[0]?.name || 'Otros Gastos');
      setPaidBy(defaultUser);
      setSplitType('compartido_50_50');
      setDate(new Date().toISOString().slice(0, 10));
      setStatus('pagado');
      setNotes('');
      setCustomTomas(50);
      setCustomMiranda(50);
    }
  }, [initialData, isOpen, defaultUser, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!title.trim()) {
      alert('Ingresa una descripción o título para el movimiento');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        type,
        title: title.trim(),
        amount: numAmount,
        category,
        paidBy,
        splitType,
        customSplit:
          splitType === 'personalizado'
            ? { tomas: customTomas, miranda: customMiranda, mode: 'percentage' }
            : undefined,
        date,
        status,
        notes: notes.trim(),
        createdAt: initialData?.createdAt || Date.now(),
      });
      onClose();
    } catch (err) {
      console.error('Error guardando transacción:', err);
      alert('Ocurrió un error al guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-5">
          {initialData ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Tipo (Gasto vs Ingreso) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('gasto')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'gasto'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Gasto</span>
            </button>

            <button
              type="button"
              onClick={() => setType('ingreso')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                type === 'ingreso'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Ingreso</span>
            </button>
          </div>

          {/* Monto (ARS) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Monto (ARS)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                $
              </div>
              <input
                type="number"
                step="any"
                min="0"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xl sm:text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Título / Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción o Título
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Supermercado Coto, Edenor, Sueldo..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Categoría con botón para + Nueva */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Categoría</label>
              <button
                type="button"
                onClick={onOpenNewCategoryModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Categoría</span>
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pagado por (Tomas o Miranda) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {type === 'gasto' ? '¿Quién lo pagó?' : '¿Quién lo cobró?'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy('Tomas')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                  paidBy === 'Tomas'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Tomas</span>
              </button>

              <button
                type="button"
                onClick={() => setPaidBy('Miranda')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                  paidBy === 'Miranda'
                    ? 'bg-pink-600/20 border-pink-500 text-pink-300 ring-1 ring-pink-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                <span>Miranda</span>
              </button>
            </div>
          </div>

          {/* División del Gasto (Splitwise) - Solo para gastos */}
          {type === 'gasto' && (
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                División del Gasto
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSplitType('compartido_50_50')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    splitType === 'compartido_50_50'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-bold">Compartido (50 / 50)</p>
                  <p className="text-[10px] text-slate-400">Dividido en partes iguales</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSplitType(paidBy === 'Tomas' ? 'exclusivo_tomas' : 'exclusivo_miranda')
                  }
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    splitType === 'exclusivo_tomas' || splitType === 'exclusivo_miranda'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-bold">Exclusivo de {paidBy}</p>
                  <p className="text-[10px] text-slate-400">No genera deuda entre ambos</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSplitType(paidBy === 'Tomas' ? 'exclusivo_miranda' : 'exclusivo_tomas')
                  }
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    (paidBy === 'Tomas' && splitType === 'exclusivo_miranda') ||
                    (paidBy === 'Miranda' && splitType === 'exclusivo_tomas')
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-bold">
                    Cubierto para {paidBy === 'Tomas' ? 'Miranda' : 'Tomas'}
                  </p>
                  <p className="text-[10px] text-slate-400">El otro debe el 100%</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitType('personalizado')}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    splitType === 'personalizado'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-bold">Personalizado %</p>
                  <p className="text-[10px] text-slate-400">Porcentajes a medida</p>
                </button>
              </div>

              {splitType === 'personalizado' && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-blue-400 font-semibold block mb-1">
                      % Tomas ({customTomas}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customTomas}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCustomTomas(val);
                        setCustomMiranda(100 - val);
                      }}
                      className="w-full accent-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-pink-400 font-semibold block mb-1">
                      % Miranda ({customMiranda}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={customMiranda}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCustomMiranda(val);
                        setCustomTomas(100 - val);
                      }}
                      className="w-full accent-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fecha & Estado (Pagado / Pendiente) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estado
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus('pagado')}
                  className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    status === 'pagado'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pagado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('pendiente')}
                  className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    status === 'pendiente'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pendiente</span>
                </button>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
