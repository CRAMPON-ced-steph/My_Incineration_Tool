// screenshotUtils.js

/**
 * Fonction utilitaire pour télécharger une image
 * @param {string} dataUrl - URL de données de l'image
 * @param {string} filename - Nom du fichier (optionnel)
 */
 const downloadImage = (dataUrl, filename = 'screenshot.png') => {
  const a = document.createElement('a');
  a.setAttribute('download', filename);
  a.setAttribute('href', dataUrl);
  a.click();
};

/**
 * Génère un timestamp formaté pour les noms de fichiers
 * @returns {string} Timestamp au format YYYY-MM-DD_HH-MM
 */
const generateTimestamp = () => {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Capture une capture d'écran de la page courante
 * @param {Object} options - Options de configuration
 * @param {HTMLElement} options.targetElement - Élément à capturer (défaut: document.body)
 * @param {string} options.filename - Nom du fichier (défaut: auto-généré avec timestamp)
 * @param {number} options.width - Largeur de capture (défaut: window.innerWidth)
 * @param {number} options.height - Hauteur de capture (défaut: window.innerHeight)
 * @param {string} options.backgroundColor - Couleur de fond (défaut: '#fff')
 * @param {Function} options.filter - Fonction de filtrage des nœuds (optionnel)
 */
export const captureScreenshot = async (options = {}) => {
  const {
    targetElement = document.body,
    filename = `screenshot_${generateTimestamp()}.png`,
    width = window.innerWidth,
    height = window.innerHeight,
    backgroundColor = '#fff',
    filter = null
  } = options;
  
  if (!targetElement) {
    console.error('Target element not found.');
    throw new Error('Target element not found.');
  }

  try {
    // Essayer d'abord avec html2canvas (méthode préférée)
    const screenshot = await captureWithHtml2Canvas({
      targetElement,
      width,
      height,
      backgroundColor,
      filter
    });
    
    downloadImage(screenshot, filename);
    console.log(`Screenshot downloaded as ${filename}`);
    return screenshot;
    
  } catch (html2canvasError) {
    console.warn('html2canvas failed, trying html-to-image:', html2canvasError);
    
    try {
      // Méthode de secours avec html-to-image
      const screenshot = await captureWithHtmlToImage({
        targetElement,
        width,
        height,
        backgroundColor,
        filter
      });
      
      downloadImage(screenshot, filename);
      console.log(`Screenshot downloaded as ${filename} (fallback method)`);
      return screenshot;
      
    } catch (fallbackError) {
      console.error('Both screenshot methods failed:', fallbackError);
      alert('Failed to capture screenshot. Please try again.');
      throw fallbackError;
    }
  }
};

/**
 * Capture avec html2canvas
 * @param {Object} config - Configuration de capture
 * @returns {Promise<string>} URL de données de l'image
 */
const captureWithHtml2Canvas = async (config) => {
  const { targetElement, width, height } = config;
  
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default;
  
  const canvas = await html2canvas(document.documentElement, {
    width: width,
    height: height,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    windowWidth: width,
    windowHeight: height,
    useCORS: true,
    allowTaint: true,
    logging: false,
    scale: window.devicePixelRatio,
  });
  
  return canvas.toDataURL('image/png');
};

/**
 * Capture avec html-to-image (méthode de secours)
 * @param {Object} config - Configuration de capture
 * @returns {Promise<string>} URL de données de l'image
 */
const captureWithHtmlToImage = async (config) => {
  const { targetElement, width, height, backgroundColor, filter } = config;
  
  const { toPng } = await import('html-to-image');
  
  const dataUrl = await toPng(targetElement, {
    backgroundColor: backgroundColor,
    width: width,
    height: height,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
    },
    filter: filter || ((node) => {
      // Filtre par défaut : ne pas inclure les éléments avec la classe 'download-btn'
      if (node?.classList?.contains('download-btn')) {
        return false;
      }
      return true;
    }),
    cacheBust: true,
    pixelRatio: window.devicePixelRatio,
    skipAutoScale: true,
  });
  
  return dataUrl;
};

/**
 * Fonction de convenance pour une capture d'écran simple
 * @param {string} filename - Nom du fichier (optionnel)
 */
export const takeScreenshot = (filename) => {
  return captureScreenshot({ filename });
};

/**
 * Fonction de convenance pour capturer un élément spécifique
 * @param {HTMLElement} element - Élément à capturer
 * @param {string} filename - Nom du fichier (optionnel)
 */
export const captureElement = (element, filename) => {
  return captureScreenshot({ 
    targetElement: element, 
    filename 
  });
};

/**
 * Fonction de convenance pour capturer la zone visible
 * @param {string} filename - Nom du fichier (optionnel)
 */
export const captureViewport = (filename) => {
  return captureScreenshot({
    targetElement: document.documentElement,
    filename
  });
};

// Export par défaut de la fonction principale
export default captureScreenshot;