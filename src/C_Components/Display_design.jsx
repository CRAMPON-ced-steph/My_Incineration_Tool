
import React from 'react';
import TableGeneric from './Tableau_generique';

const DisplayDesignComponent = ({
  imageSrc,                // Chemin de l'image
  imageAlt = 'Image',      // Texte alternatif de l'image
  imageWidth = '60%',      // Largeur de l'image
  direction = 'row',       // 'row' ou 'column' pour la disposition
  title = 'Paramètres',    // Titre de la section des paramètres
  parametersObject,        // Objet contenant les paramètres à afficher/modifier
  resultsTitle = 'Résultats calculés', // Titre de la section des résultats
  resultsElements,         // Éléments à afficher dans le tableau de résultats
  onParameterChange,       // Fonction appelée lors du changement d'un paramètre
  isNegative = (val) => val < 0, // Fonction pour vérifier si une valeur est négative
  selectOptions = {},      // Options pour les menus déroulants
}) => {
  // Gestion du changement de paramètre numérique
  const handleParameterChange = (key, value) => {
    const newValue = Number(value);
    if (!isNegative(newValue) && onParameterChange) {
      onParameterChange(key, newValue);
    }
  };

  // Gestion du changement de paramètre de type select
  const handleSelectChange = (key, value) => {
    if (onParameterChange) {
      onParameterChange(key, value);
    }
  };

  // Fonction pour déterminer si un paramètre est un menu déroulant
  const isSelectParameter = (key, value) => {
    // Vérifie si le paramètre est défini comme un objet avec type 'select'
    if (value && typeof value === 'object' && value.type === 'select') {
      return true;
    }
    // Vérifie si le paramètre a des options définies dans selectOptions
    return selectOptions && selectOptions[key] !== undefined;
  };

  // Fonction pour obtenir les options d'un menu déroulant
  const getSelectOptions = (key, value) => {
    if (value && typeof value === 'object' && value.type === 'select' && Array.isArray(value.options)) {
      return value.options;
    }
    return selectOptions[key] || [];
  };

  // Fonction pour obtenir la valeur actuelle d'un paramètre
  const getParameterValue = (key, value) => {
    if (value && typeof value === 'object' && value.value !== undefined) {
      return value.value;
    }
    return value;
  };

  return (
    <div className="cadre_double" style={{ marginTop: '0px' }}>
      <div 
        className="cadre_content" 
        style={{
          width: '100%', 
          display: 'flex', 
          flexDirection: direction, 
          alignItems: 'center'
        }}
      >
        {/* Image section */}
        <div className="image_section" style={{ 
          width: direction === 'row' ? '40%' : '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: direction === 'column' ? '0px' : '0'
        }}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="cadre_style_image"
            style={{ width: imageWidth, marginBottom: '0px' }}
          />
        </div>

        {/* Parameters section */}
        <div className="parameters_section" style={{ 
          width: direction === 'row' ? '60%' : '100%' 
        }}>
          <div className="cadre_style_parametres">
            < h4 >{title}</h4>

            {/* Inputs (numerical or select) */}
            {Object.entries(parametersObject).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '0px' }}>
                <label style={{ flex: 1, marginRight: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                  {key}:
                </label>
                
                {isSelectParameter(key, value) ? (
                  // Menu déroulant
                  <select
                    name={key}
                    value={getParameterValue(key, value)}
                    onChange={(e) => handleSelectChange(key, e.target.value)}
                    style={{ flex: '0 0 100px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    {getSelectOptions(key, value).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  // Input numérique
                  <input
                    type="number"
                    name={key}
                    value={getParameterValue(key, value)}
                    step="any"
                    onChange={(e) => handleParameterChange(key, e.target.value)}
                    style={{ flex: '0 0 100px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                )}
              </div>
            ))}

            {/* Results section */}
            {resultsElements && (
              <>
                < h5 >{resultsTitle}</h5>
                <TableGeneric elements={resultsElements} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayDesignComponent;
