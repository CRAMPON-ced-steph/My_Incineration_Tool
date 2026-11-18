// Composants d'affichage partagés par les onglets de l'économiseur (définis au niveau module).
import React from 'react';

export const styles = {
  bloc: { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e0e0e0' },
  ligne: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' },
  label: { flex: '1', minWidth: '260px', textAlign: 'right', fontWeight: '500', color: '#333' },
  input: { flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  calcule: { flex: '0 0 150px', padding: '8px', border: '1px solid #e0c97a', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f5f0dc', color: '#555', fontWeight: 'bold' },
  boutonReset: { padding: '8px 16px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' },
  note: { fontSize: '12px', color: '#666', fontStyle: 'italic', margin: '6px 0 0 0' },
};

export const ChoixBoutons = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {options.map((o) => {
      const actif = o.value === value;
      return (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            padding: '8px 14px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer',
            border: actif ? '2px solid #1565c0' : '1px solid #ccc',
            backgroundColor: actif ? '#e3f2fd' : 'white',
            color: actif ? '#1565c0' : '#333', fontWeight: actif ? 'bold' : 'normal',
          }}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

// Champ numérique : la saisie est conservée telle quelle (chaîne) et lue par les calculs.
// readOnly → valeur calculée (fond beige, comme les champs calculés de Pyrofluid).
export const ChampNumerique = ({ label, value, onChange, readOnly = false, suffixe }) => (
  <div style={styles.ligne}>
    <label style={styles.label}>{label}{suffixe ? <em style={{ color: '#8a6d1f' }}> ({suffixe})</em> : null} :</label>
    {readOnly ? (
      <input type="text" value={value} readOnly style={styles.calcule} />
    ) : (
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} />
    )}
  </div>
);

export const LigneChoix = ({ label, children }) => (
  <div style={styles.ligne}>
    <label style={styles.label}>{label} :</label>
    <div style={{ flex: '2', minWidth: '280px' }}>{children}</div>
  </div>
);

// Messages d'erreur (rouge, bloquants) et d'alerte (orange)
export const Messages = ({ erreurs = [], alertes = [], t }) => {
  if (!erreurs.length && !alertes.length) return null;
  return (
    <div style={{ marginBottom: '15px' }}>
      {erreurs.length > 0 && (
        <div style={{ padding: '10px 14px', background: '#fdecea', border: '1px solid #f5c2c0', borderRadius: '4px', color: '#b71c1c', marginBottom: '8px' }}>
          <strong>{t('calculImpossible')}</strong>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>{erreurs.map((c) => <li key={c}>{t(c)}</li>)}</ul>
        </div>
      )}
      {alertes.length > 0 && (
        <div style={{ padding: '10px 14px', background: '#fff4e5', border: '1px solid #ffd59e', borderRadius: '4px', color: '#8a4b00' }}>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>{alertes.map((c) => <li key={c}>{t(c)}</li>)}</ul>
        </div>
      )}
    </div>
  );
};
