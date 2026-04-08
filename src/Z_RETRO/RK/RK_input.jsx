// Définition du composant RKInput qui prend deux props : sliderValue et onSliderChange
const RKInput = ({ sliderValue, onSliderChange }) => {
  return (
    // Div principale avec des styles inline pour le conteneur
    <div style={{ width: '400px', background: 'white', padding: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      {/* Titre du composant */}
      <h3>RK Information</h3>
      
      {/* Label englobant l'input et l'affichage de la valeur */}
      <label>
        Select a number:
        {/* Input de type range (slider) */}
        <input
          type="range"  // Type d'input
          min="1"       // Valeur minimale du slider
          max="20"      // Valeur maximale du slider
          value={sliderValue}  // Valeur actuelle du slider (contrôlée par le state)
          onChange={onSliderChange}  // Fonction appelée lors du changement de valeur
        />
        {/* Affichage de la valeur actuelle du slider */}
        {sliderValue}
      </label>
    </div>
  )
}

// Export du composant pour pouvoir l'utiliser ailleurs


export default RKInput;