import { useState } from 'react';
import { hebrew } from '../i18n/hebrew';
import type { Saving, SavingState } from '../types/mortgage';

interface SavingsListProps {
  savings: Saving[];
  onChange: (savings: Saving[]) => void;
}

export function SavingsList({ savings, onChange }: SavingsListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Saving | null>(null);

  const handleAdd = () => {
    const newSaving: Saving = {
      name: '',
      totalAmount: 0,
      totalRevenue: 0,
      state: 'open',
      taxable: true,
      taxPercentage: 25,
    };
    setEditForm(newSaving);
    setEditingIndex(savings.length);
  };

  const handleEdit = (index: number) => {
    const saving = savings[index];
    // Ensure taxable and taxPercentage fields exist (defaults for existing data)
    setEditForm({ 
      ...saving, 
      taxable: saving.taxable !== undefined ? saving.taxable : true,
      taxPercentage: saving.taxPercentage !== undefined ? saving.taxPercentage : 25,
    });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingIndex === null || !editForm) return;

    const newSavings = [...savings];
    if (editingIndex >= newSavings.length) {
      newSavings.push(editForm);
    } else {
      newSavings[editingIndex] = editForm;
    }
    onChange(newSavings);
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleRemove = (index: number) => {
    const newSavings = savings.filter((_, i) => i !== index);
    onChange(newSavings);
  };

  // Calculate tax for a saving (using taxPercentage if taxable)
  const calculateSavingTax = (saving: Saving): number => {
    if (!saving.taxable || saving.state === 'closed') return 0;
    const taxPercentage = saving.taxPercentage !== undefined ? saving.taxPercentage : 25;
    return (saving.totalRevenue * taxPercentage) / 100;
  };

  // Calculate totals for open savings
  const calculateOpenSavingsTotals = () => {
    const openSavings = savings.filter(s => s.state === 'open');
    const totalOpenAmount = openSavings.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTax = openSavings.reduce((sum, s) => sum + calculateSavingTax(s), 0);
    const netAmount = totalOpenAmount - totalTax;
    
    return {
      totalOpenAmount,
      totalTax,
      netAmount,
      hasOpenSavings: openSavings.length > 0
    };
  };

  const totals = calculateOpenSavingsTotals();

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title mb-0">{hebrew.savings}</h2>
        {editingIndex === null && (
          <button onClick={handleAdd} className="btn-primary">
            {hebrew.addSaving}
          </button>
        )}
      </div>

      {editingIndex !== null && editForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
          <h3 className="font-semibold mb-3">
            {editingIndex >= savings.length ? hebrew.addSaving : hebrew.edit}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{hebrew.savingName}</label>
              <input
                type="text"
                className="input-field"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{hebrew.totalAmount}</label>
              <input
                type="number"
                className="input-field"
                value={editForm.totalAmount || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, totalAmount: Number(e.target.value) || 0 })
                }
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="label">{hebrew.totalRevenue}</label>
              <input
                type="number"
                className="input-field"
                value={editForm.totalRevenue || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, totalRevenue: Number(e.target.value) || 0 })
                }
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="label">{hebrew.state}</label>
              <select
                className="input-field"
                value={editForm.state}
                onChange={(e) =>
                  setEditForm({ ...editForm, state: e.target.value as SavingState })
                }
              >
                <option value="open">{hebrew.open}</option>
                <option value="closed">{hebrew.closed}</option>
              </select>
            </div>
            <div>
              <label className="label">{hebrew.taxable}</label>
              <select
                className="input-field"
                value={editForm.taxable !== undefined ? (editForm.taxable ? 'yes' : 'no') : 'yes'}
                onChange={(e) => {
                  const isTaxable = e.target.value === 'yes';
                  setEditForm({ 
                    ...editForm, 
                    taxable: isTaxable,
                    // Set default taxPercentage to 25% when changing to taxable if not already set
                    taxPercentage: isTaxable && (editForm.taxPercentage === undefined || editForm.taxPercentage === null) 
                      ? 25 
                      : editForm.taxPercentage
                  });
                }}
              >
                <option value="yes">{hebrew.taxable}</option>
                <option value="no">{hebrew.notTaxable}</option>
              </select>
            </div>
            {editForm.taxable && (
              <div>
                <label className="label">{hebrew.taxPercentage}</label>
                <input
                  type="number"
                  className="input-field"
                  value={editForm.taxPercentage !== undefined ? editForm.taxPercentage : 25}
                  onChange={(e) =>
                    setEditForm({ ...editForm, taxPercentage: Number(e.target.value) || 25 })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            )}
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
        {savings.map((saving, index) => (
          <div
            key={index}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
          >
            <div className="flex-1">
              <div className="font-semibold">{saving.name || `חסכון ${index + 1}`}</div>
              <div className="text-sm text-gray-600 mt-1">
                {hebrew.totalAmount}: {saving.totalAmount.toLocaleString('he-IL')} ₪ |{' '}
                {hebrew.totalRevenue}: {saving.totalRevenue.toLocaleString('he-IL')} ₪ |{' '}
                {hebrew.state}: {saving.state === 'open' ? hebrew.open : hebrew.closed} |{' '}
                {hebrew.taxable}: {(saving.taxable !== undefined ? saving.taxable : true) ? hebrew.taxable : hebrew.notTaxable}
                {(saving.taxable !== undefined ? saving.taxable : true) && (
                  <> | {hebrew.taxPercentage}: {(saving.taxPercentage !== undefined ? saving.taxPercentage : 25)}%</>
                )}
              </div>
              {(saving.taxable !== undefined ? saving.taxable : true) && saving.totalRevenue > 0 && saving.state === 'open' && (
                <div className="text-sm font-semibold text-blue-600 mt-2">
                  {hebrew.savingTax}: {calculateSavingTax(saving).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(index)} className="btn-secondary text-sm">
                {hebrew.edit}
              </button>
              <button onClick={() => handleRemove(index)} className="btn-danger">
                {hebrew.removeSaving}
              </button>
            </div>
          </div>
        ))}
        {savings.length === 0 && (
          <p className="text-gray-500 text-center py-4">אין חסכונות. לחץ על "הוסף חסכון" כדי להתחיל.</p>
        )}
      </div>

      {totals.hasOpenSavings && (
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">{hebrew.totalOpenSavings}:</span>
              <span className="text-sm font-semibold text-gray-700">
                {totals.totalOpenAmount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">{hebrew.totalSavingsTax}:</span>
              <span className="text-sm font-semibold text-red-600">
                -{totals.totalTax.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-blue-900">{hebrew.netSavings}:</span>
              <span className="text-xl font-bold text-blue-900">
                {totals.netAmount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


