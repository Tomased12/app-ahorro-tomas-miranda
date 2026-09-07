'use client';

import React, { useState } from 'react';
import { PiggyBank, Plus, Sparkles, Trophy, Calendar, CheckCircle2, X, DollarSign, Trash2 } from 'lucide-react';
import { SavingsGoal, UserProfile } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface SavingsGoalsSectionProps {
  goals: SavingsGoal[];
  onSaveGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  onContributeGoal: (goalId: string, amountToAdd: number) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

const PRESET_ICONS = ['🏖️', '🛡️', '🛋️', '🚗', '✈️', '💍', '🏠', '💻', '🎉', '💰'];

export const SavingsGoalsSection: React.FC<SavingsGoalsSectionProps> = ({
  goals,
  onSaveGoal,
  onContributeGoal,
  onDeleteGoal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Form states for new goal
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(PRESET_ICONS[0]);
  const [createdBy, setCreatedBy] = useState<UserProfile | 'Ambos'>('Ambos');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const num = parseFloat(contributeAmount);
    if (isNaN(num) || num <= 0) {
      alert('Ingresa un monto válido para aportar');
      return;
    }

    try {
      setIsSubmitting(true);
      await onContributeGoal(contributeGoal.id, num);

      // Si se completa la meta
      const newTotal = contributeGoal.currentAmount + num;
      if (newTotal >= contributeGoal.targetAmount) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#ec4899', '#f59e0b'],
        });
      }

      setContributeGoal(null);
      setContributeAmount('');
    } catch (err) {
      console.error(err);
      alert('Error al registrar el aporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      alert('Ingresa un monto objetivo válido');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveGoal({
        title: `${title.trim()} ${selectedEmoji}`,
        targetAmount: numTarget,
        currentAmount: parseFloat(initialAmount) || 0,
        deadline: deadline || undefined,
        createdBy,
        notes: notes.trim() || undefined,
        createdAt: Date.now(),
      });

      // Reset
      setTitle('');
      setTargetAmount('');
      setInitialAmount('');
      setDeadline('');
      setNotes('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Metas de Ahorro y &quot;Chanchitos&quot; Virtuales 🐷
            </h3>
            <p className="text-xs text-slate-400">
              Objetivos compartidos e individuales con seguimiento en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Chanchito</span>
        </button>
      </div>

      {/* Grid de Metas */}
      {goals.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-500 text-xs">
          <PiggyBank className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-300">No tienes metas de ahorro activas</p>
          <p className="mt-1">Crea un chanchito para vacaciones, fondo de emergencia o un proyecto especial.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((g) => {
            const percentage = Math.min(
              100,
              Math.round((g.currentAmount / (g.targetAmount || 1)) * 100)
            );
            const isCompleted = g.currentAmount >= g.targetAmount;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                  isCompleted
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-white">{g.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-indigo-300">
                        {g.createdBy === 'Ambos' ? 'De ambos' : `De ${g.createdBy}`}
                      </span>
                      {g.deadline && (
                        <span className="text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatDate(g.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la meta "${g.title}"?`)) {
                        onDeleteGoal(g.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Eliminar meta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Progreso</span>
                    <span
                      className={`font-extrabold ${
                        isCompleted ? 'text-emerald-400' : 'text-pink-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Montos */}
                <div className="flex items-baseline justify-between text-xs pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Ahorrado</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(g.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Objetivo</span>
                    <span className="text-xs font-bold text-slate-300">
                      {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-slate-800/80">
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span>¡Meta Completada! 🎉</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Faltan: <strong className="text-pink-300">{formatCurrency(remaining)}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setContributeGoal(g);
                          setContributeAmount('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 font-bold text-xs border border-pink-500/30 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Aportar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Aportar al Chanchito */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setContributeGoal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Aportar a {contributeGoal.title}</h4>
                <p className="text-xs text-slate-400">Suma saldo a este objetivo de ahorro</p>
              </div>
            </div>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto a Depositar (ARS)
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  min="1"
                  step="any"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar Aporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Chanchito */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Nuevo Chanchito de Ahorro</h4>
                <p className="text-xs text-slate-400">Define una meta compartida o individual</p>
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Objetivo
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Viaje a Bariloche, Auto, Casamiento..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Selector de Emoji */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ícono
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESET_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-lg p-2 rounded-xl border transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-purple-600/30 border-purple-500 scale-110'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monto Objetivo (ARS)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="1500000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ahorro Inicial (Opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Titular
                  </label>
                  <select
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value as UserProfile | 'Ambos')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Ambos">Ambos (Compartido)</option>
                    <option value="Tomas">Tomas</option>
                    <option value="Miranda">Miranda</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Chanchito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
