import { hebrew } from '../i18n/hebrew';

interface HomePriceInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function HomePriceInput({ value, onChange }: HomePriceInputProps) {
  return (
    <div className="card">
      <h2 className="section-title">{hebrew.homePrice}</h2>
      <div>
        <label className="label">{hebrew.homePrice}</label>
        <input
          type="number"
          className="input-field"
          placeholder={hebrew.homePricePlaceholder}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min="0"
          step="1000"
        />
      </div>
    </div>
  );
}



