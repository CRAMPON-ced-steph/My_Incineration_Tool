// ExportUtils.js
// PACKAGE A INSTALLER : npm install html2canvas jspdf


import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportAllTabs = async (tabSelector = '.tab-content') => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const tabs = document.querySelectorAll(tabSelector);

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const canvas = await html2canvas(tab);
    const imgData = canvas.toDataURL('image/png');

    // Calculer les dimensions pour ajuster à la page A4
    const imgWidth = 210; // Largeur A4 en mm
    const pageHeight = 295; // Hauteur A4 en mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    if (i < tabs.length - 1) {
      pdf.addPage();
    }
  }

  pdf.save('all_tabs.pdf');
};
