'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, DollarSign, Handshake, Sparkles } from 'lucide-react';
import { BalanceSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface BalanceCardProps {
  balance: BalanceSummary;
  onSettleDebt: (debtor: 'Tomas' | 'Miranda', creditor: 'Tomas' | 'Miranda', amount: number) => Promise<void>;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, onSettleDebt }) => {
  const [isSettling, setIsSettling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const debtor = balance.netDebtor;
  const creditor = debtor === 'Tomas' ? 'Miranda' : 'Tomas';
  const hasDebt = balance.netAmount > 0 && debtor !== null;

  const handleConfirmSettle = async () => {
    if (!debtor || !hasDebt) return;
    try {
      setIsSettling(true);
      await onSettleDebt(debtor, creditor, balance.netAmount);

      // Lanzar confeti de celebración
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b'],
      });

      setConfirmOpen(false);
    } catch (error) {
      console.error('Error al saldar deuda:', error);
      alert('Ocurrió un error al registrar la liquidación.');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-slate-800 shadow-xl">
      {/* Fondo con resplandor sutil */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Encabezado e información de deuda */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Handshake className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Balance Compartido (Splitwise)
            </h3>
          </div>

          {hasDebt ? (
            <div className="pt-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    debtor === 'Tomas' ? 'text-blue-400' : 'text-pink-400'
                  }`}
                >
                  {debtor}
                </span>
                <span className="text-slate-400 text-sm sm:text-base">le debe a</span>
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    creditor === 'Tomas' ? 'text-blue-400' : 'text-pink-400'
                  }`}
                >
                  {creditor}:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight ml-1">
                  {formatCurrency(balance.netAmount)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Calculado en base a gastos compartidos (50/50) y gastos cubiertos por el otro.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-base font-semibold">
                ¡Cuentas al día! No hay deudas pendientes entre ustedes.
              </span>
            </div>
          )}
        </div>

        {/* Botón de Saldar Deuda */}
        {hasDebt && (
          <div className="sm:self-center">
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Saldar Deuda</span>
            </button>
          </div>
        )}
      </div>

      {/* Subresumen: cuánto pagó cada uno en total */}
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300 font-medium">Tomas pagó:</span>
          </div>
          <span className="font-bold text-slate-100">{formatCurrency(balance.tomasPaid)}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span className="text-slate-300 font-medium">Miranda pagó:</span>
          </div>
          <span className="font-bold text-slate-100">{formatCurrency(balance.mirandaPaid)}</span>
        </div>
      </div>

      {/* Modal de confirmación para Saldar Deuda */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Handshake className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Confirmar Liquidación</h4>
            </div>

            <p className="text-sm text-slate-300">
              Se registrará un movimiento de compensación donde{' '}
              <strong className={debtor === 'Tomas' ? 'text-blue-400' : 'text-pink-400'}>
                {debtor}
              </strong>{' '}
              le transfiere{' '}
              <strong className="text-white">{formatCurrency(balance.netAmount)}</strong> a{' '}
              <strong className={creditor === 'Tomas' ? 'text-blue-400' : 'text-pink-400'}>
                {creditor}
              </strong>
              , dejando el balance en <span className="text-emerald-400 font-semibold">$0</span>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isSettling}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isSettling}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSettling ? 'Procesando...' : 'Confirmar y Saldar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
