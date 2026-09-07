'use client';

import React from 'react';
import { CalendarDays, CheckCircle2, AlertTriangle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { BillStatus, Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface BillsCalendarProps {
  bills: BillStatus[];
  onToggleStatus: (id: string, currentStatus: 'pendiente' | 'pagado') => Promise<void>;
  monthLabel: string;
}

export const BillsCalendar: React.FC<BillsCalendarProps> = ({
  bills,
  onToggleStatus,
  monthLabel,
}) => {
  const pendingBills = bills.filter((b) => b.status === 'pendiente');
  const paidBills = bills.filter((b) => b.status === 'pagado');

  const totalPending = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = paidBills.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePayBill = async (id: string) => {
    await onToggleStatus(id, 'pendiente');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#06b6d4'],
    });
  };

  const getUrgencyBadge = (bill: BillStatus) => {
    switch (bill.urgency) {
      case 'paid':
        return {
          label: 'Pagado al día',
          color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'overdue':
        return {
          label: `Vencido hace ${Math.abs(bill.daysRemaining)} días`,
          color: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'today':
        return {
          label: '¡Vence Hoy!',
          color: 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'soon':
        return {
          label: `Vence en ${bill.daysRemaining} días`,
          color: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          label: `Vence el ${formatDate(bill.dueDate)}`,
          color: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
          icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
        };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Calendario de Vencimientos de Servicios
              <span className="text-xs font-normal text-slate-400">({monthLabel})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Luz, Gas, Flow, Tarjetas, ABL y Alquiler con alerta de vencimiento
            </p>
          </div>
        </div>

        {/* Resumen rápido de pendientes */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Por pagar: </span>
            <strong className="text-amber-400 font-bold">{formatCurrency(totalPending)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Pagado: </span>
            <strong className="text-emerald-400 font-bold">{formatCurrency(totalPaid)}</strong>
          </div>
        </div>
      </div>

      {/* Lista de Vencimientos */}
      {bills.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-500 text-xs">
          <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-300">No hay vencimientos registrados para este período</p>
          <p className="mt-1">Registra gastos en Luz, Gas, Internet o Tarjetas para llevar el control de vencimientos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {bills.map((bill) => {
            const badge = getUrgencyBadge(bill);
            const isPending = bill.status === 'pendiente';

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isPending
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{bill.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {bill.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      A cargo de: <strong className={bill.paidBy === 'Tomas' ? 'text-blue-400' : 'text-pink-400'}>{bill.paidBy}</strong>
                    </p>
                  </div>

                  <span className="text-base font-extrabold text-white">
                    {formatCurrency(bill.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.color}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>

                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handlePayBill(bill.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Pagado</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(bill.id, 'pagado')}
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Desmarcar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
