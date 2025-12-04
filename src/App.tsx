import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { HomePriceInput } from './components/HomePriceInput';
import { MortgageTermsInput } from './components/MortgageTermsInput';
import { SalariesInput } from './components/SalariesInput';
import { SavingsList } from './components/SavingsList';
import { LoansList } from './components/LoansList';
import { ExpensesList } from './components/ExpensesList';
import { TaxLevelsInput } from './components/TaxLevelsInput';
import { MortgageSection } from './components/MortgageSection';
import { SummarySection } from './components/SummarySection';
import { Header } from './components/Layout/Header';
import type { MortgageData } from './types/mortgage';

const initialData: MortgageData = {
  homePrice: 0,
  mortgageDurationYears: 0,
  averageYearlyRate: 0,
  spouse1Salaries: [],
  spouse2Salaries: [],
  savings: [],
  loans: [],
  expenses: [],
  buyingTaxConfig: {
    isFirstHome: true,
    taxLevels: [],
  },
};

function App() {
  // Initialize dark mode hook - single source of truth
  const { toggleDarkMode, isDarkMode } = useDarkMode();
  
  const [mortgageData, setMortgageData] = useLocalStorage<MortgageData>(
    'mortgage-planning-data',
    initialData
  );

  // Migrate existing savings data to include taxable and taxPercentage fields
  useEffect(() => {
    const needsMigration = mortgageData.savings.some(
      (saving) => saving.taxable === undefined || saving.taxPercentage === undefined
    );
    if (needsMigration) {
      const updatedSavings = mortgageData.savings.map((saving) => ({
        ...saving,
        taxable: saving.taxable !== undefined ? saving.taxable : true,
        taxPercentage: saving.taxPercentage !== undefined ? saving.taxPercentage : 25,
      }));
      setMortgageData({
        ...mortgageData,
        savings: updatedSavings,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migrate existing loans data to include availableAsBuyingPower field (default to false)
  useEffect(() => {
    const needsMigration = mortgageData.loans.some(
      (loan) => loan.availableAsBuyingPower === undefined
    );
    if (needsMigration) {
      const updatedLoans = mortgageData.loans.map((loan) => ({
        ...loan,
        availableAsBuyingPower: loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false,
      }));
      setMortgageData({
        ...mortgageData,
        loans: updatedLoans,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateData = (updates: Partial<MortgageData>) => {
    setMortgageData((prev) => ({ ...prev, ...updates }));
  };

  // Default expenses list (same as in ExpensesList)
  const DEFAULT_EXPENSES = [
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

  // Default tax levels for first home
  const DEFAULT_FIRST_HOME_TAX_LEVELS = [
    { maxTaxableAmount: 1978745, taxPercentage: 0 },
    { maxTaxableAmount: 2347040, taxPercentage: 3.5 },
    { maxTaxableAmount: 6055070, taxPercentage: 5 },
    { maxTaxableAmount: 20183565, taxPercentage: 8 },
    { maxTaxableAmount: 999999999, taxPercentage: 10 },
  ];

  const handleClear = () => {
    if (window.confirm('האם אתה בטוח שברצונך לנקות את כל הנתונים? פעולה זו לא ניתנת לביטול.')) {
      // Clear all data and reset to defaults
      const resetData: MortgageData = {
        homePrice: 0,
        mortgageDurationYears: 0,
        averageYearlyRate: 0,
        spouse1Salaries: [],
        spouse2Salaries: [],
        savings: [],
        loans: [],
        expenses: [...DEFAULT_EXPENSES],
        buyingTaxConfig: {
          isFirstHome: true,
          taxLevels: [...DEFAULT_FIRST_HOME_TAX_LEVELS],
        },
      };
      
      setMortgageData(resetData);
      
      // Reset localStorage values for percentages
      localStorage.setItem('lawyer-percentage', '0.5');
      localStorage.setItem('broker-percentage', '2');
      localStorage.setItem('return-power-percentage', '33');
      
      // Force page reload to reset all component states
      window.location.reload();
    }
  };

  // Calculate summary values (kept for potential future use)
  const summaryValues = useMemo(() => {
    // Calculate recommended mortgage (same logic as in components)
    const calculateAverage = (salaries: { amount: number }[]) => {
      const validSalaries = salaries.filter(s => s && s.amount > 0);
      if (validSalaries.length === 0) return 0;
      const sum = validSalaries.reduce((total, s) => total + s.amount, 0);
      return sum / validSalaries.length;
    };

    const spouse1Average = calculateAverage(mortgageData.spouse1Salaries);
    const spouse2Average = calculateAverage(mortgageData.spouse2Salaries);
    const totalAverageIncome = spouse1Average + spouse2Average;

    const longTermLoans = mortgageData.loans.filter(loan => loan.durationMonths >= 18);
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
    const monthlyReturnPower = availableIncome * multiplier;

    // Calculate max mortgage from return power
    const calculateMaxMortgageFromReturnPower = (): number => {
      if (monthlyReturnPower <= 0 || mortgageData.mortgageDurationYears <= 0 || mortgageData.averageYearlyRate <= 0) return 0;
      const monthlyRate = mortgageData.averageYearlyRate / 100 / 12;
      const numberOfMonths = mortgageData.mortgageDurationYears * 12;
      if (monthlyRate === 0) return monthlyReturnPower * numberOfMonths;
      const presentValue = monthlyReturnPower * ((1 - Math.pow(1 + monthlyRate, -numberOfMonths)) / monthlyRate);
      return presentValue;
    };

    // Calculate max mortgage from savings and loans
    const calculateMaxMortgageFromSavingsAndLoans = (): number => {
      const openSavings = mortgageData.savings.filter(s => s.state === 'open');
      const totalOpenAmount = openSavings.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalTax = openSavings.reduce((sum, s) => {
        if (s.taxable) {
          const taxPercentage = s.taxPercentage !== undefined ? s.taxPercentage : 25;
          return sum + (s.totalRevenue * taxPercentage) / 100;
        }
        return sum;
      }, 0);
      const netSavings = totalOpenAmount - totalTax;
      const availableLoans = mortgageData.loans.filter(loan => loan.availableAsBuyingPower).reduce((sum, loan) => sum + loan.loanAmount, 0);
      return (netSavings + availableLoans) * 4;
    };

    // Calculate max mortgage from home price
    const calculateMaxMortgageFromHomePrice = (): number => {
      if (mortgageData.homePrice <= 0) return 0;
      const maxPercentage = mortgageData.buyingTaxConfig.isFirstHome ? 75 : 50;
      return (mortgageData.homePrice * maxPercentage) / 100;
    };

    const maxMortgageFromReturnPower = calculateMaxMortgageFromReturnPower();
    const maxMortgageFromSavingsAndLoans = calculateMaxMortgageFromSavingsAndLoans();
    const maxMortgageFromHomePrice = calculateMaxMortgageFromHomePrice();

    const values = [
      maxMortgageFromReturnPower,
      maxMortgageFromSavingsAndLoans,
      maxMortgageFromHomePrice,
    ].filter(v => v > 0);
    
    const recommendedMortgage = values.length > 0 ? Math.min(...values) : 0;

    // Calculate monthly payment
    const calculateMonthlyPayment = (mortgageAmount: number): number => {
      if (mortgageAmount <= 0 || mortgageData.mortgageDurationYears <= 0 || mortgageData.averageYearlyRate <= 0) return 0;
      const monthlyRate = mortgageData.averageYearlyRate / 100 / 12;
      const numberOfMonths = mortgageData.mortgageDurationYears * 12;
      if (monthlyRate === 0) return mortgageAmount / numberOfMonths;
      return mortgageAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    };

    const monthlyPayment = calculateMonthlyPayment(recommendedMortgage);

    // Calculate total available funds
    const calculateNetSavings = (): number => {
      const openSavings = mortgageData.savings.filter(s => s.state === 'open');
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

    const calculateAvailableLoansAmount = (): number => {
      const availableLoans = mortgageData.loans.filter(loan => loan.availableAsBuyingPower);
      return availableLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    };

    const calculateBuyingTax = (): number => {
      if (mortgageData.homePrice <= 0 || mortgageData.buyingTaxConfig.taxLevels.length === 0) return 0;
      let totalTax = 0;
      let remainingAmount = mortgageData.homePrice;
      for (let i = 0; i < mortgageData.buyingTaxConfig.taxLevels.length && remainingAmount > 0; i++) {
        const level = mortgageData.buyingTaxConfig.taxLevels[i];
        const prevMax = i === 0 ? 0 : mortgageData.buyingTaxConfig.taxLevels[i - 1].maxTaxableAmount;
        const levelMax = level.maxTaxableAmount >= 999999999 ? mortgageData.homePrice : level.maxTaxableAmount;
        const bracketMin = Math.max(prevMax, 0);
        const bracketMax = Math.min(levelMax, mortgageData.homePrice);
        const taxableAmount = Math.max(0, Math.min(bracketMax - bracketMin, remainingAmount));
        totalTax += (taxableAmount * level.taxPercentage) / 100;
        remainingAmount -= taxableAmount;
      }
      return totalTax;
    };

    const calculateTotalExpenses = (): number => {
      const regularExpenses = mortgageData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
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
      const lawyerBase = (mortgageData.homePrice * lawyerPercentage) / 100;
      const lawyerTax = (lawyerBase * 18) / 100;
      const lawyerTotal = lawyerBase + lawyerTax;
      const brokerBase = (mortgageData.homePrice * brokerPercentage) / 100;
      const brokerTax = (brokerBase * 18) / 100;
      const brokerTotal = brokerBase + brokerTax;
      return regularExpenses + lawyerTotal + brokerTotal;
    };

    const netSavings = calculateNetSavings();
    const availableLoans = calculateAvailableLoansAmount();
    const totalExpenses = calculateTotalExpenses();
    const buyingTax = calculateBuyingTax();
    const totalAvailableFunds = netSavings + availableLoans - totalExpenses - buyingTax;
    const missingMoney = mortgageData.homePrice - recommendedMortgage - totalAvailableFunds;
    const totalBuyingPower = recommendedMortgage + totalAvailableFunds;
    const hasEnoughBuyingPower = totalBuyingPower >= mortgageData.homePrice;

    // Calculate additional salary needed
    const missingMonthlyPayment = (monthlyPayment + (hasEnoughBuyingPower ? 0 : calculateMonthlyPayment(mortgageData.homePrice - totalBuyingPower))) - monthlyReturnPower;
    const additionalSalaryNeeded = missingMonthlyPayment > 0 ? missingMonthlyPayment * 3 : 0;

    return {
      recommendedMortgage,
      monthlyPayment,
      totalAvailableFunds,
      missingMoney,
      totalBuyingPower,
      hasEnoughBuyingPower,
      monthlyReturnPower,
      additionalSalaryNeeded,
    };
  }, [mortgageData]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onClear={handleClear} onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <div className="container mx-auto px-4 pb-8">
        <HomePriceInput
          value={mortgageData.homePrice}
          onChange={(value) => updateData({ homePrice: value })}
        />

        <MortgageTermsInput
          durationYears={mortgageData.mortgageDurationYears}
          averageYearlyRate={mortgageData.averageYearlyRate}
          onDurationChange={(value) => updateData({ mortgageDurationYears: value })}
          onRateChange={(value) => updateData({ averageYearlyRate: value })}
        />

        <SalariesInput
          spouse1Salaries={mortgageData.spouse1Salaries}
          spouse2Salaries={mortgageData.spouse2Salaries}
          onSpouse1Change={(salaries) => updateData({ spouse1Salaries: salaries })}
          onSpouse2Change={(salaries) => updateData({ spouse2Salaries: salaries })}
        />

        <SavingsList
          savings={mortgageData.savings}
          onChange={(savings) => updateData({ savings })}
        />

        <LoansList
          loans={mortgageData.loans}
          onChange={(loans) => updateData({ loans })}
        />

        <ExpensesList
          expenses={mortgageData.expenses}
          onChange={(expenses) => updateData({ expenses })}
          homePrice={mortgageData.homePrice}
        />

        <TaxLevelsInput
          config={mortgageData.buyingTaxConfig}
          onChange={(config) => updateData({ buyingTaxConfig: config })}
          homePrice={mortgageData.homePrice}
        />

        <MortgageSection
          spouse1Salaries={mortgageData.spouse1Salaries}
          spouse2Salaries={mortgageData.spouse2Salaries}
          loans={mortgageData.loans}
          savings={mortgageData.savings}
          homePrice={mortgageData.homePrice}
          buyingTaxConfig={mortgageData.buyingTaxConfig}
          mortgageDurationYears={mortgageData.mortgageDurationYears}
          averageYearlyRate={mortgageData.averageYearlyRate}
        />

        <SummarySection
          homePrice={mortgageData.homePrice}
          loans={mortgageData.loans}
          savings={mortgageData.savings}
          expenses={mortgageData.expenses}
          buyingTaxConfig={mortgageData.buyingTaxConfig}
          mortgageDurationYears={mortgageData.mortgageDurationYears}
          averageYearlyRate={mortgageData.averageYearlyRate}
          spouse1Salaries={mortgageData.spouse1Salaries}
          spouse2Salaries={mortgageData.spouse2Salaries}
        />
      </div>
    </div>
  );
}

export default App;

