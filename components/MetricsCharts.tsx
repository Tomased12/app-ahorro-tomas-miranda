'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MonthlyMetric, CategoryDistribution } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

interface MetricsChartsProps {
  monthlyMetrics: MonthlyMetric[];
  categoryDistribution: CategoryDistribution[];
}

const DEFAULT_PIE_COLORS = [
  '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6', '#ef4444', '#64748b',
];

export const MetricsCharts: React.FC<MetricsChartsProps> = ({
  monthlyMetrics,
  categoryDistribution,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-6 h-[320px] animate-pulse bg-slate-900/60" />
        <div className="glass-card rounded-2xl p-6 h-[320px] animate-pulse bg-slate-900/60" />
      </div>
    );
  }

  // Custom tooltip para gráfico de barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="font-medium">
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip para gráfico de torta
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryDistribution;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{data.category}</p>
          <p className="text-emerald-400 font-semibold">{formatCurrency(data.amount)}</p>
          <p className="text-slate-400">{data.percentage}% del total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Gráfico 1: Evolución Mensual (Ingresos vs Gastos) */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Evolución Mensual</h3>
            <p className="text-xs text-slate-400">Comparativa de Ingresos vs. Gastos</p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyMetrics}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar
                dataKey="ingresos"
                name="Ingresos"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                dataKey="gastos"
                name="Gastos"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Distribución por Categoría (Doughnut) */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Gastos por Categoría</h3>
            <p className="text-xs text-slate-400">Distribución porcentual de egresos</p>
          </div>
        </div>

        {categoryDistribution.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-slate-500 text-xs">
            <PieIcon className="w-8 h-8 mb-2 opacity-30" />
            <p>No hay gastos registrados en este período</p>
          </div>
        ) : (
          <div className="h-[260px] w-full flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda compacta y scrollable */}
            <div className="w-1/2 max-h-[220px] overflow-y-auto pl-2 space-y-1.5 text-xs">
              {categoryDistribution.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5 truncate pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          item.color || DEFAULT_PIE_COLORS[idx % DEFAULT_PIE_COLORS.length],
                      }}
                    />
                    <span className="truncate text-[11px] font-medium">{item.category}</span>
                  </div>
                  <span className="text-slate-400 font-bold text-[11px]">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
