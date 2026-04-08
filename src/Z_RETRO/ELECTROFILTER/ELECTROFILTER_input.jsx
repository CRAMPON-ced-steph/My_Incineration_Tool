const ELECTROFILTERInput = ({ sliderValue, onSliderChange }) => {
  return (
    <div style={{ width: '400px', background: 'white', padding: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <h3>ELECTROFILTER Information</h3>
      
      <label>
        Select a number:
        <input
          type="range"
          min="1"
          max="20"
          value={sliderValue}
          onChange={onSliderChange}
        />
        {sliderValue}
      </label>
    </div>
  );
};

export default ELECTROFILTERInput;