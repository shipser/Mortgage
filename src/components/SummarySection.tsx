import { hebrew } from '../i18n/hebrew';
import type { Loan, Saving, Expense, BuyingTaxConfig, Salary } from '../types/mortgage';

interface SummarySectionProps {
  homePrice: number;
  loans: Loan[];
  savings: Saving[];
  expenses: Expense[];
  buyingTaxConfig: BuyingTaxConfig;
  mortgageDurationYears: number;
  averageYearlyRate: number;
  spouse1Salaries: Salary[];
  spouse2Salaries: Salary[];
}

export function SummarySection({
  homePrice,
  loans,
  savings,
  expenses,
  buyingTaxConfig,
  mortgageDurationYears,
  averageYearlyRate,
  spouse1Salaries,
  spouse2Salaries,
}: SummarySectionProps) {
  // Get lawyer and broker percentages from localStorage
  const getLawyerPercentage = (): number => {
    const saved = localStorage.getItem('lawyer-percentage');
    return saved ? Number(saved) : 0.5;
  };
  
  const getBrokerPercentage = (): number => {
    const saved = localStorage.getItem('broker-percentage');
    return saved ? Number(saved) : 2;
  };

  const lawyerPercentage = getLawyerPercentage();
  const brokerPercentage = getBrokerPercentage();

  // Helper function to calculate average salary
  const calculateAverage = (salaries: Salary[]): number => {
    const validSalaries = salaries.filter(s => s && s.amount > 0);
    if (validSalaries.length === 0) return 0;
    const sum = validSalaries.reduce((total, s) => total + s.amount, 0);
    return sum / validSalaries.length;
  };

  // Calculate max mortgage from home price (shared function)
  const calculateMaxMortgageFromHomePrice = (): number => {
    if (homePrice <= 0) return 0;
    const maxPercentage = buyingTaxConfig.isFirstHome ? 75 : 50;
    return (homePrice * maxPercentage) / 100;
  };

  // Calculate recommended mortgage (same logic as MortgageSection)
  const calculateRecommendedMortgage = (): number => {
    const spouse1Average = calculateAverage(spouse1Salaries);
    const spouse2Average = calculateAverage(spouse2Salaries);
    const totalAverageIncome = spouse1Average + spouse2Average;

    // Calculate long-term loan payments (18+ months)
    const longTermLoans = loans.filter(loan => loan.durationMonths >= 18);
    const longTermPayments = longTermLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

    // Get return power percentage
    const getReturnPowerPercentage = (): number => {
      const saved = localStorage.getItem('return-power-percentage');
      if (saved) {
        const value = Number(saved);
        if (value === 33) return 1/3;
        return value;
      }
      return 1/3;
    };

    const returnPowerPercentage = getReturnPowerPercentage();
    const availableIncome = totalAverageIncome - longTermPayments;
    const multiplier = returnPowerPercentage === 1/3 ? (1/3) : (returnPowerPercentage / 100);
    const returnPower = availableIncome * multiplier;

    // Calculate max mortgage from return power (matching MortgageSection formula)
    const calculateMaxMortgageFromReturnPower = (): number => {
      if (returnPower <= 0 || mortgageDurationYears <= 0 || averageYearlyRate <= 0) return 0;
      const monthlyRate = averageYearlyRate / 100 / 12;
      const numberOfMonths = mortgageDurationYears * 12;
      if (monthlyRate === 0) return returnPower * numberOfMonths;
      // Using annuity formula: PV = PMT * [(1 - (1 + r)^-n) / r]
      const presentValue = returnPower * ((1 - Math.pow(1 + monthlyRate, -numberOfMonths)) / monthlyRate);
      return presentValue;
    };

    // Calculate max mortgage from savings and loans
    const calculateMaxMortgageFromSavingsAndLoans = (): number => {
      const openSavings = savings.filter(s => s.state === 'open');
      const totalOpenAmount = openSavings.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalTax = openSavings.reduce((sum, s) => {
        if (s.taxable) {
          const taxPercentage = s.taxPercentage !== undefined ? s.taxPercentage : 25;
          return sum + (s.totalRevenue * taxPercentage) / 100;
        }
        return sum;
      }, 0);
      const netSavings = totalOpenAmount - totalTax;
      const availableLoans = loans.filter(loan => loan.availableAsBuyingPower).reduce((sum, loan) => sum + loan.loanAmount, 0);
      return (netSavings + availableLoans) * 4;
    };

    const maxMortgageFromReturnPower = calculateMaxMortgageFromReturnPower();
    const maxMortgageFromSavingsAndLoans = calculateMaxMortgageFromSavingsAndLoans();
    const maxMortgageFromHomePrice = calculateMaxMortgageFromHomePrice();

    const values = [
      maxMortgageFromReturnPower,
      maxMortgageFromSavingsAndLoans,
      maxMortgageFromHomePrice,
    ].filter(v => v > 0);
    
    return values.length > 0 ? Math.min(...values) : 0;
  };

  const recommendedMortgage = calculateRecommendedMortgage();

  // Calculate monthly return power (based on salaries)
  const calculateMonthlyReturnPower = (): number => {
    const spouse1Average = calculateAverage(spouse1Salaries);
    const spouse2Average = calculateAverage(spouse2Salaries);
    const totalAverageIncome = spouse1Average + spouse2Average;

    const longTermLoans = loans.filter(loan => loan.durationMonths >= 18);
    const longTermPayments = longTermLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

    const getReturnPowerPercentage = (): number => {
      const saved = localStorage.getItem('return-power-percentage');
      if (saved) {
        const value = Number(saved);
        if (value === 33) return 1/3;
        return value;
      }
      return 1/3;
    };

    const returnPowerPercentage = getReturnPowerPercentage();
    const availableIncome = totalAverageIncome - longTermPayments;
    const multiplier = returnPowerPercentage === 1/3 ? (1/3) : (returnPowerPercentage / 100);
    return availableIncome * multiplier;
  };

  const monthlyReturnPower = calculateMonthlyReturnPower();

  // Calculate buying tax
  const calculateBuyingTax = (): number => {
    if (homePrice <= 0 || buyingTaxConfig.taxLevels.length === 0) return 0;

    let totalTax = 0;
    let remainingAmount = homePrice;

    for (let i = 0; i < buyingTaxConfig.taxLevels.length && remainingAmount > 0; i++) {
      const level = buyingTaxConfig.taxLevels[i];
      const prevMax = i === 0 ? 0 : buyingTaxConfig.taxLevels[i - 1].maxTaxableAmount;
      const levelMax = level.maxTaxableAmount >= 999999999 ? homePrice : level.maxTaxableAmount;
      
      const bracketMin = Math.max(prevMax, 0);
      const bracketMax = Math.min(levelMax, homePrice);
      const taxableAmount = Math.max(0, Math.min(bracketMax - bracketMin, remainingAmount));
      
      totalTax += (taxableAmount * level.taxPercentage) / 100;
      remainingAmount -= taxableAmount;
    }

    return totalTax;
  };

  // Calculate total expenses (including lawyer and broker)
  const calculateTotalExpenses = (): number => {
    const regularExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Lawyer expense
    const lawyerBase = (homePrice * lawyerPercentage) / 100;
    const lawyerTax = (lawyerBase * 18) / 100;
    const lawyerTotal = lawyerBase + lawyerTax;
    
    // Broker expense
    const brokerBase = (homePrice * brokerPercentage) / 100;
    const brokerTax = (brokerBase * 18) / 100;
    const brokerTotal = brokerBase + brokerTax;
    
    return regularExpenses + lawyerTotal + brokerTotal;
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

  // Calculate monthly mortgage payment
  const calculateMonthlyPayment = (mortgageAmount: number): number => {
    if (mortgageAmount <= 0 || mortgageDurationYears <= 0 || averageYearlyRate <= 0) return 0;
    
    const monthlyRate = averageYearlyRate / 100 / 12;
    const numberOfMonths = mortgageDurationYears * 12;
    
    if (monthlyRate === 0) {
      return mortgageAmount / numberOfMonths;
    }
    
    // PMT = PV * [r(1 + r)^n] / [(1 + r)^n - 1]
    const monthlyPayment = mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    return monthlyPayment;
  };

  // Calculate total available funds
  const calculateTotalAvailableFunds = (): number => {
    const netSavings = calculateNetSavings();
    const availableLoans = calculateAvailableLoansAmount();
    const totalExpenses = calculateTotalExpenses();
    const buyingTax = calculateBuyingTax();
    
    return netSavings + availableLoans - totalExpenses - buyingTax;
  };

  // Calculate missing money
  const calculateMissingMoney = (mortgageAmount: number): number => {
    const totalAvailableFunds = calculateTotalAvailableFunds();
    return homePrice - mortgageAmount - totalAvailableFunds;
  };

  const monthlyPayment = calculateMonthlyPayment(recommendedMortgage);
  const maxMortgageFromHomePrice = calculateMaxMortgageFromHomePrice();
  const monthlyPaymentForMaxMortgage = calculateMonthlyPayment(maxMortgageFromHomePrice);
  const totalAvailableFunds = calculateTotalAvailableFunds();
  const missingMoney = calculateMissingMoney(recommendedMortgage);
  const buyingTax = calculateBuyingTax();
  const totalExpenses = calculateTotalExpenses();
  
  // Calculate total buying power
  const totalBuyingPower = recommendedMortgage + totalAvailableFunds;
  const hasEnoughBuyingPower = totalBuyingPower >= homePrice;
  const missingBuyingPower = homePrice - totalBuyingPower;
  const additionalMonthlyPaymentNeeded = missingBuyingPower > 0 ? calculateMonthlyPayment(missingBuyingPower) : 0;

  return (
    <div className="card">
      <h2 className="section-title">{hebrew.summarySection}</h2>

      {/* Recommended Mortgage */}
      {recommendedMortgage > 0 && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
          <h3 className="text-lg font-semibold mb-3 text-green-900">{hebrew.recommendedMortgage}</h3>
          <div className="text-2xl font-bold text-green-900 mb-2">
            {recommendedMortgage.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
          </div>
          <div className="text-sm text-gray-600">
            {hebrew.mortgageDuration}: {mortgageDurationYears} {hebrew.years} | {hebrew.averageYearlyRate}: {averageYearlyRate}%
          </div>
        </div>
      )}

      {/* Monthly Payment and Comparison */}
      {recommendedMortgage > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">{hebrew.monthlyMortgagePayment}</h3>
          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.recommendedMortgage}:</span>
              <span className="font-semibold">{monthlyPayment.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
            {maxMortgageFromHomePrice > 0 && recommendedMortgage !== maxMortgageFromHomePrice && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-700">{hebrew.maxMortgageFromHomePrice}:</span>
                  <span className="font-semibold text-blue-600">
                    {monthlyPaymentForMaxMortgage.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                  </span>
                </div>
                <div className={`text-sm font-semibold pt-2 border-t ${monthlyPaymentForMaxMortgage > monthlyPayment ? 'text-red-900 border-red-200' : 'text-green-900 border-green-200'}`}>
                  {monthlyPaymentForMaxMortgage > monthlyPayment ? (
                    <>
                      {hebrew.paymentDifference}: {(monthlyPaymentForMaxMortgage - monthlyPayment).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                      <span className="text-xs text-gray-600 mr-2">
                        ({hebrew.additionalSalaryNeeded}: {((monthlyPaymentForMaxMortgage - monthlyPayment) * 3).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪)
                      </span>
                    </>
                  ) : (
                    <>
                      {hebrew.excessPaymentPower}: {(monthlyPayment - monthlyPaymentForMaxMortgage).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                    </>
                  )}
                </div>
              </>
            )}
            {monthlyReturnPower > 0 && (
              <>
                {(maxMortgageFromHomePrice > 0 && recommendedMortgage !== maxMortgageFromHomePrice) && (
                  <div className="pt-2 border-t border-blue-200 mt-2"></div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">{hebrew.monthlyReturnPower}:</span>
                  <span className="font-semibold text-blue-600">
                    {monthlyReturnPower.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                  </span>
                </div>
                {monthlyReturnPower < monthlyPayment && (
                  <div className="text-sm font-semibold pt-2 border-t text-red-900 border-red-200">
                    {hebrew.paymentDifference}: {(monthlyPayment - monthlyReturnPower).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                    <span className="text-xs text-gray-600 mr-2">
                      ({hebrew.additionalSalaryNeeded}: {((monthlyPayment - monthlyReturnPower) * 3).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪)
                    </span>
                  </div>
                )}
                {monthlyReturnPower > monthlyPayment && (
                  <div className="text-sm font-semibold pt-2 border-t text-green-900 border-green-200">
                    {hebrew.excessPaymentPower}: {(monthlyReturnPower - monthlyPayment).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-2xl font-bold text-blue-900 pt-2 border-t border-blue-200">
            {monthlyPayment.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
          </div>
        </div>
      )}

      {/* Total Available Funds */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">{hebrew.totalAvailableFunds}</h3>
        <div className="space-y-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-gray-700">{hebrew.netSavings}:</span>
            <span className="font-semibold">{calculateNetSavings().toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">{hebrew.availableLoansAmount}:</span>
            <span className="font-semibold">{calculateAvailableLoansAmount().toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">{hebrew.totalExpenses}:</span>
            <span className="font-semibold text-red-600">-{totalExpenses.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">{hebrew.totalTax}:</span>
            <span className="font-semibold text-red-600">-{buyingTax.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-900 pt-2 border-t border-blue-200">
          {totalAvailableFunds.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
        </div>
      </div>

      {/* Missing Money */}
      {homePrice > 0 && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${missingMoney > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
          <h3 className="text-lg font-semibold mb-3">{hebrew.missingMoney}</h3>
          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.homePrice}:</span>
              <span className="font-semibold">{homePrice.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.recommendedMortgage}:</span>
              <span className="font-semibold text-red-600">-{recommendedMortgage.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.totalAvailableFunds}:</span>
              <span className="font-semibold text-red-600">-{totalAvailableFunds.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
          </div>
          <div className={`text-2xl font-bold pt-2 border-t ${missingMoney > 0 ? 'text-red-900 border-red-200' : 'text-green-900 border-green-200'}`}>
            {missingMoney > 0 ? (
              <>
                {hebrew.missing}: {missingMoney.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </>
            ) : (
              <>
                {hebrew.surplus}: {Math.abs(missingMoney).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
              </>
            )}
          </div>
        </div>
      )}

      {/* Buying Power Indicator */}
      {homePrice > 0 && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${hasEnoughBuyingPower ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <h3 className="text-lg font-semibold mb-3">{hebrew.buyingPower}</h3>
          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.homePrice}:</span>
              <span className="font-semibold">{homePrice.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.recommendedMortgage}:</span>
              <span className="font-semibold">{recommendedMortgage.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{hebrew.totalAvailableFunds}:</span>
              <span className="font-semibold">{totalAvailableFunds.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-semibold">{hebrew.totalBuyingPower}:</span>
              <span className="font-bold">{totalBuyingPower.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
            </div>
          </div>
          <div className={`text-2xl font-bold pt-2 border-t flex items-center gap-2 ${hasEnoughBuyingPower ? 'text-green-900 border-green-200' : 'text-red-900 border-red-200'}`}>
            <span className="text-3xl">{hasEnoughBuyingPower ? '✓' : '✗'}</span>
            <span>{hasEnoughBuyingPower ? hebrew.enoughBuyingPower : hebrew.notEnoughBuyingPower}</span>
          </div>
        </div>
      )}
    </div>
  );
}

