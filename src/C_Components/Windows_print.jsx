const PrintButton = ({ onClick, text, style }) => {
  const defaultStyle = {
    width: '100%',
    padding: '12px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px',
    ...style
  };

  return (
    <button
      onClick={onClick}
      style={defaultStyle}
    >
      {text}
    </button>
  );
};

export default PrintButton;

