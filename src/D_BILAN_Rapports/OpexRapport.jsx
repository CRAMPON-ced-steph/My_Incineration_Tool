import React from 'react';
import { getLanguageCode } from '../F_Gestion_Langues/Fonction_Traduction';
import { translations } from '../G_Graphiques/Dashboard/OpexDashboard_traduction';
import { opexDuNoeud, fmtOpex, lireNombre } from '../G_Graphiques/Dashboard/opexTableau';

// ─── Section OPEX commune à tous les rapports d'équipement ────────────────────
// Reprend exactement les tableaux de l'onglet OPEX du nœud (valeurs calculées,
// valeurs saisies, lignes ajoutées ou supprimées) : voir opexTableau.js.

const Marque = ({ ligne }) => ((ligne.valeurFixee || ligne.libelleFixe) ? <span style={styles.marque}> ✎</span> : null);

const nonVide = (ligne) => lireNombre(ligne.value) !== 0;

const TableDetail = ({ titre, colonnes, lignes, cellules, total, couleurTotal }) => (
  <div style={styles.subSection}>
    <h3 style={styles.subTitle}>{titre}</h3>
    <table style={styles.table}>
      <thead>
        <tr>{colonnes.map((c) => <th key={c} style={styles.th}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {lignes.map((r) => (
          <tr key={r.key}>
            <td style={styles.tdLabel}>{r.label}<Marque ligne={r} /></td>
            {cellules(r).map((c, i) => <td key={i} style={styles.td}>{c}</td>)}
          </tr>
        ))}
        <tr style={{ fontWeight: 'bold', background: couleurTotal }}>
          {total.map((c, i) => <td key={i} style={i === 0 ? styles.tdLabel : styles.td}>{c}</td>)}
        </tr>
      </tbody>
    </table>
  </div>
);

const OpexRapport = ({ innerData = {}, equipmentType, nodeId, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const opex = opexDuNoeud(innerData, equipmentType, nodeId, t);
  const { tables, details, totaux, currency: cur, availability } = opex;
  const prix = (v) => (v === null || v === undefined ? '—' : fmtOpex(v));

  const vide = Object.values(totaux).every((v) => v === 0);
  if (vide) return <p style={{ color: '#999', fontSize: 12, padding: '10px 14px' }}>{t('opexNotAvailable')}</p>;

  const coutLignes = tables.cout.filter(nonVide);
  const co2Lignes = tables.co2.filter(nonVide);
  const elec = details.elec.filter(nonVide);
  const eau = details.eau.filter(nonVide);
  const reactifs = details.reactifs.filter(nonVide);
  const energie = details.energie.filter(nonVide);
  const production = (details.production || []).filter(nonVide);
  const recettes = totaux.recettes || 0;
  const saisies = TABLES_AFFICHEES.some((nom) => (tables[nom] || []).some((r) => r.valeurFixee || r.libelleFixe));

  return (
    <div>
      <div style={{ ...styles.subSection, paddingBottom: 4 }}>
        <div style={styles.tagRow}>
          {coutLignes.map((r, i) => (
            <div key={r.key} style={{ ...styles.tag, borderLeft: `4px solid ${COULEURS[i % COULEURS.length]}` }}>
              <span style={styles.tagLabel}>{r.label}<Marque ligne={r} /> [{cur}/h]</span>
              <span style={{ ...styles.tagValue, color: COULEURS[i % COULEURS.length] }}>{fmtOpex(r.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.twoCol}>
        <div style={{ ...styles.subSection, background: '#f0f5ff', margin: 8, borderRadius: 6 }}>
          <h3 style={{ ...styles.subTitle, color: '#1a3a6b' }}>{t('totalCost')}</h3>
          <div style={styles.kvRow}><span style={styles.kvLabel}>{t('hourlyCost')} [{cur}/h]</span><span style={styles.kvValue}>{fmtOpex(totaux.cout)}</span></div>
          <div style={styles.kvRow}><span style={styles.kvLabel}>{t('annualCost')} ({availability} {t('hoursPerYear')}) [{cur}]</span><span style={styles.kvValue}>{fmtOpex(totaux.cout * availability)}</span></div>
        </div>
        <div style={{ ...styles.subSection, background: '#f5f0ff', margin: 8, borderRadius: 6 }}>
          <h3 style={{ ...styles.subTitle, color: '#6a1a6b' }}>{t('totalCO2')}</h3>
          {co2Lignes.map((r) => (
            <div key={r.key} style={styles.kvRow}><span style={styles.kvLabel}>{r.label}<Marque ligne={r} /> [kg/h]</span><span style={styles.kvValue}>{fmtOpex(r.value)}</span></div>
          ))}
          <div style={{ ...styles.kvRow, fontWeight: 'bold' }}><span style={styles.kvLabel}>{t('totalCO2')} [kg/h]</span><span style={styles.kvValue}>{fmtOpex(totaux.co2)}</span></div>
          <div style={styles.kvRow}><span style={styles.kvLabel}>{t('totalCO2')} [t] ({availability} {t('hoursPerYear')})</span><span style={styles.kvValue}>{fmtOpex(totaux.co2 * availability / 1000)}</span></div>
        </div>
      </div>

      <div style={styles.twoCol}>
        {elec.length > 0 && (
          <TableDetail
            titre={t('electricity')}
            colonnes={[t('item'), 'kWé', `${cur}/h`]}
            lignes={elec}
            cellules={(r) => [fmtOpex(r.nombre), fmtOpex(r.cout)]}
            total={[t('total'), fmtOpex(totaux.elec), fmtOpex(elec.reduce((s, r) => s + r.cout, 0))]}
            couleurTotal="#eaf0fb"
          />
        )}
        {eau.length > 0 && (
          <TableDetail
            titre={t('water')}
            colonnes={[t('item'), 'm³/h', `${cur}/m³`, `${cur}/h`]}
            lignes={eau}
            cellules={(r) => [fmtOpex(r.nombre), prix(r.prix), r.prix === null ? '—' : fmtOpex(r.cout)]}
            total={[t('total'), fmtOpex(totaux.eau), '', fmtOpex(eau.reduce((s, r) => s + r.cout, 0))]}
            couleurTotal="#eafaf1"
          />
        )}
        {reactifs.length > 0 && (
          <TableDetail
            titre={t('reagents')}
            colonnes={[t('item'), 'kg/h', `${cur}/t`, `${cur}/h`]}
            lignes={reactifs}
            cellules={(r) => [fmtOpex(r.nombre), prix(r.prix), r.prix === null ? '—' : fmtOpex(r.cout)]}
            total={[t('total'), fmtOpex(totaux.reactifs), '', fmtOpex(reactifs.reduce((s, r) => s + r.cout, 0))]}
            couleurTotal="#fdecea"
          />
        )}
        {energie.length > 0 && (
          <TableDetail
            titre={t('fossilEnergyConsumed')}
            colonnes={[t('item'), 'MW', `${cur}/MWh`, `${cur}/h`, 'CO₂ [kg/h]']}
            lignes={energie}
            cellules={(r) => [fmtOpex(r.nombre), prix(r.prix), r.prix === null ? '—' : fmtOpex(r.cout), r.prix === null ? '—' : fmtOpex(r.co2kg)]}
            total={[t('total'), fmtOpex(totaux.energie), '', fmtOpex(energie.reduce((s, r) => s + r.cout, 0)), fmtOpex(energie.reduce((s, r) => s + r.co2kg, 0))]}
            couleurTotal="#fff8e1"
          />
        )}
      </div>

      {opex.valorisation && (production.length > 0 || recettes !== 0) && (
        <div style={styles.twoCol}>
          <TableDetail
            titre={t('energySold')}
            colonnes={[t('item'), t('value'), t('unitPrice'), `${cur}/h`]}
            lignes={production}
            cellules={(r) => [
              fmtOpex(r.nombre),
              r.prix === null ? '—' : `${fmtOpex(r.prix)} ${r.key === 'row1' ? `${cur}/MWh` : `${cur}/t`}`,
              r.prix === null ? '—' : fmtOpex(r.recette),
            ]}
            total={[t('total'), '', '', fmtOpex(production.reduce((s, r) => s + r.recette, 0))]}
            couleurTotal="#e8f8f5"
          />
          <div style={{ ...styles.subSection, background: '#e8f8f5', margin: 8, borderRadius: 6 }}>
            <h3 style={{ ...styles.subTitle, color: '#0e6655' }}>{t('revenues')}</h3>
            {tables.recettes.filter(nonVide).map((r) => (
              <div key={r.key} style={styles.kvRow}><span style={styles.kvLabel}>{r.label}<Marque ligne={r} /> [{cur}/h]</span><span style={styles.kvValue}>{fmtOpex(r.value)}</span></div>
            ))}
            <div style={{ ...styles.kvRow, fontWeight: 'bold' }}><span style={styles.kvLabel}>{t('revenues')} [{cur}/h]</span><span style={styles.kvValue}>{fmtOpex(recettes)}</span></div>
            <div style={{ ...styles.kvRow, fontWeight: 'bold' }}><span style={styles.kvLabel}>{t('netCost')} [{cur}/h]</span><span style={styles.kvValue}>{fmtOpex(totaux.cout - recettes)}</span></div>
            <div style={styles.kvRow}><span style={styles.kvLabel}>{t('netCost')} ({availability} {t('hoursPerYear')}) [{cur}]</span><span style={styles.kvValue}>{fmtOpex((totaux.cout - recettes) * availability)}</span></div>
          </div>
        </div>
      )}

      <div style={styles.note}>
        {t('opexSource')}{saisies ? ` — ${t('editedValueNote')}` : ''}
      </div>
    </div>
  );
};

const TABLES_AFFICHEES = ['elec', 'eau', 'reactifs', 'energie', 'co2', 'cout', 'production', 'recettes'];
const COULEURS = ['#4a90e2', '#f39c12', '#17a2b8', '#2ecc71', '#e74c3c', '#9b59b6', '#8e44ad', '#34495e'];

const styles = {
  subSection: { padding: '10px 14px' },
  subTitle: { fontSize: 13, fontWeight: 'bold', color: '#1a3a6b', margin: '0 0 6px 0', borderBottom: '1px solid #e0e8f4', paddingBottom: 3 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  kvRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e8e8e8' },
  kvLabel: { color: '#444', flex: 1 },
  kvValue: { fontWeight: 'bold', color: '#1a3a6b', minWidth: 80, textAlign: 'right' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 },
  th: { background: '#eaf0fb', border: '1px solid #c5d5ea', padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: '#1a3a6b' },
  td: { border: '1px solid #dde6f0', padding: '3px 6px', textAlign: 'center', color: '#222' },
  tdLabel: { border: '1px solid #dde6f0', padding: '3px 8px', textAlign: 'left', color: '#333', fontStyle: 'italic' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' },
  tag: { background: '#f0f5ff', border: '1px solid #c5d5ea', borderRadius: 4, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 },
  tagLabel: { fontSize: 10, color: '#555' },
  tagValue: { fontSize: 13, fontWeight: 'bold' },
  marque: { color: '#b8860b', fontStyle: 'normal' },
  note: { fontSize: 11, color: '#777', padding: '4px 14px 10px', fontStyle: 'italic' },
};

export default OpexRapport;
