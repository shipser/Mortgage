import { useState, useEffect } from 'react';
import { hebrew } from '../i18n/hebrew';
import type { Expense } from '../types/mortgage';

interface ExpensesListProps {
  expenses: Expense[];
  onChange: (expenses: Expense[]) => void;
  homePrice: number;
}

// Default expenses list
const DEFAULT_EXPENSES: Expense[] = [
  { name: 'הובלה', amount: 8000 },
  { name: 'ריהוט', amount: 20000 },
  { name: 'מיזוג', amount: 20000 },
  { name: 'שיפוץ', amount: 50000 },
  { name: 'יועץ משכנתאות', amount: 8000 },
  { name: 'שמאי', amount: 4000 },
  { name: 'בדק בית', amount: 2000 },
  { name: 'מודד', amount: 7000 },
  { name: 'נוטריון', amount: 500 },
  { name: 'נסח', amount: 17 },
  { name: 'תיק בית משותף', amount: 38 },
  { name: 'רמ"י', amount: 83 },
  { name: 'רישום טאבו', amount: 43 },
  { name: 'רישום זכויות חברה משכנת', amount: 85 },
  { name: 'אגרת פתיחת תיק משכנתא', amount: 2500 },
  { name: 'העברת חשבונות', amount: 3000 },
  { name: 'אגרת רישום משכון', amount: 119 },
  { name: 'עמלת עריכת מסמכים', amount: 1000 },
];

export function ExpensesList({ expenses, onChange, homePrice }: ExpensesListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Expense | null>(null);
  
  // Load percentages from localStorage or use defaults
  const [lawyerPercentage, setLawyerPercentage] = useState<number>(() => {
    const saved = localStorage.getItem('lawyer-percentage');
    return saved ? Number(saved) : 0.5;
  });
  
  const [brokerPercentage, setBrokerPercentage] = useState<number>(() => {
    const saved = localStorage.getItem('broker-percentage');
    return saved ? Number(saved) : 2;
  });
  
  const taxRate = 18; // 18% tax

  // Save percentages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('lawyer-percentage', lawyerPercentage.toString());
  }, [lawyerPercentage]);

  useEffect(() => {
    localStorage.setItem('broker-percentage', brokerPercentage.toString());
  }, [brokerPercentage]);

  const handleAdd = () => {
    const newExpense: Expense = {
      name: '',
      amount: 0,
    };
    setEditForm(newExpense);
    setEditingIndex(expenses.length);
  };

  const handleEdit = (index: number) => {
    setEditForm({ ...expenses[index] });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (editingIndex === null || !editForm) return;

    const newExpenses = [...expenses];
    if (editingIndex >= newExpenses.length) {
      newExpenses.push(editForm);
    } else {
      newExpenses[editingIndex] = editForm;
    }
    onChange(newExpenses);
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleRemove = (index: number) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    onChange(newExpenses);
  };

  const handleLoadDefaults = () => {
    onChange(DEFAULT_EXPENSES);
  };

  // Calculate lawyer expense
  const calculateLawyerExpense = () => {
    if (homePrice <= 0) return { base: 0, tax: 0, total: 0 };
    const base = (homePrice * lawyerPercentage) / 100;
    const tax = (base * taxRate) / 100;
    return { base, tax, total: base + tax };
  };

  // Calculate broker expense
  const calculateBrokerExpense = () => {
    if (homePrice <= 0) return { base: 0, tax: 0, total: 0 };
    const base = (homePrice * brokerPercentage) / 100;
    const tax = (base * taxRate) / 100;
    return { base, tax, total: base + tax };
  };

  const lawyerExpense = calculateLawyerExpense();
  const brokerExpense = calculateBrokerExpense();

  // Calculate total expenses (including lawyer and broker)
  const regularExpensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = regularExpensesTotal + lawyerExpense.total + brokerExpense.total;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title mb-0">{hebrew.expenses}</h2>
        <div className="flex gap-2">
          {editingIndex === null && (
            <>
              <button onClick={handleLoadDefaults} className="btn-secondary">
                {hebrew.loadDefaultExpenses}
              </button>
              <button onClick={handleAdd} className="btn-primary">
                {hebrew.addExpense}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lawyer and Broker Expenses */}
      <div className="mb-6 space-y-4">
        {/* Lawyer */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{hebrew.lawyer}</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{hebrew.percentage}:</label>
              <input
                type="number"
                className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                value={lawyerPercentage}
                onChange={(e) => setLawyerPercentage(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          {homePrice > 0 && (
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <div>{hebrew.baseAmount}: {lawyerExpense.base.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</div>
              <div>{hebrew.tax} ({taxRate}%): {lawyerExpense.tax.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</div>
              <div className="font-semibold text-blue-600">{hebrew.totalWithTax}: {lawyerExpense.total.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</div>
            </div>
          )}
        </div>

        {/* Broker */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{hebrew.broker}</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{hebrew.percentage}:</label>
              <input
                type="number"
                className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                value={brokerPercentage}
                onChange={(e) => setBrokerPercentage(Number(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          {homePrice > 0 && (
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <div>{hebrew.baseAmount}: {brokerExpense.base.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</div>
              <div>{hebrew.tax} ({taxRate}%): {brokerExpense.tax.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</div>
              <div className="font-semibold text-blue-600">{hebrew.totalWithTax}: {brokerExpense.total.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</div>
            </div>
          )}
        </div>
      </div>

      {editingIndex !== null && editForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 border-2 border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold mb-3">
            {editingIndex >= expenses.length ? hebrew.addExpense : hebrew.edit}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{hebrew.expenseName}</label>
              <input
                type="text"
                className="input-field"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{hebrew.expenseAmount}</label>
              <input
                type="number"
                className="input-field"
                value={editForm.amount || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: Number(e.target.value) || 0 })
                }
                min="0"
                step="100"
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
        {expenses.map((expense, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center"
          >
            <div className="flex-1">
              <div className="font-semibold">{expense.name || `הוצאה ${index + 1}`}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {hebrew.expenseAmount}: {expense.amount.toLocaleString('he-IL')} ₪
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(index)} className="btn-secondary text-sm">
                {hebrew.edit}
              </button>
              <button onClick={() => handleRemove(index)} className="btn-danger">
                {hebrew.removeExpense}
              </button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">אין הוצאות. לחץ על "הוסף הוצאה" כדי להתחיל.</p>
        )}
      </div>

      {expenses.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-600">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-900 dark:text-blue-200">{hebrew.totalExpenses}:</span>
            <span className="text-xl font-bold text-blue-900 dark:text-blue-200">
              {totalExpenses.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


