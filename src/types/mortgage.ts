export type SavingState = 'open' | 'closed';

export interface Salary {
  amount: number;
}

export interface Saving {
  name: string;
  totalAmount: number;
  totalRevenue: number;
  state: SavingState;
  taxable: boolean;
  taxPercentage: number;
}

export interface Loan {
  name: string;
  loanAmount: number;
  durationMonths: number;
  monthlyPayment: number;
  availableAsBuyingPower: boolean;
}

export interface Expense {
  name: string;
  amount: number;
}

export interface TaxLevel {
  maxTaxableAmount: number;
  taxPercentage: number;
}

export interface BuyingTaxConfig {
  isFirstHome: boolean;
  taxLevels: TaxLevel[];
}

export interface MortgageData {
  homePrice: number;
  mortgageDurationYears: number;
  averageYearlyRate: number;
  spouse1Salaries: Salary[];
  spouse2Salaries: Salary[];
  savings: Saving[];
  loans: Loan[];
  expenses: Expense[];
  buyingTaxConfig: BuyingTaxConfig;
}


