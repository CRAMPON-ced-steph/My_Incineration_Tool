import React from 'react';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './RK_traduction';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import { makeReportT } from '../../D_BILAN_Rapports/report_traduction';
import OpexRapport from '../../D_BILAN_Rapports/OpexRapport';

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const SubSection = ({ title, children }) => (
  <div style={styles.subSection}>
    {title && <h3 style={styles.subTitle}>{title}</h3>}
    {children}
  </div>
);

const KV = ({ label, value, unit = '' }) => (
  <div style={styles.kvRow}>
    <span style={styles.kvLabel}>{label}</span>
    <span style={styles.kvValue}>{value}{unit ? <span style={styles.kvUnit}> {unit}</span> : null}</span>
  </div>
);

const GasTable = ({ title, data = {}, tr }) => {
  const gases = ['CO2', 'H2O', 'O2', 'N2'];
  return (
    <div style={{ marginBottom: 8 }}>
      {title && <div style={styles.tableTitle}>{title}</div>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}></th>
            {gases.map(g => <th key={g} style={styles.th}>{g}</th>)}
            <th style={styles.th}>{tr ? tr('total') : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([rowLabel, rowData]) => {
            const total = gases.reduce((s, g) => s + (parseFloat(rowData[g]) || 0), 0);
            return (
              <tr key={rowLabel}>
                <td style={styles.tdLabel}>{rowLabel}</td>
                {gases.map(g => (
                  <td key={g} style={styles.td}>{fmt(rowData[g])}</td>
                ))}
                <td style={{ ...styles.td, fontWeight: 'bold' }}>{fmt(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const PollutantTable = ({ title, masses = {} }) => {
  const keys = Object.keys(masses).filter(k => masses[k] !== undefined);
  return (
    <div style={{ marginBottom: 8 }}>
      {title && <div style={styles.tableTitle}>{title}</div>}
      <table style={styles.table}>
        <thead>
          <tr>
            {keys.map(k => <th key={k} style={styles.th}>{k}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {keys.map(k => (
              <td key={k} style={styles.td}>{fmt(masses[k], 4)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ElecTable = ({ rows, tr }) => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>{tr('consumer')}</th>
        <th style={styles.th}>{tr('consumptionKW')}</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(({ label, value }) => (
        <tr key={label}>
          <td style={styles.tdLabel}>{label}</td>
          <td style={styles.td}>{fmt(value)}</td>
        </tr>
      ))}
      <tr style={{ backgroundColor: '#eaf0fb', fontWeight: 'bold' }}>
        <td style={styles.tdLabel}>{tr('total')}</td>
        <td style={styles.td}>{fmt(rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0))}</td>
      </tr>
    </tbody>
  </table>
);

// ─── OPEX cost calculation (mirrors OpexDashboard logic) ──────────────────────

// ─── Main Component ───────────────────────────────────────────────────────────

const RK_Report = ({ innerData = {}, currentLanguage = 'fr', nodeId }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  const tr = makeReportT(currentLanguage);

  // ── Tab 1 : Combustion Parameters ────────────────────────────────────────────
  const masse = innerData.masse || 0;
  const cv_kJ_kg = innerData.cv_kJ_kg || 0;
  const cvw_kJ_kg = innerData.cvw_kJ_kg || 0;
  const cvw_kcal_kg = innerData.cvw_kcal_kg || 0;

  const elementsKgH = {
    'C [kg/h]': innerData.Cmass,
    'H [kg/h]': innerData.Hmass,
    'O [kg/h]': innerData.Omass,
    'N [kg/h]': innerData.Nmass,
    'S [kg/h]': innerData.Smass,
    'Cl [kg/h]': innerData.Clmass,
  };
  const fractionsMasses = {
    'Comb [kg/h]': innerData.Combmass,
    'Eau [kg/h]': innerData.Watermass,
    'Inerte [kg/h]': innerData.Inertmass,
  };

  // ── Tab 2 : Flue Gas ─────────────────────────────────────────────────────────
  const T_OUT = innerData.T_OUT || 0;
  const O2_calcule = innerData.O2_calcule || 0;
  const FG_OUT_kg_h = innerData.FG_OUT_kg_h || {};
  const FG_RK_OUT_Nm3_h = innerData.FG_RK_OUT_Nm3_h || {};
  const FG_wet_total = (FG_OUT_kg_h.CO2 || 0) + (FG_OUT_kg_h.H2O || 0) + (FG_OUT_kg_h.O2 || 0) + (FG_OUT_kg_h.N2 || 0);

  // ── Tab 3 : Pollutant Emissions ───────────────────────────────────────────────
  const PInput = innerData.PInput || {};
  const Poutput = innerData.Poutput || {};
  const Residus = innerData.Residus || {};
  const Conso_reactifs = innerData.Conso_reactifs || {};

  // ── Tab 4 : Design ────────────────────────────────────────────────────────────
  const elecRows = [
    { label: innerData.labelElec1 || tr('elecRotationRK'), value: innerData.consoElec1 },
    { label: innerData.labelElec2 || tr('elecPompeLances'), value: innerData.consoElec2 },
    { label: innerData.labelElec3 || tr('compressedAir'), value: innerData.consoElec3 },
    { label: innerData.labelElec4 || tr('elecVentAirComb'), value: innerData.consoElec4 },
    { label: innerData.labelElec5 || tr('elecVentVirole'), value: innerData.consoElec5 },
    { label: innerData.labelElec6 || tr('elecExtracteur'), value: innerData.consoElec6 },
    { label: innerData.labelElec7 || tr('elecPompeBoue'), value: innerData.consoElec7 },
    { label: innerData.labelElec8 || tr('elecTapis'), value: innerData.consoElec8 },
  ].filter(r => r.value !== undefined && r.value !== null);

  const waterConsumption = [
    { label: `${tr('waterPotable')} [m³/h]`, value: innerData.Conso_EauPotable_m3 },
    { label: `${tr('waterCooling')} [m³/h]`, value: innerData.Conso_EauRefroidissement_m3 },
    { label: `${tr('waterDemin')} [m³/h]`, value: innerData.Conso_EauDemin_m3 },
    { label: `${tr('waterRiver')} [m³/h]`, value: innerData.Conso_EauRiviere_m3 },
    { label: `${tr('waterSoft')} [m³/h]`, value: innerData.Conso_EauAdoucie_m3 },
  ].filter(r => parseFloat(r.value) > 0);

  const reactifConsumption = [
    { label: 'CaCO₃ [kg/h]', value: innerData.Conso_CaCO3_kg },
    { label: 'CaO [kg/h]', value: innerData.Conso_CaO_kg },
    { label: `${tr('caoh2Dry')} [kg/h]`, value: innerData.Conso_CaOH2_dry_kg },
    { label: `${tr('caoh2Wet')} [kg/h]`, value: innerData.Conso_CaOH2_wet_kg },
    { label: 'NaOH [kg/h]', value: innerData.Conso_NaOH_kg },
    { label: 'NaHCO₃ [kg/h]', value: innerData.Conso_NaOHCO3_kg },
    { label: 'NH₃ [kg/h]', value: innerData.Conso_Ammonia_kg },
    { label: 'NaBr/CaBr₂ [kg/h]', value: innerData.Conso_NaBrCaBr2_kg },
    { label: 'CAP [kg/h]', value: innerData.Conso_CAP_kg },
  ].filter(r => parseFloat(r.value) > 0);

  const fractionLabels = { 'Comb [kg/h]': tr('fracComb'), 'Eau [kg/h]': tr('fracWater'), 'Inerte [kg/h]': tr('fracInert') };

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>{t('title')} — {tr('summaryReport')}</h1>

      {/* ── SECTION 1 : Combustion ──────────────────────────────────────────────── */}
      <Section title={`1. ${t('combustionParameters')}`}>
        <div style={styles.twoCol}>
          <SubSection title={tr('wasteMassCV')}>
            <KV label={t('wasteFlow')} value={fmt(masse)} unit="kg/h" />
            <KV label={tr('pciFuel')} value={fmt(cv_kJ_kg)} unit="kJ/kg" />
            <KV label={tr('pciWaste')} value={fmt(cvw_kJ_kg)} unit="kJ/kg" />
            <KV label={tr('pciWaste')} value={fmt(cvw_kcal_kg)} unit="kcal/kg" />
          </SubSection>
          <SubSection title={tr('massFractions')}>
            {Object.entries(fractionsMasses).map(([k, v]) => (
              <KV key={k} label={fractionLabels[k] || k} value={fmt(v)} />
            ))}
          </SubSection>
        </div>
        <SubSection title={tr('combustibleElements')}>
          <div style={styles.tagRow}>
            {Object.entries(elementsKgH).map(([k, v]) => (
              <div key={k} style={styles.tag}>
                <span style={styles.tagLabel}>{k}</span>
                <span style={styles.tagValue}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* ── SECTION 2 : Gaz de combustion ──────────────────────────────────────── */}
      <Section title={`2. ${t('flueGases')}`}>
        <div style={styles.twoCol}>
          <SubSection>
            <KV label={tr('outTemp')} value={fmt(T_OUT, 0)} unit="°C" />
            <KV label={tr('o2Measured')} value={fmt(O2_calcule)} unit="%" />
            <KV label={tr('flowDry')} value={fmt(FG_RK_OUT_Nm3_h.dry, 0)} unit="Nm³/h" />
            <KV label={tr('flowWet')} value={fmt(FG_RK_OUT_Nm3_h.wet, 0)} unit="Nm³/h" />
          </SubSection>
          <SubSection title={tr('compKilnExtractor')}>
            <GasTable
              tr={tr}
              data={{
                'kg/h': FG_OUT_kg_h,
                'Nm³/h': {
                  CO2: FG_RK_OUT_Nm3_h.CO2,
                  H2O: FG_RK_OUT_Nm3_h.H2O,
                  O2: FG_RK_OUT_Nm3_h.O2,
                  N2: FG_RK_OUT_Nm3_h.N2,
                },
              }}
            />
            <KV label={tr('totalWetFlowKgh')} value={fmt(FG_wet_total)} />
          </SubSection>
        </div>
      </Section>

      {/* ── SECTION 3 : Émissions polluantes ───────────────────────────────────── */}
      <Section title={`3. ${t('pollutantEmissions')}`}>
        <SubSection title={t('inputFlueGas') + ' [kg/h]'}>
          <PollutantTable masses={PInput} />
        </SubSection>
        <SubSection title={t('outputFlueGas') + ' [kg/h]'}>
          <PollutantTable masses={Poutput} />
        </SubSection>
        <div style={styles.twoCol}>
          <SubSection title={t('bottomAshesCalculated')}>
            <KV label={t('bottomAsh')} value={fmt(Residus.DryBottomAsh_kg_h)} unit="kg/h" />
            <KV label={t('bottomAshWet')} value={fmt(Residus.WetBottomAsh_kg_h)} unit="kg/h" />
            <KV label={t('flyAsh')} value={fmt(Residus.FlyAsh_kg_h)} unit="kg/h" />
          </SubSection>
          {reactifConsumption.length > 0 && (
            <SubSection title={tr('reagentConsumption')}>
              {reactifConsumption.map(({ label, value }) => (
                <KV key={label} label={label} value={fmt(value, 3)} />
              ))}
            </SubSection>
          )}
        </div>
      </Section>

      {/* ── SECTION 4 : Design ─────────────────────────────────────────────────── */}
      <Section title={`4. ${t('design')}`}>
        <div style={styles.twoCol}>
          <SubSection title={tr('elecConsumption')}>
            {elecRows.length > 0
              ? <ElecTable rows={elecRows} tr={tr} />
              : <span style={{ color: '#999', fontSize: 12 }}>{tr('dataNotAvailableDesign')}</span>
            }
          </SubSection>
          <div>
            {waterConsumption.length > 0 && (
              <SubSection title={tr('waterConsumption')}>
                {waterConsumption.map(({ label, value }) => (
                  <KV key={label} label={label} value={fmt(value, 3)} />
                ))}
              </SubSection>
            )}
            <SubSection title={tr('auxEnergy')}>
              <KV label={tr('gasHighMW')} value={fmt(innerData.conso_gaz_H_MW)} />
              <KV label={tr('fuelMW')} value={fmt(innerData.conso_fuel_MW)} />
              <KV label={tr('compAirNm3h')} value={fmt(innerData.conso_air_co_N_m3)} />
            </SubSection>
            <SubSection title={tr('solidsProduced')}>
              <KV label={tr('bottomAshInc')} value={fmt(innerData.conso_incineration_ash_kg_h)} />
              <KV label={tr('boilerAsh')} value={fmt(innerData.conso_boiler_ash_kg_h)} />
              <KV label={tr('flyAshLabel')} value={fmt(innerData.conso_fly_ash_kg_h)} />
            </SubSection>
          </div>
        </div>
      </Section>

      {/* ── SECTION 5 : OPEX — coûts calculés ─────────────────────────────────── */}
      <Section title={`5. ${t('opex')} — ${tr('hourlyCostsSuffix')}`}>
        <OpexRapport innerData={innerData} equipmentType="RK" nodeId={nodeId} currentLanguage={currentLanguage} />
      </Section>

      <div style={styles.footer}>
        {tr('autoGenerated')} {new Date().toLocaleDateString(languageCode)}
      </div>
    </div>
  );
};

// ─── OPEX cost section ────────────────────────────────────────────────────────

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 13,
    color: '#222',
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 24px',
    backgroundColor: '#fff',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a6b',
    borderBottom: '3px solid #4a90e2',
    paddingBottom: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
    border: '1px solid #d0daea',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    background: '#4a90e2',
    margin: 0,
    padding: '8px 14px',
  },
  subSection: {
    padding: '10px 14px',
  },
  subTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a3a6b',
    margin: '0 0 6px 0',
    borderBottom: '1px solid #e0e8f4',
    paddingBottom: 3,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
  },
  kvRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '3px 0',
    borderBottom: '1px dotted #e8e8e8',
  },
  kvLabel: {
    color: '#444',
    flex: 1,
  },
  kvValue: {
    fontWeight: 'bold',
    color: '#1a3a6b',
    minWidth: 80,
    textAlign: 'right',
  },
  kvUnit: {
    fontWeight: 'normal',
    color: '#666',
    fontSize: 11,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 11,
    marginBottom: 8,
  },
  th: {
    background: '#eaf0fb',
    border: '1px solid #c5d5ea',
    padding: '4px 6px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1a3a6b',
  },
  td: {
    border: '1px solid #dde6f0',
    padding: '3px 6px',
    textAlign: 'center',
    color: '#222',
  },
  tdLabel: {
    border: '1px solid #dde6f0',
    padding: '3px 8px',
    textAlign: 'left',
    color: '#333',
    fontStyle: 'italic',
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '4px 0',
  },
  tag: {
    background: '#f0f5ff',
    border: '1px solid #c5d5ea',
    borderRadius: 4,
    padding: '4px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 110,
  },
  tagLabel: {
    fontSize: 10,
    color: '#555',
  },
  tagValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a3a6b',
  },
  footer: {
    marginTop: 24,
    textAlign: 'right',
    fontSize: 11,
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: 8,
  },
};

export default RK_Report;
