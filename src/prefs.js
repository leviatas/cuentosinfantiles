import { useEffect, useState } from 'react';

// localStorage puede fallar (modo privado, datos bloqueados): todo va con try/catch.
export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento: la preferencia dura sólo esta visita */
  }
}

export function useStored(key, fallback) {
  const [value, setValue] = useState(() => readStore(key, fallback));
  useEffect(() => writeStore(key, value), [key, value]);
  return [value, setValue];
}

export function usePrefs() {
  const [theme, setTheme] = useStored('cuentos_theme', 'noche');
  const [scale, setScale] = useStored('cuentos_scale', 1);
  const [caps, setCaps] = useStored('cuentos_caps', false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.setProperty('--rscale', String(scale));
    root.dataset.caps = caps ? 'si' : 'no';
  }, [theme, scale, caps]);

  return {
    theme,
    toggleTheme: () => setTheme((t) => (t === 'noche' ? 'dia' : 'noche')),
    scale,
    smaller: () => setScale((s) => Math.max(0.8, +(s - 0.1).toFixed(2))),
    bigger: () => setScale((s) => Math.min(1.8, +(s + 0.1).toFixed(2))),
    caps,
    toggleCaps: () => setCaps((c) => !c),
  };
}
