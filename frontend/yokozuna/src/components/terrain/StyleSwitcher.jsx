import React from 'react';

export const StyleSwitcher = ({
  styles = [],
  currentStyle = 'satellite',
  onStyleChange = () => {},
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3">Map Style</h3>
      <div className="space-y-2">
        {styles.map((style) => (
          <label key={style.id} className="flex items-center space-x-2">
            <input
              type="radio"
              name="mapStyle"
              value={style.id}
              checked={currentStyle === style.id}
              onChange={() => onStyleChange(style.id)}
              className="form-radio"
            />
            <span className="text-sm">{style.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StyleSwitcher; 