import { useEffect, useRef, useState } from 'react';

// Botón flotante a la derecha con los ajustes de letra, a mano mientras se lee.
export default function FloatingPrefs({ prefs }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`fab-prefs${open ? ' open' : ''}`} ref={ref}>
      {open && (
        <div className="fab-menu" role="group" aria-label="Ajustes de letra">
          <button className="ctl font" type="button" aria-label="Agrandar la letra" onClick={prefs.bigger} disabled={prefs.scale >= 1.8}>
            A+
          </button>
          <span className="fab-size" aria-live="polite">{Math.round(prefs.scale * 100)}%</span>
          <button className="ctl font" type="button" aria-label="Achicar la letra" onClick={prefs.smaller} disabled={prefs.scale <= 0.8}>
            A−
          </button>
          <button
            className={`ctl font${prefs.caps ? ' active' : ''}`}
            type="button"
            aria-pressed={prefs.caps}
            aria-label="Poner el texto en mayúsculas"
            onClick={prefs.toggleCaps}
          >
            AA
          </button>
        </div>
      )}
      <button
        className="fab-btn"
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Cerrar ajustes de letra' : 'Abrir ajustes de letra'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '✕' : 'Aa'}
      </button>
    </div>
  );
}
