export default function Controls({ prefs }) {
  return (
    <div className="controls">
      <button className="ctl" type="button" onClick={prefs.toggleTheme}>
        {prefs.theme === 'noche' ? '☀️ Día' : '🌙 Noche'}
      </button>
      <button
        className={`ctl${prefs.caps ? ' active' : ''}`}
        type="button"
        aria-pressed={prefs.caps}
        aria-label="Poner el texto en mayúsculas"
        onClick={prefs.toggleCaps}
      >
        AA
      </button>
      <button className="ctl font" type="button" aria-label="Achicar la letra" onClick={prefs.smaller}>
        A−
      </button>
      <button className="ctl font" type="button" aria-label="Agrandar la letra" onClick={prefs.bigger}>
        A+
      </button>
    </div>
  );
}
