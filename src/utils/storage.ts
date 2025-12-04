import type { MortgageData } from '../types/mortgage';

const STORAGE_KEY = 'mortgage-planning-data';

export function saveMortgageData(data: MortgageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving mortgage data:', error);
    throw error;
  }
}

export function loadMortgageData(): MortgageData | null {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error loading mortgage data:', error);
    return null;
  }
}

export function clearMortgageData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing mortgage data:', error);
  }
}



