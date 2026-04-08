// ExportUtils.js
// PACKAGES À INSTALLER : npm install html2canvas jspdf

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportAllTabs = async (tabSelector = '.tab-content') => {
  const pdf = new jsPDF('p', 'mm', 'a4'); // Initialisation du PDF
  const tabs = document.querySelectorAll(tabSelector); // Sélection de tous les onglets

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];

    // Sauvegarder l'état de visibilité initial
    const originalDisplay = tab.style.display;

    // Forcer la visibilité de l'onglet pour la capture
    tab.style.display = 'block';
    tab.style.visibility = 'visible';

    // Défilement vers l'onglet pour s'assurer que tout le contenu est chargé
    tab.scrollIntoView();

    // Capturer le contenu de l'onglet sous forme de canvas
    const canvas = await html2canvas(tab, { scale: 2 }); // Meilleure résolution avec scale
    const imgData = canvas.toDataURL('image/png');

    // Calculer les dimensions pour ajuster à la page A4
    const imgWidth = 210; // Largeur A4 en mm
    const pageHeight = 295; // Hauteur A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight; // Hauteur totale de l'image
    let position = 0; // Position initiale de l'image

    // Ajouter l'image sur la première page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Ajouter des pages supplémentaires si le contenu dépasse une page
    while (heightLeft > 0) {
      position = position - pageHeight; // Mise à jour de la position pour la page suivante
      pdf.addPage(); // Ajouter une nouvelle page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Restaurer l'état initial de l'onglet
    tab.style.display = originalDisplay;

    // Si ce n'est pas le dernier onglet, ajouter une nouvelle page
    if (i < tabs.length - 1) {
      pdf.addPage();
    }
  }

  // Sauvegarder le PDF avec un nom de fichier
  pdf.save('all_tabs.pdf');
};

/*
export const printAllTabs = (tabSelector = '.tab-content') => {
  const tabs = document.querySelectorAll(tabSelector); // Sélection de tous les onglets
  const originalStyles = []; // Pour sauvegarder l'état d'origine

  // Rendre tous les onglets visibles
  tabs.forEach((tab, index) => {
    // Sauvegarder l'état d'origine
    originalStyles[index] = {
      display: tab.style.display,
      visibility: tab.style.visibility,
    };

    // Forcer la visibilité
    tab.style.display = 'block';
    tab.style.visibility = 'visible';
  });

  // Lancer l'impression avec window.print()
  window.print();

  // Restaurer l'état initial des onglets
  tabs.forEach((tab, index) => {
    tab.style.display = originalStyles[index].display;
    tab.style.visibility = originalStyles[index].visibility;
  });
};

*/

export const printAllTabs = (tabSelector = '.tab-content') => {
  const tabs = document.querySelectorAll(tabSelector); // Sélection de tous les onglets
  const originalStyles = []; // Pour sauvegarder les styles initiaux des onglets

  // Sauvegarder les styles initiaux et rendre tous les onglets visibles
  tabs.forEach((tab, index) => {
    originalStyles[index] = {
      display: tab.style.display || '', // Sauvegarder le style `display`
      visibility: tab.style.visibility || '', // Sauvegarder le style `visibility`
    };

    // Rendre l'onglet visible pour l'impression
    tab.style.display = 'block'; // Forcer `display` à block
    tab.style.visibility = 'visible'; // Forcer `visibility` à visible
  });

  // Utiliser un timeout pour s'assurer que les modifications prennent effet avant l'impression
  setTimeout(() => {
    window.print(); // Lancer la boîte de dialogue d'impression

    // Restaurer les styles initiaux après l'impression
    tabs.forEach((tab, index) => {
      tab.style.display = originalStyles[index].display; // Restaurer le style `display`
      tab.style.visibility = originalStyles[index].visibility; // Restaurer le style `visibility`
    });
  }, 300); // Délai pour garantir la mise à jour du DOM avant impression
};
