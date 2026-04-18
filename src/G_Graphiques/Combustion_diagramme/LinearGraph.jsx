import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Import translations
import { getLinearGraphTranslations } from './LinearGraph_traduction';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LinearGraph = ({ currentLanguage = 'fr' }) => {
  // Get current language code and translations
  const languageCode = getLanguageCode(currentLanguage);
  const t = getLinearGraphTranslations(languageCode);

  // Load saved points from localStorage or use defaults
  const loadPoint = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // Points coordinates with saved or default values
  const [pointA, setPointA] = useState(loadPoint('pointA', { x: 100, y: 2 }));
  const [pointB, setPointB] = useState(loadPoint('pointB', { x: 150, y: 10 }));
  const [pointC, setPointC] = useState(loadPoint('pointC', { x: 800, y: 10 }));
  const [pointD, setPointD] = useState(loadPoint('pointD', { x: 300, y: 2 }));
  const [pointE, setPointE] = useState(loadPoint('pointE', { x: 500, y: 8 }));

  // Save points to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pointA', JSON.stringify(pointA));
    localStorage.setItem('pointB', JSON.stringify(pointB));
    localStorage.setItem('pointC', JSON.stringify(pointC));
    localStorage.setItem('pointD', JSON.stringify(pointD));
    localStorage.setItem('pointE', JSON.stringify(pointE));
  }, [pointA, pointB, pointC, pointD, pointE]);

  // Handler for updating point coordinates
  const handlePointChange = (point, coord, value) => {
    switch (point) {
      case 'A':
        setPointA(prev => ({ ...prev, [coord]: value }));
        break;
      case 'B':
        setPointB(prev => ({ ...prev, [coord]: value }));
        break;
      case 'C':
        setPointC(prev => ({ ...prev, [coord]: value }));
        break;
      case 'D':
        setPointD(prev => ({ ...prev, [coord]: value }));
        break;
      case 'E':
        setPointE(prev => ({ ...prev, [coord]: value }));
        break;
      default:
        break;
    }
  };

  // Create dataset connecting points to form a polygon
  const data = {
    datasets: [
      {
        type: 'line',
        label: t.operationDomain,
        data: [
          { x: pointA.x, y: pointA.y },
          { x: pointB.x, y: pointB.y },
          { x: pointC.x, y: pointC.y },
          { x: pointD.x, y: pointD.y },
          { x: pointA.x, y: pointA.y }, // Connect back to A to close the polygon
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0, // Use straight lines
        pointBackgroundColor: ['red', 'blue', 'green', 'purple', 'red'],
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        type: 'scatter',
        label: t.pointE,
        data: [{ x: pointE.x, y: pointE.y }],
        backgroundColor: 'orange',
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t.chartTitle,
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label;
            const x = context.parsed.x;
            const y = context.parsed.y;
            
            if (datasetLabel === t.pointE) {
              return `${t.pointE}: (${x} kg/h, ${y} MW)`;
            } else {
              const pointLabels = ['A', 'B', 'C', 'D', 'A'];
              const pointLabel = pointLabels[context.dataIndex];
              return `${t.point} ${pointLabel}: (${x} kg/h, ${y} MW)`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: t.xAxisLabel,
          font: {
            size: 14,
            weight: 'bold',
          }
        },
        min: 0,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        title: {
          display: true,
          text: t.yAxisLabel,
          font: {
            size: 14,
            weight: 'bold',
          }
        },
        min: 0,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
  };

  // Vérifie si la puissance min (Y de A et D) est < 40% de la puissance max (Y de B et C)
  const seuilB = pointB.y * 0.4;
  const seuilC = pointC.y * 0.4;
  const isBelowThreshold = pointA.y < seuilB || pointD.y < seuilC;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      width: '80%',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{t.title}</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
        {/* Point A */}
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>{t.point} A</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              {t.xLabel}
              <input
                type="number"
                value={pointA.x}
                onChange={(e) => handlePointChange('A', 'x', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
            <label>
              {t.yLabel}
              <input
                type="number"
                value={pointA.y}
                onChange={(e) => handlePointChange('A', 'y', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
          </div>
        </div>

        {/* Point B */}
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(0, 0, 255, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'blue' }}>{t.point} B</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              {t.xLabel}
              <input
                type="number"
                value={pointB.x}
                onChange={(e) => handlePointChange('B', 'x', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
            <label>
              {t.yLabel}
              <input
                type="number"
                value={pointB.y}
                onChange={(e) => handlePointChange('B', 'y', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
          </div>
        </div>

        {/* Point C */}
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(0, 128, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'green' }}>{t.point} C</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              {t.xLabel}
              <input
                type="number"
                value={pointC.x}
                onChange={(e) => handlePointChange('C', 'x', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
            <label>
              {t.yLabel}
              <input
                type="number"
                value={pointC.y}
                onChange={(e) => handlePointChange('C', 'y', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
          </div>
        </div>

        {/* Point D */}
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(128, 0, 128, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'purple' }}>{t.point} D</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              {t.xLabel}
              <input
                type="number"
                value={pointD.x}
                onChange={(e) => handlePointChange('D', 'x', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
            <label>
              {t.yLabel}
              <input
                type="number"
                value={pointD.y}
                onChange={(e) => handlePointChange('D', 'y', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
          </div>
        </div>

        {/* Point E */}
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 165, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'orange' }}>{t.point} E</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              {t.xLabel}
              <input
                type="number"
                value={pointE.x}
                onChange={(e) => handlePointChange('E', 'x', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
            <label>
              {t.yLabel}
              <input
                type="number"
                value={pointE.y}
                onChange={(e) => handlePointChange('E', 'y', Number(e.target.value))}
                style={{ marginLeft: '5px', width: '70px' }}
              />
            </label>
          </div>
        </div>
      </div>
      
      {isBelowThreshold && (
        <div style={{
          backgroundColor: '#ffdddd',
          color: '#a94442',
          padding: '10px',
          border: '1px solid #ebccd1',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '0.95rem'
        }}>
          {t.warningMessage}
        </div>
      )}

      <div style={{ height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default LinearGraph;