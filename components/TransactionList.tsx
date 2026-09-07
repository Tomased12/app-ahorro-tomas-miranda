'use client';

import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Handshake,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Tag,
  Calendar,
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (transaction: Transaction) => Promise<void>;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center text-slate-500">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-slate-400 opacity-60" />
        </div>
        <p className="text-base font-semibold text-slate-300">No se encontraron movimientos</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          No hay transacciones que coincidan con los filtros seleccionados. Presiona el botón flotante (+) para agregar una nueva.
        </p>
      </div>
    );
  }

  const getSplitLabel = (t: Transaction) => {
    if (t.isSettlement) return 'Liquidación';
    switch (t.splitType) {
      case 'compartido_50_50':
        return '50 / 50';
      case 'exclusivo_tomas':
        return 'Solo Tomas';
      case 'exclusivo_miranda':
        return 'Solo Miranda';
      case 'personalizado':
        return t.customSplit
          ? `${t.customSplit.tomas}% T / ${t.customSplit.miranda}% M`
          : 'Personalizado';
      default:
        return 'Compartido';
    }
  };

  return (
    <div className="space-y-2.5">
      {transactions.map((t) => {
        const isIncome = t.type === 'ingreso';
        const isSettlement = Boolean(t.isSettlement);

        return (
          <div
            key={t.id}
            className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            {/* Lado izquierdo: Icono + Título + Detalles */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Icono de tipo */}
              <div
                className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm ${
                  isSettlement
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : isIncome
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {isSettlement ? (
                  <Handshake className="w-5 h-5" />
                ) : isIncome ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>

              {/* Título, Categoría y Fecha */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-100 truncate">{t.title}</h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/50">
                    {t.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                  <span>{formatDate(t.date)}</span>
                  <span>•</span>
                  {/* Quien pagó */}
                  <span
                    className={`font-semibold ${
                      t.paidBy === 'Tomas' ? 'text-blue-400' : 'text-pink-400'
                    }`}
                  >
                    {t.paidBy}
                  </span>
                  <span>•</span>
                  {/* Tipo de División */}
                  <span className="text-slate-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {getSplitLabel(t)}
                  </span>
                </div>
              </div>
            </div>

            {/* Lado derecho: Monto + Estado + Acciones */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
              {/* Monto */}
              <div className="text-left sm:text-right">
                <p
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    isSettlement
                      ? 'text-purple-400'
                      : isIncome
                      ? 'text-emerald-400'
                      : 'text-white'
                  }`}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                </p>
              </div>

              {/* Botón interactivo para alternar estado Pagado / Pendiente */}
              <button
                type="button"
                onClick={() => onToggleStatus(t)}
                title="Hacer clic para cambiar entre pagado y pendiente"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  t.status === 'pagado'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                {t.status === 'pagado' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px]">Pagado</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px]">Pendiente</span>
                  </>
                )}
              </button>

              {/* Acciones de Edición y Eliminación */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(t)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar el movimiento "${t.title}"?`)) {
                      onDelete(t.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
