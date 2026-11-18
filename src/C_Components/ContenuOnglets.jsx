// Contenu des onglets d'un équipement (mode Bilan).
//
// Les calculs des onglets se font au rendu de leur composant (mutations de innerData, effets
// setInnerData) : un onglet jamais affiché ne calculait rien, et la sortie envoyée à l'aval
// dépendait des onglets visités. Ici, les onglets de calcul restent tous montés dès
// l'ouverture du nœud (masqués quand ils ne sont pas affichés), dans l'ordre de la barre
// d'onglets : chaque onglet lit ce qu'ont écrit les précédents, et « Retour au schéma »
// envoie un résultat complet sans avoir à ouvrir les onglets.
//
// Les onglets d'affichage seul (OPEX, rapport : `affichage: true`) ne sont montés que
// lorsqu'ils sont affichés (graphiques, calculs inutiles en arrière-plan).
//
// tabs : [{ name, content, affichage? }] ; actif : name de l'onglet affiché.
import React from 'react';

const ContenuOnglets = ({ tabs, actif }) => (
  <>
    {tabs.map((tab) => {
      const visible = tab.name === actif;
      if (tab.affichage && !visible) return null;
      return (
        <div key={tab.name} style={visible ? undefined : { display: 'none' }} aria-hidden={visible ? undefined : 'true'}>
          {tab.content}
        </div>
      );
    })}
  </>
);

export default ContenuOnglets;
