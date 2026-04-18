import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import RK_Report from '../Y_BILAN/RK/RK_Report';
import BHF_Report from '../Y_BILAN/BHF/BHF_Report';
import COOLINGTOWER_Report from '../Y_BILAN/COOLINGTOWER/COOLINGTOWER_Report';
import CYCLONE_Report from '../Y_BILAN/CYCLONE/CYCLONE_Report';
import DENOX_Report from '../Y_BILAN/DENOX/DENOX_Report';
import ELECTROFILTER_Report from '../Y_BILAN/ELECTROFILTER/ELECTROFILTER_Report';
import IDFAN_Report from '../Y_BILAN/IDFAN/IDFAN_Report';
import QUENCH_Report from '../Y_BILAN/QUENCH/QUENCH_Report';
import REACTOR_Report from '../Y_BILAN/REACTOR/REACTOR_Report';
import SCRUBBER_Report from '../Y_BILAN/SCRUBBER/SCRUBBER_Report';
import STACK_Report from '../Y_BILAN/STACK/STACK_Report';
import WHB_Report from '../Y_BILAN/WHB/WHB_Report';

const REPORT_MAP = {
  RK: RK_Report,
  BHF: BHF_Report,
  COOLINGTOWER: COOLINGTOWER_Report,
  CYCLONE: CYCLONE_Report,
  DENOX: DENOX_Report,
  ELECTROFILTER: ELECTROFILTER_Report,
  IDFAN: IDFAN_Report,
  QUENCH: QUENCH_Report,
  REACTOR: REACTOR_Report,
  SCRUBBER: SCRUBBER_Report,
  STACK: STACK_Report,
  WHB: WHB_Report,
};

const EQUIPMENT_ORDER = ['RK', 'FB', 'WHB', 'QUENCH', 'DENOX', 'BHF', 'REACTOR', 'SCRUBBER', 'ELECTROFILTER', 'CYCLONE', 'COOLINGTOWER', 'IDFAN', 'STACK'];

const GlobalReport = ({ nodes, onClose }) => {
  const reportRef = useRef();
  const [generating, setGenerating] = useState(false);

  // Sort active nodes by process order
  const activeNodes = [...nodes]
    .filter(n => n.data?.isActive && REPORT_MAP[n.data?.label])
    .sort((a, b) => {
      const ia = EQUIPMENT_ORDER.indexOf(a.data.label);
      const ib = EQUIPMENT_ORDER.indexOf(b.data.label);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`rapport_global_${date}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Rapport Global — Synthèse des équipements</h2>
          <div style={styles.headerActions}>
            <span style={styles.nodeCount}>
              {activeNodes.length} équipement{activeNodes.length > 1 ? 's' : ''} actif{activeNodes.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={generatePDF}
              disabled={generating || activeNodes.length === 0}
              style={{ ...styles.btn, ...styles.btnPdf, ...(generating ? styles.btnDisabled : {}) }}
            >
              {generating ? '⏳ Génération...' : '⬇ Télécharger PDF'}
            </button>
            <button onClick={onClose} style={{ ...styles.btn, ...styles.btnClose }}>
              ✕ Fermer
            </button>
          </div>
        </div>

        {/* Scrollable preview area */}
        <div style={styles.scrollArea}>
          {activeNodes.length === 0 ? (
            <div style={styles.empty}>
              <p>Aucun équipement actif. Ouvrez un équipement, configurez-le et revenez au flow pour activer son rapport.</p>
            </div>
          ) : (
            <div ref={reportRef} style={styles.reportContent}>
              {/* Cover page */}
              <div style={styles.coverPage}>
                <div style={styles.coverLogo}>⚙</div>
                <h1 style={styles.coverTitle}>Rapport de Process — Incinération</h1>
                <p style={styles.coverDate}>Généré le {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div style={styles.coverEquipList}>
                  <h3 style={styles.coverEquipTitle}>Équipements inclus :</h3>
                  {activeNodes.map(n => (
                    <div key={n.id} style={styles.coverEquipItem}>▸ {n.data.label}{n.data.title ? ` — ${n.data.title}` : ''}</div>
                  ))}
                </div>
              </div>

              {/* One section per active node */}
              {activeNodes.map((node, idx) => {
                const Component = REPORT_MAP[node.data.label];
                return (
                  <div key={node.id} style={styles.equipSection}>
                    <div style={styles.equipSeparator}>
                      <span style={styles.equipIndex}>{idx + 1}</span>
                      <span style={styles.equipLabel}>{node.data.label}</span>
                    </div>
                    <Component innerData={node.data.result || {}} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999, display: 'flex', alignItems: 'stretch', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column',
    width: '100%', maxWidth: 1200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', background: '#1a3a6b', flexShrink: 0,
  },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  nodeCount: { color: '#adc8f0', fontSize: 13 },
  btn: {
    padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer',
    fontWeight: 'bold', fontSize: 13,
  },
  btnPdf: { background: '#27ae60', color: '#fff' },
  btnClose: { background: '#c0392b', color: '#fff' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  scrollArea: { flex: 1, overflowY: 'auto', background: '#f0f2f5', padding: '20px' },
  empty: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#888', fontSize: 15, textAlign: 'center', padding: 40,
  },
  reportContent: { background: '#fff', maxWidth: 1050, margin: '0 auto' },
  coverPage: {
    padding: '60px 48px', textAlign: 'center', borderBottom: '4px solid #4a90e2',
    background: 'linear-gradient(135deg, #1a3a6b 0%, #2c5aa0 100%)', color: '#fff',
  },
  coverLogo: { fontSize: 64, marginBottom: 16 },
  coverTitle: { fontSize: 28, fontWeight: 'bold', margin: '0 0 12px 0', color: '#fff' },
  coverDate: { fontSize: 14, color: '#adc8f0', margin: '0 0 32px 0' },
  coverEquipList: {
    display: 'inline-block', textAlign: 'left', background: 'rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '16px 24px', minWidth: 300,
  },
  coverEquipTitle: { margin: '0 0 10px 0', fontSize: 15, color: '#e0ecff' },
  coverEquipItem: { padding: '4px 0', fontSize: 14, color: '#fff' },
  equipSection: { borderBottom: '3px solid #e0e8f4' },
  equipSeparator: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#eaf0fb', padding: '10px 20px', borderBottom: '1px solid #c5d5ea',
  },
  equipIndex: {
    background: '#4a90e2', color: '#fff', borderRadius: '50%',
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: 13, flexShrink: 0,
  },
  equipLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a3a6b' },
};

export default GlobalReport;
