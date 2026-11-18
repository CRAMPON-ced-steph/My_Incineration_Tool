import React, { useState, useEffect } from 'react';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './OpexDashboard_traduction';
import {
  calculerOpex, configOpex, lireEtatOpex, etatAPersister, cleStockageOpex, cleInnerDataOpex,
  fmtOpex, uniteHoraire, uniteAnnuelle, versAnnuel, ETAT_VIDE,
} from './opexTableau';


// ─── Helpers et composants définis au niveau module ───────────────────────────
// Raison : si ces fonctions/composants sont définis DANS OpexDashboard, React
// crée de nouvelles références à chaque re-render → unmount/remount de toutes
// les instances → EditableCell perd son état local (isEditing, value) et les
// lignes ajoutées disparaissent (nouvelle fonction = nouveau type pour React).

// Valeur proposée à l'édition (sans séparateur de milliers, 6 chiffres significatifs).
const texteEdition = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? String(parseFloat(v.toPrecision(6))) : '';
  return v ?? '';
};

const EditableCell = ({ value, display, onSave, fixe = false, title }) => {
  const [texte, setTexte] = useState(texteEdition(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { if (!isEditing) setTexte(texteEdition(value)); }, [value, isEditing]);

  const commit = () => {
    setIsEditing(false);
    if (texte !== texteEdition(value)) onSave(texte);
  };

  return isEditing ? (
    <input
      type="text"
      value={texte}
      onChange={e => setTexte(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === 'Enter' && commit()}
      autoFocus
      style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      title={title}
      style={{ padding: '6px', height: '34px', cursor: 'text', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: fixe ? '#fff3cd' : '#f9f9f9', display: 'flex', alignItems: 'center' }}
    >
      {display ?? value ?? ''}
    </div>
  );
};

const ToggleSwitch = ({ isOn, handleToggle }) => (
  <div
    style={{ position: 'relative', width: '50px', height: '24px', backgroundColor: isOn ? '#4CAF50' : '#ccc', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.3s' }}
    onClick={handleToggle}
  >
    <div style={{ position: 'absolute', left: isOn ? '26px' : '2px', top: '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
  </div>
);

const boutonPetit = { padding: '4px 8px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

const DataTable = ({ title, color, table, lignes, total, opex, actions, t }) => {
  const uniteH = uniteHoraire(table, opex.currency);
  const annuel = opex.isAnnualMode;
  // Production vendue : unités différentes selon la ligne (kWé, t/h) → pas de total.
  const sansTotal = table === 'production';

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{ backgroundColor: color, padding: '10px 15px', borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 'bold', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{title}{uniteH ? ` [${uniteH}]` : ''}</span>
        {!sansTotal && <span>{t('total')}: {annuel ? `${fmtOpex(versAnnuel(total, table, opex.availability))} ${uniteAnnuelle(table, opex.currency)}` : fmtOpex(total)}</span>}
      </div>
      <div style={{ border: `1px solid ${color}`, borderTop: 'none', padding: '15px', borderRadius: '0 0 5px 5px' }}>
        {lignes.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{t('description')}</th>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{t('value')}</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '90px' }}>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map(row => (
                <tr key={row.key}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <EditableCell
                      value={row.label}
                      onSave={v => actions.modifier(table, row.key, 'label', v)}
                      fixe={!!row.libelleFixe}
                      title={row.libelleFixe ? t('editedValueHint') : undefined}
                    />
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <EditableCell
                      value={row.value}
                      display={row.manuelle && row.value === '' ? '' : fmtOpex(row.value)}
                      onSave={v => actions.modifier(table, row.key, 'value', v)}
                      fixe={!!row.valeurFixee}
                      title={row.valeurFixee ? t('editedValueHint') : undefined}
                    />
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {(row.valeurFixee || row.libelleFixe) && (
                      <button title={t('restoreCalculated')} onClick={() => actions.restaurer(table, row.key)} style={{ ...boutonPetit, backgroundColor: '#f0ad4e', marginRight: 4 }}>↺</button>
                    )}
                    <button onClick={() => actions.supprimer(table, row.key)} style={{ ...boutonPetit, backgroundColor: '#ff5252' }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>{t('noDataToDisplay')}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <button onClick={() => actions.ajouter(table)} style={{ padding: '8px 12px', backgroundColor: color, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {t('addRow')}
          </button>
          {!sansTotal && (
            <div style={{ fontWeight: 'bold', fontSize: '16px', padding: '8px 12px', backgroundColor: '#f0f0f0', borderRadius: '4px', border: '1px solid #ddd' }}>
              {t('total')}: {fmtOpex(total)} {uniteH}
              {annuel && <span style={{ fontWeight: 'normal' }}> — {fmtOpex(versAnnuel(total, table, opex.availability))} {uniteAnnuelle(table, opex.currency)} ({t('annual').toLowerCase()})</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CARTES = [
  { table: 'elec', titre: 'electricity', couleur: '#4a90e2' },
  { table: 'eau', titre: 'water', couleur: '#2ecc71' },
  { table: 'reactifs', titre: 'reagents', couleur: '#e74c3c' },
  { table: 'energie', titre: 'energy', couleur: '#f39c12' },
  { table: 'co2', titre: 'CO2', couleur: '#9b59b6' },
  { table: 'cout', titre: 'cost', couleur: '#34495e' },
];

// Chaudière (valorisation) : recettes et coût net.
const CARTES_VALORISATION = [
  { table: 'recettes', titre: 'revenues', couleur: '#16a085' },
  { table: 'net', titre: 'netCost', couleur: '#2c3e50' },
];

const TABLEAUX_VALORISATION = [
  { table: 'production', titre: 'energySold', couleur: '#1abc9c' },
  { table: 'recettes', titre: 'revenues', couleur: '#16a085' },
];

const TABLEAUX = [
  { table: 'elec', titre: 'electricity', couleur: '#4a90e2' },
  { table: 'eau', titre: 'water', couleur: '#2ecc71' },
  { table: 'reactifs', titre: 'reagents', couleur: '#e74c3c' },
  { table: 'energie', titre: 'fossilEnergyConsumed', couleur: '#f39c12' },
  { table: 'co2', titre: 'CO2', couleur: '#9b59b6' },
  { table: 'cout', titre: 'cost', couleur: '#34495e' },
];

const ConsumptionSummary = ({ opex, equipmentType, color, onToggle, t }) => {
  const annuel = opex.isAnnualMode;
  return (
    <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>{t('consumptionSummary')} - {equipmentType}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: !annuel ? color : '#666', fontWeight: !annuel ? 'bold' : 'normal' }}>{t('hourly')}</span>
          <ToggleSwitch isOn={annuel} handleToggle={onToggle} />
          <span style={{ color: annuel ? '#4CAF50' : '#666', fontWeight: annuel ? 'bold' : 'normal' }}>{t('annual')}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {(opex.valorisation ? [...CARTES, ...CARTES_VALORISATION] : CARTES).map(({ table, titre, couleur }) => {
          // Coût net = coût − recettes (mêmes unités que le coût).
          const total = table === 'net' ? opex.totaux.cout - opex.totaux.recettes : opex.totaux[table];
          const tableUnite = table === 'net' ? 'cout' : table;
          const valeur = annuel ? versAnnuel(total, tableUnite, opex.availability) : total;
          const unite = annuel ? uniteAnnuelle(tableUnite, opex.currency) : uniteHoraire(tableUnite, opex.currency);
          return (
            <div key={table} style={{ flex: '1 1 30%', padding: '10px', backgroundColor: couleur, color: 'white', borderRadius: '4px', minWidth: '150px' }}>
              <div>{titre === 'CO2' ? 'CO2' : t(titre)} [{unite}]</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{fmtOpex(valeur)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// ─── Fin composants module-level ──────────────────────────────────────────────

const OpexDashboard = ({
  equipmentType,
  // FB/GF passent aussi innerDataTick (objet innerData muté) : le changement de
  // prop suffit à relancer le rendu, les tableaux sont recalculés à chaque rendu.
  innerData,
  setInnerData,
  currentLanguage = 'fr',
  equipmentConfig = {},
  nodeId,
}) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const config = {
    title: `${equipmentType} ${t('opexDashboard')}`,
    color: '#1a73e8',
    ...configOpex(equipmentType, equipmentConfig),
  };

  const STORAGE_KEY = cleStockageOpex(equipmentType, nodeId);

  // Saisies de l'onglet (lignes modifiées, ajoutées, supprimées, mode annuel).
  const [etat, setEtat] = useState(() => lireEtatOpex(equipmentType, nodeId, innerData) || ETAT_VIDE);

  // Tableaux affichés = lignes calculées depuis innerData + saisies.
  const opex = calculerOpex(innerData, { sauve: etat, config, t });

  // Remplace un tableau dans les saisies à partir du tableau affiché.
  const majTable = (table, transforme) => {
    setEtat(prev => ({ ...prev, tables: { ...prev.tables, [table]: transforme(opex.tables[table]) } }));
  };

  const actions = {
    modifier: (table, key, champ, v) => majTable(table, lignes => lignes.map(r => {
      if (r.key !== key) return r;
      if (r.manuelle) return { ...r, [champ]: v };
      return champ === 'label' ? { ...r, label: v, libelleFixe: true } : { ...r, value: v, valeurFixee: true };
    })),
    restaurer: (table, key) => majTable(table, lignes => lignes.map(r => {
      if (r.key !== key) return r;
      const reste = { ...r };
      delete reste.valeurFixee;
      delete reste.libelleFixe;
      return reste;
    })),
    ajouter: (table) => majTable(table, lignes => [...lignes, { key: `row${Date.now()}`, label: '', value: '', manuelle: true }]),
    supprimer: (table, key) => {
      const ligne = opex.tables[table].find(r => r.key === key);
      setEtat(prev => ({
        ...prev,
        tables: { ...prev.tables, [table]: opex.tables[table].filter(r => r.key !== key) },
        supprimees: ligne && !ligne.manuelle
          ? { ...prev.supprimees, [table]: [...new Set([...(prev.supprimees?.[table] || []), key])] }
          : prev.supprimees,
      }));
    },
  };

  // Persistance (localStorage du nœud + copie dans innerData pour le rapport et
  // le projet JSON) et totaux horaires pour le panneau OPEX global (Main_FLOW).
  const aPersister = etatAPersister(opex);
  const signature = JSON.stringify(aPersister);
  const { elec, eau, reactifs, energie, co2, cout } = opex.totaux;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, signature); } catch { /* quota / navigation privée */ }
    if (setInnerData) {
      setInnerData(prevData => ({
        ...prevData,
        [cleInnerDataOpex(equipmentType, nodeId)]: JSON.parse(signature),
        activeNodes_Elec: [{ label: equipmentType, data: { consommationElec: elec } }],
        activeNodes_Eau: [{ label: equipmentType, data: { consommationEau: eau } }],
        activeNodes_Reactifs: [{ label: equipmentType, data: { consommationReactifs: reactifs } }],
        activeNodes_Energie: [{ label: equipmentType, data: { consommationEnergie: energie } }],
        activeNodes_CO2: [{ label: equipmentType, data: { emissionsCO2: co2 } }],
        activeNodes_cout: [{ label: equipmentType, data: { cout } }],
      }));
    }
    // Dépendances limitées à la signature : setInnerData est recréé à chaque rendu
    // par certains MainPage (FB, GF) et les totaux découlent de la signature.
  }, [signature, STORAGE_KEY]);

  const resetData = () => {
    if (window.confirm(t('confirmReset'))) setEtat(ETAT_VIDE);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: config.color }}>{config.title}</h1>
        <button
          onClick={resetData}
          style={{ padding: '8px 16px', backgroundColor: '#ff5252', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {t('reset')}
        </button>
      </div>

      <ConsumptionSummary
        opex={opex}
        equipmentType={equipmentType}
        color={config.color}
        onToggle={() => setEtat(prev => ({ ...prev, isAnnualMode: !prev.isAnnualMode }))}
        t={t}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {(opex.valorisation ? [...TABLEAUX, ...TABLEAUX_VALORISATION] : TABLEAUX).map(({ table, titre, couleur }) => (
          <div key={table} style={{ flex: '1 1 45%', minWidth: '300px' }}>
            <DataTable
              title={titre === 'CO2' ? 'CO2' : t(titre)}
              color={couleur}
              table={table}
              lignes={opex.tables[table]}
              total={opex.totaux[table]}
              opex={opex}
              actions={actions}
              t={t}
            />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
        <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#fff3cd', border: '1px solid #ccc', marginRight: 6, verticalAlign: 'middle' }} />
        {t('editedValueHint')}
      </div>

      <button
        onClick={() => window.print()}
        style={{ width: '100%', padding: '12px', background: config.color, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
      >
        {t('export')} {equipmentType} Opex
      </button>
    </div>
  );
};

export default OpexDashboard;
