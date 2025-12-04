import { useState } from 'react';
import { hebrew } from '../i18n/hebrew';
import type { Loan } from '../types/mortgage';

interface LoansListProps {
  loans: Loan[];
  onChange: (loans: Loan[]) => void;
}

export function LoansList({ loans, onChange }: LoansListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Loan | null>(null);

  const handleAdd = () => {
    const newLoan: Loan = {
      name: '',
      loanAmount: 0,
      durationMonths: 0,
      monthlyPayment: 0,
      availableAsBuyingPower: false,
    };
    setEditForm(newLoan);
    setEditingIndex(loans.length);
  };

  const handleEdit = (index: number) => {
    const loan = loans[index];
    // Ensure availableAsBuyingPower field exists (default to false for existing data)
    setEditForm({ ...loan, availableAsBuyingPower: loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingIndex === null || !editForm) return;

    const newLoans = [...loans];
    if (editingIndex >= newLoans.length) {
      newLoans.push(editForm);
    } else {
      newLoans[editingIndex] = editForm;
    }
    onChange(newLoans);
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleRemove = (index: number) => {
    const newLoans = loans.filter((_, i) => i !== index);
    onChange(newLoans);
  };

  // Calculate totals
  const calculateTotals = () => {
    // Only count loans available as buying power for total loan amount
    const availableLoans = loans.filter(loan => loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false);
    const totalLoanAmount = availableLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    const longTermLoans = loans.filter(loan => loan.durationMonths >= 18);
    const totalLongTermPayments = longTermLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    
    return {
      totalLoanAmount,
      totalMonthlyPayments,
      totalLongTermPayments,
      hasLoans: loans.length > 0
    };
  };

  const totals = calculateTotals();

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title mb-0">{hebrew.loans}</h2>
        {editingIndex === null && (
          <button onClick={handleAdd} className="btn-primary">
            {hebrew.addLoan}
          </button>
        )}
      </div>

      {editingIndex !== null && editForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
          <h3 className="font-semibold mb-3">
            {editingIndex >= loans.length ? hebrew.addLoan : hebrew.edit}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{hebrew.loanName}</label>
              <input
                type="text"
                className="input-field"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{hebrew.loanAmount}</label>
              <input
                type="number"
                className="input-field"
                value={editForm.loanAmount || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, loanAmount: Number(e.target.value) || 0 })
                }
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="label">{hebrew.durationMonths}</label>
              <input
                type="number"
                className="input-field"
                value={editForm.durationMonths || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, durationMonths: Number(e.target.value) || 0 })
                }
                min="1"
                step="1"
              />
            </div>
            <div>
              <label className="label">{hebrew.monthlyPayment}</label>
              <input
                type="number"
                className="input-field"
                value={editForm.monthlyPayment || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, monthlyPayment: Number(e.target.value) || 0 })
                }
                min="0"
                step="10"
              />
            </div>
            <div>
              <label className="label">{hebrew.availableAsBuyingPower}</label>
              <select
                className="input-field"
                value={editForm.availableAsBuyingPower !== undefined ? (editForm.availableAsBuyingPower ? 'yes' : 'no') : 'no'}
                onChange={(e) =>
                  setEditForm({ ...editForm, availableAsBuyingPower: e.target.value === 'yes' })
                }
              >
                <option value="yes">{hebrew.availableAsBuyingPower}</option>
                <option value="no">{hebrew.notAvailableAsBuyingPower}</option>
              </select>
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
        {loans.map((loan, index) => (
          <div
            key={index}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
          >
            <div className="flex-1">
              <div className="font-semibold">{loan.name || `הלוואה ${index + 1}`}</div>
              <div className="text-sm text-gray-600 mt-1">
                {hebrew.loanAmount}: {loan.loanAmount.toLocaleString('he-IL')} ₪ |{' '}
                {hebrew.durationMonths}: {loan.durationMonths} |{' '}
                {hebrew.monthlyPayment}: {loan.monthlyPayment.toLocaleString('he-IL')} ₪ |{' '}
                {hebrew.availableAsBuyingPower}: {(loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false) ? hebrew.availableAsBuyingPower : hebrew.notAvailableAsBuyingPower}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(index)} className="btn-secondary text-sm">
                {hebrew.edit}
              </button>
              <button onClick={() => handleRemove(index)} className="btn-danger">
                {hebrew.removeLoan}
              </button>
            </div>
          </div>
        ))}
        {loans.length === 0 && (
          <p className="text-gray-500 text-center py-4">אין הלוואות. לחץ על "הוסף הלוואה" כדי להתחיל.</p>
        )}
      </div>

      {totals.hasLoans && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-900">{hebrew.totalLoanAmount}:</span>
              <span className="text-sm font-semibold text-blue-900">
                {totals.totalLoanAmount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-900">{hebrew.totalMonthlyPayments}:</span>
              <span className="text-sm font-semibold text-blue-900">
                {totals.totalMonthlyPayments.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-blue-900">{hebrew.totalLongTermPayments}:</span>
              <span className="text-sm font-bold text-blue-900">
                {totals.totalLongTermPayments.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


