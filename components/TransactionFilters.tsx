'use client';

import React from 'react';
import { Download, Filter, Calendar, Tag, UserCheck, RefreshCw } from 'lucide-react';
import { Category, UserFilter, TransactionStatus } from '@/types';

interface TransactionFiltersProps {
  monthFilter: string; // YYYY-MM o ''
  onMonthChange: (month: string) => void;
  userFilter: UserFilter;
  onUserChange: (user: UserFilter) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  statusFilter: string; // 'todos' | 'pagado' | 'pendiente'
  onStatusChange: (status: string) => void;
  categories: Category[];
  onExportCSV: () => void;
  onResetFilters: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  monthFilter,
  onMonthChange,
  userFilter,
  onUserChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  categories,
  onExportCSV,
  onResetFilters,
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Filtros de Búsqueda</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Filtro de Mes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Mes / Período
          </label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filtro de Usuario */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Usuario
          </label>
          <select
            value={userFilter}
            onChange={(e) => onUserChange(e.target.value as UserFilter)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Todos">Todos</option>
            <option value="Tomas">Tomas</option>
            <option value="Miranda">Miranda</option>
          </select>
        </div>

        {/* Filtro de Categoría */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Categoría
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
          >
            <option value="Todas">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Estado */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Estado de Pago
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="pagado">Pagados</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>
      </div>
    </div>
  );
};
