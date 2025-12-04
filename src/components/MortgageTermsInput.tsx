import { hebrew } from '../i18n/hebrew';

interface MortgageTermsInputProps {
  durationYears: number;
  averageYearlyRate: number;
  onDurationChange: (value: number) => void;
  onRateChange: (value: number) => void;
}

export function MortgageTermsInput({
  durationYears,
  averageYearlyRate,
  onDurationChange,
  onRateChange,
}: MortgageTermsInputProps) {
  return (
    <div className="card">
      <h2 className="section-title">{hebrew.mortgageTerms}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">{hebrew.mortgageDuration}</label>
          <input
            type="number"
            className="input-field"
            value={durationYears || ''}
            onChange={(e) => onDurationChange(Number(e.target.value) || 0)}
            min="1"
            step="1"
          />
        </div>
        <div>
          <label className="label">{hebrew.averageYearlyRate}</label>
          <input
            type="number"
            className="input-field"
            value={averageYearlyRate || ''}
            onChange={(e) => onRateChange(Number(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
}



