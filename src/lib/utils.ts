import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Financial formatters (INR & USD)
export function formatCurrency(
  amount: number,
  currency: 'INR' | 'USD' = 'INR',
  options?: { compact?: boolean; hideDecimals?: boolean; showSymbol?: boolean }
): string {
  const isINR = currency === 'INR';
  const decimals = options?.hideDecimals ? 0 : 2;

  if (options?.compact) {
    if (isINR) {
      if (Math.abs(amount) >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} L`;
      }
      if (Math.abs(amount) >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}k`;
      }
      return `₹${amount.toFixed(0)}`;
    } else {
      if (Math.abs(amount) >= 1000000) {
        return `$${(amount / 1000000).toFixed(2)}M`;
      }
      if (Math.abs(amount) >= 1000) {
        return `$${(amount / 1000).toFixed(1)}k`;
      }
      return `$${amount.toFixed(0)}`;
    }
  }

  const formatted = new Intl.NumberFormat(isINR ? 'en-IN' : 'en-US', {
    style: options?.showSymbol !== false ? 'currency' : 'decimal',
    currency: isINR ? 'INR' : 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return formatted;
}

// Convert USD to INR or vice versa
export function convertCurrency(
  amount: number,
  from: 'INR' | 'USD',
  to: 'INR' | 'USD',
  rate: number = 84.50
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'INR') return amount * rate;
  return amount / rate;
}

// Format date in Asia/Kolkata timezone
export function formatDate(dateString: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

// Generate unique sequential IDs like EXP-2026-084 or INV-2026-012
export function generateId(prefix: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomNum}`;
}
