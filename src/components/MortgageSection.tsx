import { useState } from 'react';
import { hebrew } from '../i18n/hebrew';
import type { Salary, Loan, Saving, BuyingTaxConfig } from '../types/mortgage';

interface MortgageSectionProps {
  spouse1Salaries: Salary[];
  spouse2Salaries: Salary[];
  loans: Loan[];
  savings: Saving[];
  homePrice: number;
  buyingTaxConfig: BuyingTaxConfig;
  mortgageDurationYears: number;
  averageYearlyRate: number;
}

export function MortgageSection({
  spouse1Salaries,
  spouse2Salaries,
  loans,
  savings,
  homePrice,
  buyingTaxConfig,
  mortgageDurationYears,
  averageYearlyRate,
}: MortgageSectionProps) {
  const [returnPowerPercentage, setReturnPowerPercentage] = useState<number>(() => {
    const saved = localStorage.getItem('return-power-percentage');
    if (saved) {
      const value = Number(saved);
      // Migrate old 33 value to 1/3
      if (value === 33) {
        localStorage.setItem('return-power-percentage', (1/3).toString());
        return 1/3;
      }
      return value;
    }
    return 1/3;
  });

  // Calculate total average income
  const calculateTotalAverageIncome = (): number => {
    const calculateAverage = (salaries: Salary[]): number => {
      const validSalaries = salaries.filter(s => s && s.amount > 0);
      if (validSalaries.length === 0) return 0;
      const sum = validSalaries.reduce((total, s) => total + s.amount, 0);
      return sum / validSalaries.length;
    };

    const spouse1Average = calculateAverage(spouse1Salaries);
    const spouse2Average = calculateAverage(spouse2Salaries);
    return spouse1Average + spouse2Average;
  };

  // Calculate total loan monthly payments for loans 18+ months
  const calculateLongTermLoanPayments = (): number => {
    const longTermLoans = loans.filter(loan => loan.durationMonths >= 18);
    return longTermLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  };

  // Calculate net savings (open savings after tax)
  const calculateNetSavings = (): number => {
    const openSavings = savings.filter(s => s.state === 'open');
    const totalOpenAmount = openSavings.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTax = openSavings.reduce((sum, s) => {
      if (s.taxable) {
        const taxPercentage = s.taxPercentage !== undefined ? s.taxPercentage : 25;
        return sum + (s.totalRevenue * taxPercentage) / 100;
      }
      return sum;
    }, 0);
    return totalOpenAmount - totalTax;
  };

  // Calculate total loans available as buying power
  const calculateAvailableLoansAmount = (): number => {
    const availableLoans = loans.filter(loan => loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false);
    return availableLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  };

  // Calculate return power
  const calculateReturnPower = (): number => {
    const totalAverageIncome = calculateTotalAverageIncome();
    const longTermPayments = calculateLongTermLoanPayments();
    const availableIncome = totalAverageIncome - longTermPayments;
    return availableIncome * returnPowerPercentage;
  };

  // Calculate max mortgage based on return power
  const calculateMaxMortgageFromReturnPower = (): number => {
    const returnPower = calculateReturnPower();
    if (returnPower <= 0 || mortgageDurationYears <= 0 || averageYearlyRate <= 0) return 0;
    
    // Using annuity formula: PV = PMT * [(1 - (1 + r)^-n) / r]
    // where PMT = returnPower (monthly), r = monthly rate, n = number of months
    const monthlyRate = averageYearlyRate / 100 / 12;
    const numberOfMonths = mortgageDurationYears * 12;
    
    if (monthlyRate === 0) {
      return returnPower * numberOfMonths;
    }
    
    const presentValue = returnPower * ((1 - Math.pow(1 + monthlyRate, -numberOfMonths)) / monthlyRate);
    return presentValue;
  };

  // Calculate max mortgage based on savings + loans (4 times the sum)
  const calculateMaxMortgageFromSavingsAndLoans = (): number => {
    const netSavings = calculateNetSavings();
    const availableLoans = calculateAvailableLoansAmount();
    return (netSavings + availableLoans) * 4;
  };

  // Calculate max mortgage based on home price
  const calculateMaxMortgageFromHomePrice = (): number => {
    if (homePrice <= 0) return 0;
    
    // For first home: typically up to 75% of home price
    // For another home: typically up to 50% of home price
    const maxPercentage = buyingTaxConfig.isFirstHome ? 75 : 50;
    return (homePrice * maxPercentage) / 100;
  };

  const totalAverageIncome = calculateTotalAverageIncome();
  const longTermPayments = calculateLongTermLoanPayments();
  const returnPower = calculateReturnPower();
  const maxMortgageFromReturnPower = calculateMaxMortgageFromReturnPower();
  const maxMortgageFromSavingsAndLoans = calculateMaxMortgageFromSavingsAndLoans();
  const maxMortgageFromHomePrice = calculateMaxMortgageFromHomePrice();

  // Calculate recommended mortgage (minimum of the three)
  const calculateRecommendedMortgage = (): number => {
    const values = [
      maxMortgageFromReturnPower,
      maxMortgageFromSavingsAndLoans,
      maxMortgageFromHomePrice,
    ].filter(v => v > 0); // Only consider positive values
    return values.length > 0 ? Math.min(...values) : 0;
  };

  const recommendedMortgage = calculateRecommendedMortgage();

  // Save return power percentage to localStorage
  const handleReturnPowerChange = (value: number) => {
    setReturnPowerPercentage(value);
    localStorage.setItem('return-power-percentage', value.toString());
  };

  return (
    <div className="card">
      <h2 className="section-title">{hebrew.mortgageSection}</h2>

      {/* Return Power Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">{hebrew.returnPower}</h3>
        <div className="mb-3">
          <label className="label">{hebrew.returnPowerPercentage}</label>
          <select
            className="input-field"
            value={returnPowerPercentage === 1/3 ? '1/3' : '0.4'}
            onChange={(e) => handleReturnPowerChange(e.target.value === '1/3' ? 1/3 : 0.4)}
          >
            <option value="1/3">1/3 (33.33%)</option>
            <option value="0.4">40%</option>
          </select>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{hebrew.totalAverageIncome}:</span>
            <span className="font-semibold">{totalAverageIncome.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{hebrew.longTermLoanPayments}:</span>
            <span className="font-semibold text-red-600">-{longTermPayments.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300">
            <span className="font-bold text-blue-900">{hebrew.returnPower}:</span>
            <span className="font-bold text-blue-900 text-lg">{returnPower.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
        </div>
      </div>

      {/* Max Mortgage from Return Power */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">{hebrew.maxMortgageFromReturnPower}</h3>
        <div className="text-2xl font-bold text-blue-900">
          {maxMortgageFromReturnPower.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
        </div>
      </div>

      {/* Max Mortgage from Savings and Loans */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">{hebrew.maxMortgageFromSavingsAndLoans}</h3>
        <div className="space-y-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-gray-700">{hebrew.netSavings}:</span>
            <span className="font-semibold">{calculateNetSavings().toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">{hebrew.availableLoansAmount}:</span>
            <span className="font-semibold">{calculateAvailableLoansAmount().toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-900 pt-2 border-t border-blue-200">
          {maxMortgageFromSavingsAndLoans.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
        </div>
      </div>

      {/* Max Mortgage from Home Price */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">{hebrew.maxMortgageFromHomePrice}</h3>
        <div className="text-sm mb-3 text-gray-700">
          {buyingTaxConfig.isFirstHome ? hebrew.isFirstHome : hebrew.anotherHome} ({buyingTaxConfig.isFirstHome ? '75%' : '50%'} {hebrew.ofHomePrice})
        </div>
        <div className="text-2xl font-bold text-blue-900">
          {maxMortgageFromHomePrice.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
        </div>
      </div>

      {/* Recommended Mortgage (Minimum of the three) */}
      {recommendedMortgage > 0 && (
        <div className="mb-6 p-6 bg-green-50 rounded-lg border-4 border-green-400">
          <h3 className="text-xl font-bold mb-3 text-green-900">{hebrew.recommendedMortgage}</h3>
          <div className="text-sm mb-3 text-gray-700">
            {hebrew.recommendedMortgage} ({hebrew.minimumOfThree})
          </div>
          <div className="text-3xl font-bold text-green-900">
            {recommendedMortgage.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
          </div>
        </div>
      )}
    </div>
  );
}

