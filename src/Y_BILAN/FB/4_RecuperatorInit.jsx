import { useState, useMemo } from "react";

const styles = {
  container: {
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    padding: '32px',
    borderRadius: '16px',
    fontFamily: "'Sohne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    userSelect: 'none',
    color: '#000000',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#000000',
    letterSpacing: '-0.5px',
  },
  diagramContainer: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'fit-content',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  topSection: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  middleSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  section: {
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '0px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  sectionFumees: {
    background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  },
  sectionAirSortie: {
    background: 'linear-gradient(135deg, #ede9fe, #e9d5ff)',
  },
  sectionAirEntree: {
    background: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
  },
  sectionResults: {
    background: 'linear-gradient(135deg, #fed7aa, #fec589)',
  },
  fieldRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  input: {
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    color: '#000000',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    outline: 'none',
    textAlign: 'right',
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    background: '#ffffff',
  },
  result: {
    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    border: '2px solid #86efac',
    color: '#166534',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'right',
    minWidth: '100px',
  },
  unit: {
    fontSize: '12px',
    color: '#000000',
    fontWeight: '500',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  buttonSecondary: {
    background: '#f1f5f9',
    color: '#000000',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  sectionFirst: {
    borderRadius: '12px',
  },
};

function Field({ label, value, onChange, unit, width = 100 }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onChange ? (
          <input
            style={{
              ...styles.input,
              width: `${width}px`,
              ...(focused ? styles.inputFocus : {}),
            }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type="number"
            step="0.1"
          />
        ) : (
          <div style={{ ...styles.result, width: `${width}px` }}>{value}</div>
        )}
        {unit && <span style={styles.unit}>{unit}</span>}
      </div>
    </div>
  );
}

function HXDiagram({ data, dTml, puissanceCedee }) {
  const W = 540, H = 380;
  const bx = 60, bw = 350, by = 70, bh = 220;
  const bx2 = bx + bw;
  const bevel = 28;
  const nPasses = data.passes;
  const shellPoints = [
    [bx + bevel, by], [bx2 - bevel, by],
    [bx2, by + bevel], [bx2, by + bh - bevel],
    [bx2 - bevel, by + bh], [bx + bevel, by + bh],
    [bx, by + bh - bevel], [bx, by + bevel],
  ].map(p => p.join(",")).join(" ");
  const passH = nPasses === 2 ? 75 : 58;
  const bandH = nPasses === 2 ? 50 : 28;
  const innerY = by + 20;
  const passes = Array.from({ length: nPasses }, (_, i) => ({
    y: innerY + i * (passH + bandH),
  }));
  const ix = bx + 8, iw = bw - 16, iOff = 10, iH = nPasses === 2 ? 64 : 48;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))' }}>
      <defs>
        <linearGradient id="shell3D" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#fcd34d" />
          <stop offset="50%"  stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="metalShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1e293b" />
          <stop offset="50%"  stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="coldGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#06b6d4" />
          <stop offset="50%"  stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="heatGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="20%"  stopColor="#fef3c7" />
          <stop offset="50%"  stopColor="#fb923c" />
          <stop offset="80%"  stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      <polygon points={shellPoints} fill="url(#shell3D)" stroke="#92400e" strokeWidth="3" opacity="0.96" filter="url(#shadow)" />
      <path d={`M ${bx + bevel + 5},${by + 8} L ${bx2 - bevel - 5},${by + 8} Q ${bx2 - 15},${by + 30} ${bx2 - 15},${by + bh/2}`} 
        fill="none" stroke="#fef3c7" strokeWidth="2" opacity="0.4" />
      {passes.map((p, idx) => (
        <g key={idx}>
          <rect x={bx} y={p.y} width={bw} height={passH} fill="url(#metalShine)" opacity="0.7" />
          <rect x={bx - 2} y={p.y - 2} width={bw + 4} height={4} fill="#475569" />
          <rect x={bx} y={p.y + 1} width={bw} height={3} fill="#cbd5e1" opacity="0.4" />
          {[0, 1, 2, 3].map(t => (
            <g key={`tube-${t}`}>
              <rect x={bx + 5 + t * (bw - 20) / 4} y={p.y + 8} width={bw/5.5} height={passH - 16} 
                fill="#e0e7ff" stroke="#3730a3" strokeWidth="1.5" opacity="0.85" />
              <rect x={bx + 7 + t * (bw - 20) / 4} y={p.y + 10} width={bw/5.5 - 4} height={passH - 20} 
                fill="url(#coldGradient)" opacity="0.75" />
              <rect x={bx + 7 + t * (bw - 20) / 4} y={p.y + 10} width={bw/5.5 - 4} height={4} 
                fill="#ffffff" opacity="0.3" />
            </g>
          ))}
          <rect x={bx} y={p.y + passH - 3} width={bw} height={3} fill="#cbd5e1" opacity="0.4" />
          <rect x={bx - 2} y={p.y + passH - 1} width={bw + 4} height={4} fill="#475569" />
        </g>
      ))}
  {/* Trapeez du côté */}
      <polygon
        points={`${bx2},${by + bevel} ${bx2},${by + bh - bevel} ${bx2 + 75},${H / 2 + 25} ${bx2 + 75},${H / 2 - 25}`}
        fill="url(#heatGradient)" stroke="#991b1b" strokeWidth="2.5" opacity="0.92" filter="url(#shadow)"
      />
 {/* Triangle haut rose - agrandi 50% */}
 <polygon points={`${W / 2},${by} ${W / 2 - 22.5},${by - 27} ${W / 2 + 22.5},${by - 27}`} fill="#f472b6" stroke="#be123d" strokeWidth="2" />
      {/* Triangle bas orange - remonté */}
      <polygon points={`${W / 2},${H - 40-15} ${W / 2 - 22.5},${H - 67-15} ${W / 2 + 22.5},${H - 67-15}`} fill="#fb923c" stroke="#b45309" strokeWidth="2" />
{/* Triangle violet gauche haut - rotation 180° - même taille */}
<polygon points={`${bx - 30},${passes[0].y + 28} ${bx - 11},${passes[0].y + 16} ${bx - 11},${passes[0].y + 40}`} fill="#6d28d9" stroke="#5b21b6" strokeWidth="2" />
{/* Triangle cyan gauche bas - même taille */}
{/* Triangle cyan gauche bas - inversé */}
<polygon points={`${bx - 11},${passes[nPasses - 1].y + 28} ${bx - 30},${passes[nPasses - 1].y + 16} ${bx - 30},${passes[nPasses - 1].y + 40}`} 
  fill="#0891b2" stroke="#06b6d4" strokeWidth="2" />

    

      <rect x={ix} y={passes[0].y + iOff} width={iw} height={iH} fill="#0891b2" opacity="0.87" rx="4" filter="url(#shadow)" />
      <text x={ix+8}   y={passes[0].y+iOff+16} fontSize="12" fill="#ecf0f1" fontWeight="bold" fontFamily="'Sohne', Arial">Vitesse Fumées</text>
      <rect x={ix+140} y={passes[0].y+iOff+4} width={60} height={16} fill="#fcd34d" rx="3" />
      <text x={ix+142} y={passes[0].y+iOff+16} fontSize="12" fill="#1e293b" fontWeight="bold" fontFamily="'Sohne', Arial">{data.vitesseFumees}</text>
      <text x={ix+205} y={passes[0].y+iOff+16} fontSize="11" fill="#ecf0f1" fontWeight="600">m/s</text>
      <text x={ix+260} y={passes[0].y+iOff+16} fontSize="11" fill="#ecf0f1" fontWeight="bold">dTml</text>
      <rect x={ix+290} y={passes[0].y+iOff+4} width={48} height={16} fill="#fcd34d" rx="3" />
      <text x={ix+292} y={passes[0].y+iOff+16} fontSize="12" fill="#1e293b" fontWeight="bold">{dTml}</text>
      <text x={ix+345} y={passes[0].y+iOff+16} fontSize="11" fill="#ecf0f1" fontWeight="600">°C</text>
      <text x={ix+8}   y={passes[0].y+iOff+36} fontSize="12" fill="#ecf0f1" fontWeight="bold">Rendement HX</text>
      <rect x={ix+140} y={passes[0].y+iOff+24} width={60} height={16} fill="#fcd34d" rx="3" />
      <text x={ix+142} y={passes[0].y+iOff+36} fontSize="12" fill="#1e293b" fontWeight="bold">{data.rendementEchangeur}</text>
      <text x={ix+205} y={passes[0].y+iOff+36} fontSize="11" fill="#ecf0f1" fontWeight="600">%</text>

      {nPasses >= 2 && (
        <>
          <rect x={ix} y={passes[Math.floor(nPasses/2)].y+iOff} width={iw} height={iH} fill="#dc2626" opacity="0.88" rx="4" filter="url(#shadow)" />
          <text x={ix+8} y={passes[Math.floor(nPasses/2)].y+iOff+18} fontSize="12" fill="#fff" fontWeight="bold" fontFamily="'Sohne', Arial">Puissance Cédée</text>
          <rect x={ix+8} y={passes[Math.floor(nPasses/2)].y+iOff+24} width={iw-16} height={20} fill="#fcd34d" rx="3" />
          <text x={ix+14} y={passes[Math.floor(nPasses/2)].y+iOff+38} fontSize="13" fill="#1e293b" fontWeight="bold" fontFamily="'Sohne', Arial">{puissanceCedee.toLocaleString()} Kcal/h</text>
        </>
      )}

      <rect x={ix} y={passes[nPasses-1].y+iOff} width={iw} height={iH} fill="#2563eb" opacity="0.87" rx="4" filter="url(#shadow)" />
      <text x={ix+8}   y={passes[nPasses-1].y+iOff+15} fontSize="11" fill="#fff" fontWeight="bold">U Propre</text>
      <rect x={ix+150} y={passes[nPasses-1].y+iOff+3} width={65} height={15} fill="#fcd34d" rx="2" />
      <text x={ix+152} y={passes[nPasses-1].y+iOff+14} fontSize="11" fill="#1e293b" fontWeight="bold">{data.coefEchangeU}</text>
      <text x={ix+220} y={passes[nPasses-1].y+iOff+14} fontSize="10" fill="#fff">Kcal/m²°C</text>
      <text x={ix+8}   y={passes[nPasses-1].y+iOff+32} fontSize="11" fill="#fff" fontWeight="bold">Surface A</text>
      <rect x={ix+150} y={passes[nPasses-1].y+iOff+20} width={65} height={15} fill="#fcd34d" rx="2" />
      <text x={ix+152} y={passes[nPasses-1].y+iOff+31} fontSize="11" fill="#1e293b" fontWeight="bold">{data.surfaceEchangeA}</text>
      <text x={ix+220} y={passes[nPasses-1].y+iOff+31} fontSize="10" fill="#fff">m²</text>
      <text x={ix+8}   y={passes[nPasses-1].y+iOff+49} fontSize="11" fill="#fff" fontWeight="bold">Vitesse Air</text>
      <rect x={ix+150} y={passes[nPasses-1].y+iOff+37} width={65} height={15} fill="#fcd34d" rx="2" />
      <text x={ix+152} y={passes[nPasses-1].y+iOff+48} fontSize="11" fill="#1e293b" fontWeight="bold">{data.vitesseAir}</text>
      <text x={ix+220} y={passes[nPasses-1].y+iOff+48} fontSize="10" fill="#fff">m/s</text>
    </svg>
  );
}

