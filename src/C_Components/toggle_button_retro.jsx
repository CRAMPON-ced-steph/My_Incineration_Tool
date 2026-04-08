
const ToggleButton = ({ isToggled, setIsToggled, onText = 'ON', offText = 'OFF' }) => {
  return (
    <button 
      onClick={() => setIsToggled(!isToggled)}
      style={{
        background: isToggled ? '#4CAF50' : '#808080',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }}
    >
      {isToggled ? onText : offText}
    </button>
  );
};

export default ToggleButton;