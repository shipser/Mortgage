import { useState, useEffect } from 'react';
import { hebrew } from '../i18n/hebrew';
import type { BuyingTaxConfig, TaxLevel } from '../types/mortgage';

interface TaxLevelsInputProps {
  config: BuyingTaxConfig;
  onChange: (config: BuyingTaxConfig) => void;
  homePrice: number;
}

// Default tax levels for first home
const DEFAULT_FIRST_HOME_TAX_LEVELS: TaxLevel[] = [
  { maxTaxableAmount: 1978745, taxPercentage: 0 },
  { maxTaxableAmount: 2347040, taxPercentage: 3.5 },
  { maxTaxableAmount: 6055070, taxPercentage: 5 },
  { maxTaxableAmount: 20183565, taxPercentage: 8 },
  { maxTaxableAmount: 999999999, taxPercentage: 10 }, // Represents "and above"
];

// Default tax levels for another home
const DEFAULT_ANOTHER_HOME_TAX_LEVELS: TaxLevel[] = [
  { maxTaxableAmount: 6055070, taxPercentage: 8 },
  { maxTaxableAmount: 999999999, taxPercentage: 10 }, // Represents "and above"
];

export function TaxLevelsInput({ config, onChange, homePrice }: TaxLevelsInputProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TaxLevel | null>(null);

  // Load default tax levels when switching home type and tax levels are empty
  useEffect(() => {
    if (config.taxLevels.length === 0) {
      const defaultLevels = config.isFirstHome 
        ? DEFAULT_FIRST_HOME_TAX_LEVELS 
        : DEFAULT_ANOTHER_HOME_TAX_LEVELS;
      onChange({
        ...config,
        taxLevels: defaultLevels,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.isFirstHome]);

  const handleLoadDefaults = () => {
    const defaultLevels = config.isFirstHome 
      ? DEFAULT_FIRST_HOME_TAX_LEVELS 
      : DEFAULT_ANOTHER_HOME_TAX_LEVELS;
    onChange({
      ...config,
      taxLevels: defaultLevels,
    });
  };

  const handleAddLevel = () => {
    if (config.taxLevels.length >= 6) {
      alert('ניתן להוסיף עד 6 רמות מס בלבד');
      return;
    }

    const lastLevel = config.taxLevels[config.taxLevels.length - 1];
    const newLevel: TaxLevel = {
      maxTaxableAmount: lastLevel ? lastLevel.maxTaxableAmount + 100000 : 100000,
      taxPercentage: 0,
    };
    setEditForm(newLevel);
    setEditingIndex(config.taxLevels.length);
  };

  const handleEdit = (index: number) => {
    setEditForm({ ...config.taxLevels[index] });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingIndex === null || !editForm) return;

    // Validate: maxTaxableAmount must be greater than previous level's max
    if (editingIndex > 0) {
      const prevLevel = config.taxLevels[editingIndex - 1];
      if (editForm.maxTaxableAmount <= prevLevel.maxTaxableAmount) {
        alert(`סכום מקסימלי חייב להיות גדול מ-${prevLevel.maxTaxableAmount.toLocaleString('he-IL')} ₪`);
        return;
      }
    }

    // Validate: maxTaxableAmount must be less than next level's max (if exists)
    if (editingIndex < config.taxLevels.length - 1) {
      const nextLevel = config.taxLevels[editingIndex + 1];
      if (editForm.maxTaxableAmount >= nextLevel.maxTaxableAmount) {
        alert(`סכום מקסימלי חייב להיות קטן מ-${nextLevel.maxTaxableAmount.toLocaleString('he-IL')} ₪`);
        return;
      }
    }

    const newLevels = [...config.taxLevels];
    if (editingIndex >= newLevels.length) {
      newLevels.push(editForm);
    } else {
      newLevels[editingIndex] = editForm;
    }

    // Sort levels by maxTaxableAmount to maintain order
    newLevels.sort((a, b) => a.maxTaxableAmount - b.maxTaxableAmount);

    onChange({
      ...config,
      taxLevels: newLevels,
    });
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleRemove = (index: number) => {
    const newLevels = config.taxLevels.filter((_, i) => i !== index);
    onChange({
      ...config,
      taxLevels: newLevels,
    });
  };

  const getMinAmount = (index: number): number => {
    if (index === 0) return 0;
    return config.taxLevels[index - 1]?.maxTaxableAmount || 0;
  };

  // Calculate tax for a specific level based on home price
  const calculateTaxForLevel = (level: TaxLevel, index: number): number => {
    const minAmount = getMinAmount(index);
    const maxAmount = level.maxTaxableAmount >= 999999999 ? homePrice : level.maxTaxableAmount;
    
    // Calculate the taxable amount in this bracket
    const bracketMin = Math.max(minAmount, 0);
    const bracketMax = Math.min(maxAmount, homePrice);
    const taxableAmount = Math.max(0, bracketMax - bracketMin);
    
    // Calculate tax for this bracket
    return (taxableAmount * level.taxPercentage) / 100;
  };

  // Calculate total tax
  const calculateTotalTax = (): number => {
    return config.taxLevels.reduce((total, level, index) => {
      return total + calculateTaxForLevel(level, index);
    }, 0);
  };

  return (
    <div className="card">
      <h2 className="section-title">{hebrew.buyingTax}</h2>

      <div className="mb-6">
        <label className="label">{hebrew.homeType}</label>
        <select
          className="input-field"
          value={config.isFirstHome ? 'first' : 'another'}
          onChange={(e) => {
            const isFirstHome = e.target.value === 'first';
            const defaultLevels = isFirstHome 
              ? DEFAULT_FIRST_HOME_TAX_LEVELS 
              : DEFAULT_ANOTHER_HOME_TAX_LEVELS;
            // Always load defaults when switching home type
            onChange({
              ...config,
              isFirstHome,
              taxLevels: defaultLevels,
            });
          }}
        >
          <option value="first">{hebrew.isFirstHome}</option>
          <option value="another">{hebrew.anotherHome}</option>
        </select>
        <button
          type="button"
          onClick={handleLoadDefaults}
          className="mt-2 btn-secondary text-sm"
        >
          טען רמות מס ברירת מחדל
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{hebrew.taxLevels}</h3>
        {editingIndex === null && config.taxLevels.length < 6 && (
          <button onClick={handleAddLevel} className="btn-primary">
            {hebrew.addTaxLevel}
          </button>
        )}
      </div>

      {editingIndex !== null && editForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
          <h3 className="font-semibold mb-3">
            {editingIndex >= config.taxLevels.length
              ? hebrew.addTaxLevel
              : `${hebrew.edit} ${hebrew.level} ${editingIndex + 1}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                {hebrew.maxTaxableAmount} (מינימום:{' '}
                {getMinAmount(editingIndex).toLocaleString('he-IL')} ₪)
              </label>
              <input
                type="number"
                className="input-field"
                value={editForm.maxTaxableAmount || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    maxTaxableAmount: Number(e.target.value) || 0,
                  })
                }
                min={getMinAmount(editingIndex)}
                step="1000"
              />
            </div>
            <div>
              <label className="label">{hebrew.taxPercentage} (%)</label>
              <input
                type="number"
                className="input-field"
                value={editForm.taxPercentage || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    taxPercentage: Number(e.target.value) || 0,
                  })
                }
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">
              {hebrew.save}
            </button>
            <button onClick={handleCancel} className="btn-secondary">
              {hebrew.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {config.taxLevels.map((level, index) => (
          <div
            key={index}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
          >
            <div className="flex-1">
              <div className="font-semibold">
                {hebrew.level} {index + 1}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {index === 0 ? (
                  <>
                    0 - {level.maxTaxableAmount >= 999999999 ? 'ומעלה' : level.maxTaxableAmount.toLocaleString('he-IL') + ' ₪'}: {level.taxPercentage}%
                  </>
                ) : (
                  <>
                    {config.taxLevels[index - 1].maxTaxableAmount.toLocaleString('he-IL')} ₪ -{' '}
                    {level.maxTaxableAmount >= 999999999 ? 'ומעלה' : level.maxTaxableAmount.toLocaleString('he-IL') + ' ₪'}: {level.taxPercentage}%
                  </>
                )}
                {index === config.taxLevels.length - 1 && level.maxTaxableAmount < 999999999 && (
                  <span className="text-gray-500"> (ומעלה)</span>
                )}
              </div>
              {homePrice > 0 && (
                <div className="text-sm font-semibold text-blue-600 mt-2">
                  {hebrew.taxAmount}: {calculateTaxForLevel(level, index).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(index)} className="btn-secondary text-sm">
                {hebrew.edit}
              </button>
              <button onClick={() => handleRemove(index)} className="btn-danger">
                {hebrew.removeTaxLevel}
              </button>
            </div>
          </div>
        ))}
        {config.taxLevels.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            אין רמות מס. לחץ על "הוסף רמת מס" כדי להתחיל.
          </p>
        )}
      </div>

      {homePrice > 0 && config.taxLevels.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-900">{hebrew.totalTax}:</span>
            <span className="text-xl font-bold text-blue-900">
              {calculateTotalTax().toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


