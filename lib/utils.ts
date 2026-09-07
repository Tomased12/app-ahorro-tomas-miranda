import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número al estándar monetario de Argentina (ARS)
 * Ejemplo: $ 12.345,00
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return formatted;
}

/**
 * Formatea una fecha ISO a formato local entendible (ej: 07 sep 2024 o 07/09/2024)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Convierte una lista de transacciones a formato CSV y dispara la descarga en el navegador
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  fileName: string = 'transacciones-tomas-miranda.csv'
) {
  if (!transactions.length) {
    alert('No hay transacciones para exportar.');
    return;
  }

  const headers = [
    'Fecha',
    'Tipo',
    'Titulo',
    'Categoria',
    'Monto (ARS)',
    'Pagado Por',
    'Division',
    'Estado',
    'Notas'
  ];

  const rows = transactions.map((t) => [
    `"${t.date}"`,
    `"${t.type}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    t.amount,
    `"${t.paidBy}"`,
    `"${t.splitType}"`,
    `"${t.status}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM para soporte correcto de tildes y caracteres en Excel
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
