export function formatUsd(value: number, opts?: { maxFractionDigits?: number }) {
  const maxFractionDigits = opts?.maxFractionDigits ?? 2;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maxFractionDigits,
    }).format(value);
  } catch {
    return `$${value.toFixed(maxFractionDigits)}`;
  }
}

export function formatNumber(value: number, opts?: { maxFractionDigits?: number }) {
  const maxFractionDigits = opts?.maxFractionDigits ?? 2;

  try {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: maxFractionDigits,
    }).format(value);
  } catch {
    return value.toFixed(maxFractionDigits);
  }
}

export function formatPercent(value: number, opts?: { maxFractionDigits?: number; sign?: boolean }) {
  const maxFractionDigits = opts?.maxFractionDigits ?? 2;
  const sign = opts?.sign ?? true;

  const v = Number.isFinite(value) ? value : 0;
  const s = v >= 0 && sign ? '+' : '';

  return `${s}${formatNumber(v, { maxFractionDigits })}%`;
}

export function formatDateTime(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}
