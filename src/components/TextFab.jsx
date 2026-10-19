import { useEffect, useRef, useState } from 'react';

// Botón flotante abajo a la derecha con el tamaño de letra y las mayúsculas,
// para cambiarlos sin abrir el índice mientras se lee.
export default function TextFab({ prefs }) {
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
    <div className="text-fab" ref={ref}>
      {open && (
        <div className="text-panel" role="dialog" aria-label="Opciones de texto">
          <div className="tp-row">
            <span className="tp-label">Tamaño</span>
            <div className="tp-controls">
              <button className="ctl font" type="button" aria-label="Achicar la letra" onClick={prefs.smaller}>
                A−
              </button>
              <span className="tp-value">{Math.round(prefs.scale * 100)}%</span>
              <button className="ctl font" type="button" aria-label="Agrandar la letra" onClick={prefs.bigger}>
                A+
              </button>
            </div>
          </div>
          <div className="tp-row">
            <span className="tp-label">Letras</span>
            <div className="tp-controls">
              <button
                className={`ctl${prefs.caps ? '' : ' active'}`}
                type="button"
                aria-pressed={!prefs.caps}
                onClick={() => prefs.caps && prefs.toggleCaps()}
              >
                abc
              </button>
              <button
                className={`ctl${prefs.caps ? ' active' : ''}`}
                type="button"
                aria-pressed={prefs.caps}
                onClick={() => !prefs.caps && prefs.toggleCaps()}
              >
                ABC
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        className={`fab-btn display${open ? ' open' : ''}`}
        type="button"
        aria-expanded={open}
        aria-label="Opciones de texto: tamaño y mayúsculas"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '✕' : 'Aa'}
      </button>
    </div>
  );
}
