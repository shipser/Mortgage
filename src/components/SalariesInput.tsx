import { hebrew } from '../i18n/hebrew';
import type { Salary } from '../types/mortgage';

interface SalariesInputProps {
  spouse1Salaries: Salary[];
  spouse2Salaries: Salary[];
  onSpouse1Change: (salaries: Salary[]) => void;
  onSpouse2Change: (salaries: Salary[]) => void;
}

export function SalariesInput({
  spouse1Salaries,
  spouse2Salaries,
  onSpouse1Change,
  onSpouse2Change,
}: SalariesInputProps) {
  const updateSalary = (
    salaries: Salary[],
    index: number,
    value: number,
    onChange: (salaries: Salary[]) => void
  ) => {
    const newSalaries = [...salaries];
    while (newSalaries.length <= index) {
      newSalaries.push({ amount: 0 });
    }
    newSalaries[index] = { amount: value };
    onChange(newSalaries);
  };

  // Calculate average salary for a spouse (only if all 3 salaries are filled and > 0)
  const calculateAverage = (salaries: Salary[]): number => {
    // Check if all 3 salaries exist and have values strictly greater than 0
    if (salaries.length < 3) return 0;
    
    const salary1 = salaries[0]?.amount || 0;
    const salary2 = salaries[1]?.amount || 0;
    const salary3 = salaries[2]?.amount || 0;
    
    // Only count if all three salaries are greater than 0
    if (salary1 <= 0 || salary2 <= 0 || salary3 <= 0) return 0;
    
    const sum = salary1 + salary2 + salary3;
    return sum / 3;
  };

  const spouse1Average = calculateAverage(spouse1Salaries);
  const spouse2Average = calculateAverage(spouse2Salaries);
  const totalAverage = spouse1Average + spouse2Average;

  return (
    <div className="card">
      <h2 className="section-title">{hebrew.salaries}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spouse 1 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{hebrew.spouse1}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{hebrew.lastThreeSalaries}</p>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-3">
              <label className="label">
                {hebrew.salary} {index + 1}
              </label>
              <input
                type="number"
                className="input-field"
                value={spouse1Salaries[index]?.amount || ''}
                onChange={(e) =>
                  updateSalary(
                    spouse1Salaries,
                    index,
                    Number(e.target.value) || 0,
                    onSpouse1Change
                  )
                }
                min="0"
                step="100"
              />
            </div>
          ))}
        </div>

        {/* Spouse 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{hebrew.spouse2}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{hebrew.lastThreeSalaries}</p>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-3">
              <label className="label">
                {hebrew.salary} {index + 1}
              </label>
              <input
                type="number"
                className="input-field"
                value={spouse2Salaries[index]?.amount || ''}
                onChange={(e) =>
                  updateSalary(
                    spouse2Salaries,
                    index,
                    Number(e.target.value) || 0,
                    onSpouse2Change
                  )
                }
                min="0"
                step="100"
              />
            </div>
          ))}
        </div>
      </div>
      {totalAverage > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-600">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-900 dark:text-blue-200">{hebrew.totalAverageSalaries}:</span>
            <span className="text-xl font-bold text-blue-900 dark:text-blue-200">
              {totalAverage.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


