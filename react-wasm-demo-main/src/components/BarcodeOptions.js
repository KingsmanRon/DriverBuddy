import React from 'react';

const BarcodeOptions = ({ value, templateTitles, selections, setSelections }) => {
  return (
    <div className="radio_option">
      <input
        type="radio"
        id={value}
        name="radioGroup"
        value={value}
        checked={selections.template === value}
        onChange={(e) => setSelections({ template: e.target.value })}
      />
      <label htmlFor={value}>
        <span className="custom-radio"></span>
        <div className="desc">
          <span className="radio-label">{templateTitles[value]}</span>
          <span className="radio_description">{/* Add description based on value */}</span>
        </div>
        <div className="icon_container">
          <img alt={`${value} icon`} src={`./images/ico-${value}.svg`} />
        </div>
      </label>
    </div>
  );
};

export default BarcodeOptions;
