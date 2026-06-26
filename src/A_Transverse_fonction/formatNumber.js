// Thin-space (U+2009) thousands separator, French-style decimal formatting.
// fmt(12345.678, 2) → "12 345.68"
export const fmt = (v, decimals = 2) => {
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const sign = intPart.startsWith('-') ? '-' : '';
  const abs = intPart.replace('-', '');
  const withSep = abs.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart !== undefined ? `${sign}${withSep}.${decPart}` : `${sign}${withSep}`;
};

export const fmtInt = (v) => fmt(v, 0);

export const fmt2 = (v) => fmt(v, 2);