function densiteFumees(T) {
  return 1.293 * 273 / (273 + T);
}

export default function Recuperateur() {
  const [data, setData] = useState({
    tEntreeFumees:    870,
    debitEntreeFumees: 119130,
    cpFumees:          0.36,
    tSortieAir:        600,
    debitSortieAir:    44857,
    tEntreeEchg:       60,
    debitEntreeAir:    16590,
    tEntreeAirExt:     15,
    debitSoufflante:   17283,
    vitesseFumees:     16.0,
    rendementEchangeur: 95,
    coefEchangeU:      40.9,
    surfaceEchangeA:   253.5,
    vitesseAir:        25.0,
    encrassement:      25,
    passes:            2,
  });

  const set = (key) => (val) => setData(d => ({ ...d, [key]: parseFloat(val) || val }));

  const calc = useMemo(() => {
    const tFi  = parseFloat(data.tEntreeFumees)    || 0;
    const qFi  = parseFloat(data.debitEntreeFumees) || 0;
    const cp   = parseFloat(data.cpFumees)          || 0.36;
    const tAo  = parseFloat(data.tSortieAir)        || 0;
    const tAi  = parseFloat(data.tEntreeEchg)       || 0;
    const encr = parseFloat(data.encrassement)       || 0;
    const U    = parseFloat(data.coefEchangeU)       || 1;
    const A    = parseFloat(data.surfaceEchangeA)    || 1;

    const rhoFi = densiteFumees(tFi);
    const mFi = qFi * rhoFi;

    let tFo = tFi - 300;
    for (let i = 0; i < 100; i++) {
      const dT1 = tFi - tAo;
      const dT2 = tFo - tAi;
      let dTml;
      if (Math.abs(dT1 - dT2) < 0.01) {
        dTml = dT1;
      } else if (dT2 <= 0 || dT1 <= 0) {
        dTml = Math.max(dT1, dT2, 1);
      } else {
        dTml = (dT1 - dT2) / Math.log(dT1 / dT2);
      }
      const Qechange = U * A * (1 - encr / 100) * dTml;
      const tFo_new = tFi - Qechange / (mFi * cp || 1);
      if (Math.abs(tFo_new - tFo) < 0.1) { tFo = tFo_new; break; }
      tFo = tFo * 0.5 + tFo_new * 0.5;
    }

    const dT1 = tFi - tAo;
    const dT2 = tFo - tAi;
    let dTml;
    if (Math.abs(dT1 - dT2) < 0.01) {
      dTml = dT1;
    } else if (dT2 <= 0 || dT1 <= 0) {
      dTml = Math.max(dT1, dT2, 1);
    } else {
      dTml = (dT1 - dT2) / Math.log(dT1 / dT2);
    }

    const puissanceCedee = Math.round(U * A * (1 - encr / 100) * dTml);
    const rhoFo = densiteFumees(tFo);
    const debitSortieFumees = Math.round(mFi / rhoFo);

    return {
      tSortieFumees:    Math.round(tFo * 10) / 10,
      debitSortieFumees,
      puissanceCedee,
      dTml:             Math.round(dTml * 10) / 10,
    };
  }, [
    data.tEntreeFumees, data.debitEntreeFumees, data.cpFumees,
    data.tSortieAir, data.tEntreeEchg,
    data.coefEchangeU, data.surfaceEchangeA, data.encrassement,
  ]);

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sohne:wght@400;500;600;700&display=swap');
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }

        button:hover {
          transform: translateY(-2px);
        }

        button:active {
          transform: translateY(0);
        }
      `}</style>

      <h1 style={styles.title}>🔥 RÉCUPÉRATEUR DE CHALEUR</h1>

      <div style={styles.topSection}>
        <div style={{ ...styles.section, ...styles.sectionFumees }}>
          <h3 style={{ ...styles.label, marginBottom: '12px', fontSize: '13px' }}>🔥 FUMÉES</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <Field label="Entrée" value={data.tEntreeFumees} onChange={set("tEntreeFumees")} unit="°C" width={90} />
            <Field label="Débit" value={data.debitEntreeFumees} onChange={set("debitEntreeFumees")} unit="m³/h" width={110} />
            <Field label="Cp Fumées" value={data.cpFumees} onChange={set("cpFumees")} unit="kCal/kg/°C" width={80} />
          </div>
        </div>
      </div>

      <div style={styles.middleSection}>
        <div style={styles.leftColumn}>
          <div style={{ ...styles.section, ...styles.sectionAirSortie }}>
            <h3 style={{ ...styles.label, marginBottom: '12px', fontSize: '13px' }}>❄️ AIR SORTIE</h3>
            <div style={styles.fieldRow}>
              <Field label="Température" value={data.tSortieAir} onChange={set("tSortieAir")} unit="°C" width={90} />
              <Field label="Débit" value={data.debitSortieAir} onChange={set("debitSortieAir")} unit="m³/h" width={110} />
            </div>
          </div>

          <div style={{ ...styles.section, ...styles.sectionAirEntree }}>
            <h3 style={{ ...styles.label, marginBottom: '12px', fontSize: '13px' }}>🌬️ AIR ENTRÉE</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Field label="Échangeur" value={data.tEntreeEchg} onChange={set("tEntreeEchg")} unit="°C" width={90} />
                <Field label="Air ext." value={data.tEntreeAirExt} onChange={set("tEntreeAirExt")} unit="°C" width={90} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Field label="Débit" value={data.debitEntreeAir} onChange={set("debitEntreeAir")} unit="m³/h" width={110} />
                <Field label="Soufflante" value={data.debitSoufflante} onChange={set("debitSoufflante")} unit="Nm³/h" width={110} />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.diagramContainer}>
            <HXDiagram data={data} dTml={calc.dTml} puissanceCedee={calc.puissanceCedee} />
          </div>
        </div>
      </div>

      <div style={styles.bottomSection}>
        <div style={{ ...styles.section, background: 'linear-gradient(135deg, #ffffff, #f8fafc)' }}>
          <h3 style={{ ...styles.label, marginBottom: '12px', fontSize: '13px' }}>⚙️ CONFIGURATION</h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            {[2, 3].map(n => (
              <label key={n} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="radio" name="passes" checked={data.passes === n}
                  onChange={() => setData(d => ({ ...d, passes: n }))}
                  style={{ cursor: 'pointer' }} />
                <span style={{ color: '#000000' }}>{n} passes</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <Field label="Encrassement" value={data.encrassement} onChange={set("encrassement")} unit="%" width={80} />
            <Field label="U (Kcal/m²°C)" value={data.coefEchangeU} onChange={set("coefEchangeU")} width={100} />
            <Field label="A (m²)" value={data.surfaceEchangeA} onChange={set("surfaceEchangeA")} width={100} />
          </div>
        </div>
      </div>

      <div style={{ ...styles.section, ...styles.sectionResults, marginTop: '20px' }}>
        <h3 style={{ ...styles.label, marginBottom: '12px' }}>📊 RÉSULTATS CALCULÉS</h3>
        <div style={{ ...styles.fieldRow, gap: '16px' }}>
          <Field label="Sortie Fumées" value={`${calc.tSortieFumees}°C`} width={90} />
          <Field label="Débit Sortie" value={`${calc.debitSortieFumees.toLocaleString()} m³/h`} width={140} />
          <Field label="Puissance" value={`${calc.puissanceCedee.toLocaleString()} Kcal/h`} width={140} />
          <Field label="dTml" value={`${calc.dTml}°C`} width={80} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: '🖨️ Imprimer', primary: true },
          { label: '❌ Annuler', primary: false },
          { label: '🏠 Menu Principal', primary: false }
        ].map(btn => (
          <button
            key={btn.label}
            style={{
              ...styles.button,
              ...(btn.primary ? styles.buttonPrimary : styles.buttonSecondary),
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}