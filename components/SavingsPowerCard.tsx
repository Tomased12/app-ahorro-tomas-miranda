'use client';

import React from 'react';
import { PiggyBank, TrendingUp, TrendingDown, Percent, ShieldCheck, AlertCircle } from 'lucide-react';
import { SavingsPower, UserFilter } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SavingsPowerCardProps {
  savings: SavingsPower;
  activeUser: UserFilter;
  monthLabel?: string;
}

export const SavingsPowerCard: React.FC<SavingsPowerCardProps> = ({
  savings,
  activeUser,
  monthLabel,
}) => {
  // Determinamos qué métrica principal destacar según el filtro de usuario
  const isTomas = activeUser === 'Tomas';
  const isMiranda = activeUser === 'Miranda';

  const displaySavings = isTomas
    ? savings.tomasSavings
    : isMiranda
    ? savings.mirandaSavings
    : savings.householdSavings;

  const displayIncome = isTomas
    ? savings.tomasIncome
    : isMiranda
    ? savings.mirandaIncome
    : savings.householdIncome;

  const displayExpense = isTomas
    ? savings.tomasExpense
    : isMiranda
    ? savings.mirandaExpense
    : savings.householdExpense;

  const displayRate = isTomas
    ? savings.tomasRate
    : isMiranda
    ? savings.mirandaRate
    : savings.householdRate;

  const rateClamped = Math.max(0, Math.min(100, displayRate));

  const getHealthBadge = (rate: number) => {
    if (rate >= 30) {
      return {
        label: 'Ahorro Excelente (>30%)',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        barColor: 'bg-emerald-500',
      };
    }
    if (rate >= 15) {
      return {
        label: 'Ahorro Saludable (15-30%)',
        color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
        barColor: 'bg-teal-500',
      };
    }
    if (rate > 0) {
      return {
        label: 'Margen Ajustado (0-15%)',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Déficit / Gastos > Ingresos',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      barColor: 'bg-rose-500',
    };
  };

  const health = getHealthBadge(displayRate);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Poder de Ahorro
              <span className="text-xs font-normal text-slate-400">
                ({monthLabel || 'Mes Actual'})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isTomas
                ? 'Perspectiva individual de Tomas'
                : isMiranda
                ? 'Perspectiva individual de Miranda'
                : 'Poder de ahorro conjunto del Hogar'}
            </p>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${health.color}`}
        >
          {displayRate >= 0 ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          <span>{health.label}</span>
        </div>
      </div>

      {/* Métrica Principal: Monto de Ahorro + Tasa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4">
        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Ingresos Totales
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            {formatCurrency(displayIncome)}
          </p>
        </div>

        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            Gastos Totales
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
            {formatCurrency(displayExpense)}
          </p>
        </div>

        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
            Capacidad de Ahorro
          </span>
          <p
            className={`text-lg sm:text-xl font-black mt-1 ${
              displaySavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(displaySavings)}
          </p>
        </div>
      </div>

      {/* Barra de progreso de Ahorro */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-medium">Tasa de Ahorro sobre Ingresos</span>
          <span
            className={`font-bold ${
              displayRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {displayRate}%
          </span>
        </div>
        <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${health.barColor}`}
            style={{ width: `${rateClamped}%` }}
          />
        </div>
      </div>

      {/* Desglose Individual: Tomas vs Miranda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
        {/* Tomas */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isTomas
              ? 'bg-blue-950/30 border-blue-500/40 ring-1 ring-blue-500/20'
              : 'bg-slate-900/50 border-slate-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-xs font-bold text-slate-200">Ahorro de Tomas</span>
            </div>
            <span
              className={`text-xs font-bold ${
                savings.tomasRate >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {savings.tomasRate}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Ingresos: {formatCurrency(savings.tomasIncome)}</span>
            <span className="text-sm font-extrabold text-white">
              {formatCurrency(savings.tomasSavings)}
            </span>
          </div>
        </div>

        {/* Miranda */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isMiranda
              ? 'bg-pink-950/30 border-pink-500/40 ring-1 ring-pink-500/20'
              : 'bg-slate-900/50 border-slate-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
              <span className="text-xs font-bold text-slate-200">Ahorro de Miranda</span>
            </div>
            <span
              className={`text-xs font-bold ${
                savings.mirandaRate >= 0 ? 'text-pink-400' : 'text-rose-400'
              }`}
            >
              {savings.mirandaRate}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Ingresos: {formatCurrency(savings.mirandaIncome)}</span>
            <span className="text-sm font-extrabold text-white">
              {formatCurrency(savings.mirandaSavings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
