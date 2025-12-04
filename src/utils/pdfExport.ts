import type { MortgageData } from '../types/mortgage';
import { hebrew } from '../i18n/hebrew';

interface PDFExportData extends MortgageData {
  recommendedMortgage: number;
  monthlyPayment: number;
  totalAvailableFunds: number;
  missingMoney: number;
  totalBuyingPower: number;
  hasEnoughBuyingPower: boolean;
  monthlyReturnPower: number;
  additionalSalaryNeeded: number;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(amount: number): string {
  return amount.toLocaleString('he-IL');
}

// Helper function to calculate average salary for a spouse
function calculateAverageSalary(salaries: { amount: number }[]): number {
  if (salaries.length < 3) return 0;
  const salary1 = salaries[0]?.amount || 0;
  const salary2 = salaries[1]?.amount || 0;
  const salary3 = salaries[2]?.amount || 0;
  if (salary1 <= 0 || salary2 <= 0 || salary3 <= 0) return 0;
  return (salary1 + salary2 + salary3) / 3;
}

// Helper function to calculate saving tax
function calculateSavingTax(saving: { taxable?: boolean; totalRevenue: number; state: string; taxPercentage?: number }): number {
  if (!saving.taxable || saving.state === 'closed') return 0;
  const taxPercentage = saving.taxPercentage !== undefined ? saving.taxPercentage : 25;
  return (saving.totalRevenue * taxPercentage) / 100;
}

// Helper function to calculate tax for a tax level
function calculateTaxForLevel(level: { maxTaxableAmount: number; taxPercentage: number }, index: number, homePrice: number, prevMax: number): number {
  if (homePrice <= 0) return 0;
  const levelMax = level.maxTaxableAmount >= 999999999 ? homePrice : level.maxTaxableAmount;
  const bracketMin = Math.max(prevMax, 0);
  const bracketMax = Math.min(levelMax, homePrice);
  const taxableAmount = Math.max(0, Math.min(bracketMax - bracketMin, homePrice - prevMax));
  return (taxableAmount * level.taxPercentage) / 100;
}

export function exportToPDF(data: PDFExportData, version: 'short' | 'full') {
  // Import html2pdf dynamically
  import('html2pdf.js').then((html2pdfModule) => {
    // @ts-ignore
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // Create a temporary container - must be visible for html2canvas
    const container = document.createElement('div');
    container.id = 'pdf-export-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '794px'; // A4 width in pixels (210mm at 96dpi)
    container.style.padding = '40px';
    container.style.fontFamily = 'Arial, "DejaVu Sans", sans-serif';
    container.style.fontSize = '14px';
    container.style.direction = 'rtl';
    container.style.textAlign = 'right';
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.zIndex = '99999';
    container.style.overflow = 'auto';
    container.style.boxSizing = 'border-box';

    let html = `
      <style>
        .pdf-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          overflow: hidden;
          display: block;
          margin-bottom: 0 !important;
        }
        @media print {
          .pdf-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block;
            margin-bottom: 0 !important;
          }
        }
        .pdf-section table {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-section thead {
          display: table-header-group;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-section tbody tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Prevent breaking between currency and number */
        .pdf-section .currency {
          white-space: nowrap !important;
          page-break-inside: avoid !important;
        }
        /* Prevent orphaned words in table cells */
        .pdf-section td, .pdf-section th {
          word-break: keep-all;
          overflow-wrap: break-word;
          page-break-inside: avoid !important;
        }
        /* Keep short labels together */
        .pdf-section h2, .pdf-section h3 {
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        /* Prevent line breaks in important text */
        .pdf-section p, .pdf-section span, .pdf-section div {
          orphans: 3;
          widows: 3;
        }
        /* Prevent breaking in flex containers */
        .pdf-section [style*="display: flex"] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      </style>
      <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; text-align: right; color: #333;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; margin: -40px -40px 30px -40px; border-radius: 0;">
          <h1 style="font-size: 28px; font-weight: bold; margin: 0; text-align: center;">${hebrew.appTitle}</h1>
          <p style="text-align: center; margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    `;

    if (version === 'short') {
      // Short version - Summary only
      html += `
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border: 2px solid #e2e8f0; margin-bottom: 20px;">
          <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 20px 0; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">${hebrew.summarySection}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background: #eff6ff;">
              <td style="padding: 12px; border: 1px solid #dbeafe; font-weight: bold; width: 40%;">${hebrew.recommendedMortgage}</td>
              <td style="padding: 12px; border: 1px solid #dbeafe; text-align: left; font-size: 16px; color: #059669; font-weight: bold; white-space: nowrap;" class="currency">${formatCurrency(data.recommendedMortgage)} ₪</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${hebrew.monthlyMortgagePayment}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(data.monthlyPayment)} ₪</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${hebrew.totalAvailableFunds}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(data.totalAvailableFunds)} ₪</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${hebrew.totalBuyingPower}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 16px; font-weight: bold; color: #1e40af; white-space: nowrap;" class="currency">${formatCurrency(data.totalBuyingPower)} ₪</td>
            </tr>
            <tr style="background: ${data.hasEnoughBuyingPower ? '#d1fae5' : '#fee2e2'};">
              <td colspan="2" style="padding: 12px; border: 1px solid ${data.hasEnoughBuyingPower ? '#a7f3d0' : '#fecaca'}; text-align: center; font-weight: bold; color: ${data.hasEnoughBuyingPower ? '#065f46' : '#991b1b'};">
                ${data.hasEnoughBuyingPower ? '✓ ' + hebrew.enoughBuyingPower : '✗ ' + hebrew.notEnoughBuyingPower}
              </td>
            </tr>
            ${data.homePrice > 0 ? `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${hebrew.missingMoney}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; color: ${data.missingMoney > 0 ? '#dc2626' : '#059669'};">
                ${formatCurrency(data.missingMoney)} ₪
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
      `;
    } else {
      // Full version - All details
      html += `
        <div class="pdf-section" style="background: #fef3c7; padding: 12px; border-radius: 8px; border-right: 4px solid #f59e0b; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 6px 0; color: #92400e;">${hebrew.homePrice}</h2>
          <p style="font-size: 22px; font-weight: bold; margin: 0; color: #b45309; white-space: nowrap;"><span class="currency">${formatNumber(data.homePrice)} ₪</span></p>
        </div>

        <div class="pdf-section" style="background: #f0f9ff; padding: 12px; border-radius: 8px; border-right: 4px solid #0ea5e9; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #0c4a6e;">${hebrew.mortgageTerms}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #bae6fd; width: 50%;">${hebrew.mortgageDuration}</td>
              <td style="padding: 8px; border-bottom: 1px solid #bae6fd; font-weight: 600; white-space: nowrap;">${data.mortgageDurationYears} ${hebrew.years}</td>
            </tr>
            <tr>
              <td style="padding: 8px; width: 50%;">${hebrew.averageYearlyRate}</td>
              <td style="padding: 8px; font-weight: 600; white-space: nowrap;">${data.averageYearlyRate}%</td>
            </tr>
          </table>
        </div>

        <div class="pdf-section" style="background: #f0fdf4; padding: 12px; border-radius: 8px; border-right: 4px solid #10b981; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0; color: #065f46;">${hebrew.salaries}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: #047857;">${hebrew.spouse1}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.spouse1Salaries.map((salary, index) => 
                  salary.amount > 0 ? `
                  <tr>
                    <td style="padding: 6px; border-bottom: 1px solid #d1fae5; width: 50%;">${hebrew.salary} ${index + 1}</td>
                    <td style="padding: 6px; border-bottom: 1px solid #d1fae5; font-weight: 600; text-align: left; white-space: nowrap;" class="currency">${formatNumber(salary.amount)} ₪</td>
                  </tr>
                  ` : ''
                ).join('')}
              </table>
            </div>
            <div>
              <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: #047857;">${hebrew.spouse2}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.spouse2Salaries.map((salary, index) => 
                  salary.amount > 0 ? `
                  <tr>
                    <td style="padding: 6px; border-bottom: 1px solid #d1fae5; width: 50%;">${hebrew.salary} ${index + 1}</td>
                    <td style="padding: 6px; border-bottom: 1px solid #d1fae5; font-weight: 600; text-align: left; white-space: nowrap;" class="currency">${formatNumber(salary.amount)} ₪</td>
                  </tr>
                  ` : ''
                ).join('')}
              </table>
            </div>
          </div>
          ${(() => {
            const spouse1Avg = calculateAverageSalary(data.spouse1Salaries);
            const spouse2Avg = calculateAverageSalary(data.spouse2Salaries);
            const totalAvg = spouse1Avg + spouse2Avg;
            return totalAvg > 0 ? `
              <div style="margin-top: 10px; padding: 10px; background: #dbeafe; border-radius: 6px; border: 2px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: bold; font-size: 16px; color: #1e3a8a; white-space: nowrap;">${hebrew.totalAverageSalaries}:</span>
                  <span style="font-weight: bold; font-size: 18px; color: #1e3a8a; white-space: nowrap;" class="currency">${formatCurrency(totalAvg)} ₪</span>
                </div>
              </div>
            ` : '';
          })()}
        </div>
      `;

      // Savings Section - Always show
      html += `
          <div class="pdf-section" style="background: #fef3c7; padding: 12px; border-radius: 8px; border-right: 4px solid #f59e0b; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #92400e;">${hebrew.savings}</h2>
            ${data.savings.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #fde68a;">
                  <th style="padding: 6px; border: 1px solid #fcd34d; text-align: right; font-size: 12px;">${hebrew.savingName}</th>
                  <th style="padding: 6px; border: 1px solid #fcd34d; text-align: left; font-size: 12px;">${hebrew.totalAmount}</th>
                  <th style="padding: 6px; border: 1px solid #fcd34d; text-align: left; font-size: 12px;">${hebrew.totalRevenue}</th>
                  <th style="padding: 6px; border: 1px solid #fcd34d; text-align: center; font-size: 12px;">${hebrew.state}</th>
                  <th style="padding: 6px; border: 1px solid #fcd34d; text-align: center; font-size: 12px;">${hebrew.taxable}</th>
                  <th style="padding: 6px; border: 1px solid #fcd34d; text-align: left; font-size: 12px;">${hebrew.savingTax}</th>
                </tr>
              </thead>
              <tbody>
                ${data.savings.map((saving, idx) => {
                  const savingTax = calculateSavingTax(saving);
                  return `
                  <tr style="background: ${idx % 2 === 0 ? '#fffbeb' : 'white'};">
                    <td style="padding: 5px; border: 1px solid #fde68a; font-size: 11px;">${saving.name || 'חסכון'}</td>
                    <td style="padding: 5px; border: 1px solid #fde68a; font-weight: 600; text-align: left; font-size: 11px; white-space: nowrap;" class="currency">${formatNumber(saving.totalAmount)} ₪</td>
                    <td style="padding: 5px; border: 1px solid #fde68a; font-weight: 600; text-align: left; font-size: 11px; white-space: nowrap;" class="currency">${formatNumber(saving.totalRevenue)} ₪</td>
                    <td style="padding: 5px; border: 1px solid #fde68a; text-align: center;">
                      <span style="background: ${saving.state === 'open' ? '#d1fae5' : '#fee2e2'}; color: ${saving.state === 'open' ? '#065f46' : '#991b1b'}; padding: 2px 5px; border-radius: 4px; font-size: 10px; white-space: nowrap;">
                        ${saving.state === 'open' ? hebrew.open : hebrew.closed}
                      </span>
                    </td>
                    <td style="padding: 5px; border: 1px solid #fde68a; text-align: center; font-size: 11px; white-space: nowrap;">
                      ${saving.taxable ? `<span style="color: #dc2626;">${hebrew.taxable} ${saving.taxPercentage ? `(${saving.taxPercentage}%)` : ''}</span>` : `<span style="color: #059669;">${hebrew.notTaxable}</span>`}
                    </td>
                    <td style="padding: 5px; border: 1px solid #fde68a; font-weight: 600; text-align: left; font-size: 11px; color: ${savingTax > 0 ? '#dc2626' : '#6b7280'}; white-space: nowrap;" class="currency">${formatCurrency(savingTax)} ₪</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            ${(() => {
              const openSavings = data.savings.filter(s => s.state === 'open');
              const totalOpenAmount = openSavings.reduce((sum, s) => sum + s.totalAmount, 0);
              const totalTax = openSavings.reduce((sum, s) => sum + calculateSavingTax(s), 0);
              const netAmount = totalOpenAmount - totalTax;
              return openSavings.length > 0 ? `
                <div style="margin-top: 10px; padding: 10px; background: #dbeafe; border-radius: 6px; border: 2px solid #3b82f6;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #1e3a8a;">${hebrew.totalOpenSavings}:</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 13px;">${hebrew.totalAmount}:</span>
                    <span style="font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(totalOpenAmount)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 13px;">${hebrew.totalSavingsTax}:</span>
                    <span style="font-weight: 600; color: #dc2626; white-space: nowrap;" class="currency">-${formatCurrency(totalTax)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #93c5fd; margin-top: 8px;">
                    <span style="font-weight: bold; font-size: 15px; color: #1e3a8a;">${hebrew.netSavings}:</span>
                    <span style="font-weight: bold; font-size: 16px; color: #059669; white-space: nowrap;" class="currency">${formatCurrency(netAmount)} ₪</span>
                  </div>
                </div>
              ` : '';
            })()}
            ` : '<p style="margin: 0; color: #92400e; font-size: 14px; padding: 10px;">אין חסכונות</p>'}
          </div>
        `;
      
      // Loans Section - Always show
      html += `
          <div class="pdf-section" style="background: #f3e8ff; padding: 12px; border-radius: 8px; border-right: 4px solid #a855f7; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #6b21a8;">${hebrew.loans}</h2>
            ${data.loans.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9d5ff;">
                  <th style="padding: 8px; border: 1px solid #d8b4fe; text-align: right; font-size: 13px;">${hebrew.loanName}</th>
                  <th style="padding: 8px; border: 1px solid #d8b4fe; text-align: left; font-size: 13px;">${hebrew.loanAmount}</th>
                  <th style="padding: 8px; border: 1px solid #d8b4fe; text-align: left; font-size: 13px;">${hebrew.monthlyPayment}</th>
                  <th style="padding: 8px; border: 1px solid #d8b4fe; text-align: center; font-size: 13px;">${hebrew.durationMonths}</th>
                  <th style="padding: 8px; border: 1px solid #d8b4fe; text-align: center; font-size: 13px;">${hebrew.availableAsBuyingPower}</th>
                </tr>
              </thead>
              <tbody>
                ${data.loans.map((loan, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#faf5ff' : 'white'};">
                    <td style="padding: 8px; border: 1px solid #e9d5ff; font-size: 12px;">${loan.name || 'הלוואה'}</td>
                    <td style="padding: 8px; border: 1px solid #e9d5ff; font-weight: 600; text-align: left; font-size: 12px; white-space: nowrap;" class="currency">${formatNumber(loan.loanAmount)} ₪</td>
                    <td style="padding: 8px; border: 1px solid #e9d5ff; font-weight: 600; text-align: left; font-size: 12px; white-space: nowrap;" class="currency">${formatCurrency(loan.monthlyPayment)} ₪</td>
                    <td style="padding: 8px; border: 1px solid #e9d5ff; text-align: center; font-size: 12px;">${loan.durationMonths}</td>
                    <td style="padding: 8px; border: 1px solid #e9d5ff; text-align: center; font-size: 12px;">
                      ${loan.availableAsBuyingPower ? '<span style="color: #059669;">✓</span>' : '<span style="color: #dc2626;">✗</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${(() => {
              const availableLoans = data.loans.filter(loan => loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false);
              const totalLoanAmount = availableLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
              const totalMonthlyPayments = data.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
              const longTermLoans = data.loans.filter(loan => loan.durationMonths >= 18);
              const totalLongTermPayments = longTermLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
              return data.loans.length > 0 ? `
                <div style="margin-top: 10px; padding: 10px; background: #e9d5ff; border-radius: 6px; border: 2px solid #a855f7;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #6b21a8;">סיכום הלוואות:</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 13px;">${hebrew.totalLoanAmount}:</span>
                    <span style="font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(totalLoanAmount)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 13px;">${hebrew.totalMonthlyPayments}:</span>
                    <span style="font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(totalMonthlyPayments)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #c084fc; margin-top: 8px;">
                    <span style="font-weight: bold; font-size: 14px; color: #6b21a8;">${hebrew.totalLongTermPayments}:</span>
                    <span style="font-weight: bold; font-size: 15px; color: #7c3aed; white-space: nowrap;" class="currency">${formatCurrency(totalLongTermPayments)} ₪</span>
                  </div>
                </div>
              ` : '';
            })()}
            ` : '<p style="margin: 0; color: #6b21a8; font-size: 14px; padding: 10px;">אין הלוואות</p>'}
          </div>
        `;
      
      // Expenses Section - Always show
      html += `
          <div class="pdf-section" style="background: #fee2e2; padding: 12px; border-radius: 8px; border-right: 4px solid #ef4444; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #991b1b;">${hebrew.expenses}</h2>
            ${data.expenses.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #fecaca;">
                  <th style="padding: 8px; border: 1px solid #fca5a5; text-align: right; font-size: 13px;">${hebrew.expenseName}</th>
                  <th style="padding: 8px; border: 1px solid #fca5a5; text-align: left; font-size: 13px;">${hebrew.expenseAmount}</th>
                </tr>
              </thead>
              <tbody>
                ${data.expenses.map((expense, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#fef2f2' : 'white'};">
                    <td style="padding: 8px; border: 1px solid #fecaca; font-size: 12px;">${expense.name}</td>
                    <td style="padding: 8px; border: 1px solid #fecaca; font-weight: 600; text-align: left; font-size: 12px; white-space: nowrap;" class="currency">${formatNumber(expense.amount)} ₪</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${(() => {
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
              const lawyerBase = (data.homePrice * lawyerPercentage) / 100;
              const lawyerTax = (lawyerBase * 18) / 100;
              const lawyerTotal = lawyerBase + lawyerTax;
              const brokerBase = (data.homePrice * brokerPercentage) / 100;
              const brokerTax = (brokerBase * 18) / 100;
              const brokerTotal = brokerBase + brokerTax;
              const regularExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
              const totalExpenses = regularExpenses + lawyerTotal + brokerTotal;
              return `
                <div style="margin-top: 10px; padding: 10px; background: #fee2e2; border-radius: 6px; border: 2px solid #ef4444;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #991b1b;">${hebrew.lawyer} (${lawyerPercentage}%):</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                    <span>${hebrew.baseAmount}:</span>
                    <span style="white-space: nowrap;" class="currency">${formatCurrency(lawyerBase)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                    <span>${hebrew.tax} (18%):</span>
                    <span style="white-space: nowrap;" class="currency">${formatCurrency(lawyerTax)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #fca5a5; font-weight: 600;">
                    <span>${hebrew.totalWithTax}:</span>
                    <span style="white-space: nowrap;" class="currency">${formatCurrency(lawyerTotal)} ₪</span>
                  </div>
                  <div style="font-weight: bold; margin-bottom: 8px; color: #991b1b;">${hebrew.broker} (${brokerPercentage}%):</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                    <span>${hebrew.baseAmount}:</span>
                    <span style="white-space: nowrap;" class="currency">${formatCurrency(brokerBase)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                    <span>${hebrew.tax} (18%):</span>
                    <span style="white-space: nowrap;" class="currency">${formatCurrency(brokerTax)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #fca5a5; font-weight: 600;">
                    <span>${hebrew.totalWithTax}:</span>
                    <span style="white-space: nowrap;" class="currency">${formatCurrency(brokerTotal)} ₪</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #f87171; margin-top: 8px;">
                    <span style="font-weight: bold; font-size: 15px; color: #991b1b;">${hebrew.totalExpenses}:</span>
                    <span style="font-weight: bold; font-size: 16px; color: #dc2626; white-space: nowrap;" class="currency">${formatCurrency(totalExpenses)} ₪</span>
                  </div>
                </div>
              `;
            })()}
            ` : '<p style="margin: 0; color: #991b1b; font-size: 14px; padding: 10px;">אין הוצאות</p>'}
          </div>
        `;
      
      // Tax Levels Section - Always show
      html += `
          <div class="pdf-section" style="background: #dbeafe; padding: 12px; border-radius: 8px; border-right: 4px solid #3b82f6; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #1e3a8a;">${hebrew.buyingTax}</h2>
            ${data.buyingTaxConfig.taxLevels.length > 0 ? `
            <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
              <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1e40af;">
                ${data.buyingTaxConfig.isFirstHome ? '🏠 ' + hebrew.isFirstHome : '🏘️ ' + hebrew.anotherHome}
              </p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #bfdbfe;">
                  <th style="padding: 8px; border: 1px solid #93c5fd; text-align: center; font-size: 13px;">${hebrew.level}</th>
                  <th style="padding: 8px; border: 1px solid #93c5fd; text-align: right; font-size: 13px;">${hebrew.maxTaxableAmount}</th>
                  <th style="padding: 8px; border: 1px solid #93c5fd; text-align: center; font-size: 13px;">${hebrew.taxPercentage}</th>
                  <th style="padding: 8px; border: 1px solid #93c5fd; text-align: left; font-size: 13px;">${hebrew.taxAmount}</th>
                </tr>
              </thead>
              <tbody>
                ${data.buyingTaxConfig.taxLevels.map((level, index) => {
                  const prevMax = index === 0 ? 0 : data.buyingTaxConfig.taxLevels[index - 1].maxTaxableAmount;
                  const taxAmount = calculateTaxForLevel(level, index, data.homePrice, prevMax);
                  return `
                  <tr style="background: ${index % 2 === 0 ? '#eff6ff' : 'white'};">
                    <td style="padding: 8px; border: 1px solid #bfdbfe; text-align: center; font-weight: bold; font-size: 12px;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #bfdbfe; text-align: right; font-size: 12px;">${level.maxTaxableAmount >= 999999999 ? 'ומעלה' : formatNumber(level.maxTaxableAmount) + ' ₪'}</td>
                    <td style="padding: 8px; border: 1px solid #bfdbfe; text-align: center; font-weight: 600; font-size: 12px;">${level.taxPercentage}%</td>
                    <td style="padding: 8px; border: 1px solid #bfdbfe; font-weight: 600; text-align: left; font-size: 12px; color: ${taxAmount > 0 ? '#dc2626' : '#6b7280'}; white-space: nowrap;" class="currency">${formatCurrency(taxAmount)} ₪</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            ${(() => {
              let totalTax = 0;
              let remainingAmount = data.homePrice;
              for (let i = 0; i < data.buyingTaxConfig.taxLevels.length && remainingAmount > 0; i++) {
                const level = data.buyingTaxConfig.taxLevels[i];
                const prevMax = i === 0 ? 0 : data.buyingTaxConfig.taxLevels[i - 1].maxTaxableAmount;
                const levelMax = level.maxTaxableAmount >= 999999999 ? data.homePrice : level.maxTaxableAmount;
                const bracketMin = Math.max(prevMax, 0);
                const bracketMax = Math.min(levelMax, data.homePrice);
                const taxableAmount = Math.max(0, Math.min(bracketMax - bracketMin, remainingAmount));
                totalTax += (taxableAmount * level.taxPercentage) / 100;
                remainingAmount -= taxableAmount;
              }
              return data.homePrice > 0 ? `
                <div style="margin-top: 10px; padding: 10px; background: #dbeafe; border-radius: 6px; border: 2px solid #3b82f6;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold; font-size: 16px; color: #1e3a8a;">${hebrew.totalTax}:</span>
                    <span style="font-weight: bold; font-size: 18px; color: #dc2626; white-space: nowrap;" class="currency">${formatCurrency(totalTax)} ₪</span>
                  </div>
                </div>
              ` : '';
            })()}
            ` : '<p style="margin: 0; color: #1e3a8a; font-size: 14px; padding: 10px;">אין מדרגות מס</p>'}
          </div>
        `;

      // Mortgage Section
      html += (() => {
        // Calculate all mortgage values
        const calculateAverage = (salaries: { amount: number }[]): number => {
          const validSalaries = salaries.filter(s => s && s.amount > 0);
          if (validSalaries.length === 0) return 0;
          const sum = validSalaries.reduce((total, s) => total + s.amount, 0);
          return sum / validSalaries.length;
        };
        
        const spouse1Average = calculateAverage(data.spouse1Salaries);
        const spouse2Average = calculateAverage(data.spouse2Salaries);
        const totalAverageIncome = spouse1Average + spouse2Average;
        
        const longTermLoans = data.loans.filter(loan => loan.durationMonths >= 18);
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
        const returnPower = availableIncome * multiplier;
        
        // Calculate max mortgage from return power
        const calculateMaxMortgageFromReturnPower = (): number => {
          if (returnPower <= 0 || data.mortgageDurationYears <= 0 || data.averageYearlyRate <= 0) return 0;
          const monthlyRate = data.averageYearlyRate / 100 / 12;
          const numberOfMonths = data.mortgageDurationYears * 12;
          if (monthlyRate === 0) return returnPower * numberOfMonths;
          return returnPower * ((1 - Math.pow(1 + monthlyRate, -numberOfMonths)) / monthlyRate);
        };
        
        const maxMortgageFromReturnPower = calculateMaxMortgageFromReturnPower();
        
        // Calculate net savings
        const openSavings = data.savings.filter(s => s.state === 'open');
        const totalOpenAmount = openSavings.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalTax = openSavings.reduce((sum, s) => sum + calculateSavingTax(s), 0);
        const netSavings = totalOpenAmount - totalTax;
        
        // Calculate available loans
        const availableLoans = data.loans.filter(loan => loan.availableAsBuyingPower !== undefined ? loan.availableAsBuyingPower : false);
        const availableLoansAmount = availableLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
        
        // Calculate max mortgage from savings and loans
        const maxMortgageFromSavingsAndLoans = (netSavings + availableLoansAmount) * 4;
        
        // Calculate max mortgage from home price
        const maxPercentage = data.buyingTaxConfig.isFirstHome ? 75 : 50;
        const maxMortgageFromHomePrice = data.homePrice > 0 ? (data.homePrice * maxPercentage) / 100 : 0;
        
        // Recommended mortgage (minimum of the three)
        const values = [maxMortgageFromReturnPower, maxMortgageFromSavingsAndLoans, maxMortgageFromHomePrice].filter(v => v > 0);
        const recommendedMortgage = values.length > 0 ? Math.min(...values) : 0;
        
        return `
          <div class="pdf-section" style="background: #f0f9ff; padding: 12px; border-radius: 8px; border-right: 4px solid #0ea5e9; margin-bottom: 0; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #0c4a6e;">${hebrew.mortgageSection}</h2>
            
            <div style="background: #e0f2fe; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #7dd3fc;">
              <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 10px 0; color: #0c4a6e;">${hebrew.returnPower}</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                <span>${hebrew.totalAverageIncome}:</span>
                <span style="font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(totalAverageIncome)} ₪</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                <span>${hebrew.longTermLoanPayments}:</span>
                <span style="font-weight: 600; color: #dc2626; white-space: nowrap;" class="currency">-${formatCurrency(longTermPayments)} ₪</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #7dd3fc; margin-top: 8px; font-weight: bold; font-size: 14px;">
                <span style="white-space: nowrap;">${hebrew.returnPower} (${returnPowerPercentage === 1/3 ? '1/3' : (returnPowerPercentage * 100).toFixed(0) + '%'}):</span>
                <span style="color: #0284c7; white-space: nowrap;" class="currency">${formatCurrency(returnPower)} ₪</span>
              </div>
            </div>
            
            <div style="background: #dbeafe; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 2px solid #3b82f6;">
              <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 8px 0; color: #1e3a8a;">${hebrew.maxMortgageFromReturnPower}</h3>
              <div style="font-size: 18px; font-weight: bold; color: #1e40af; white-space: nowrap;" class="currency">${formatCurrency(maxMortgageFromReturnPower)} ₪</div>
            </div>
            
            <div style="background: #dbeafe; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 2px solid #3b82f6;">
              <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 8px 0; color: #1e3a8a;">${hebrew.maxMortgageFromSavingsAndLoans}</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                <span>${hebrew.netSavings}:</span>
                <span style="font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(netSavings)} ₪</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                <span>${hebrew.availableLoansAmount}:</span>
                <span style="font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(availableLoansAmount)} ₪</span>
              </div>
              <div style="font-size: 18px; font-weight: bold; color: #1e40af; padding-top: 8px; border-top: 1px solid #93c5fd; white-space: nowrap;" class="currency">${formatCurrency(maxMortgageFromSavingsAndLoans)} ₪</div>
            </div>
            
            <div style="background: #dbeafe; padding: 12px; border-radius: 6px; margin-bottom: 12px; border: 2px solid #3b82f6;">
              <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 8px 0; color: #1e3a8a;">${hebrew.maxMortgageFromHomePrice}</h3>
              <div style="font-size: 13px; margin-bottom: 8px; color: #475569; white-space: nowrap;">
                ${data.buyingTaxConfig.isFirstHome ? hebrew.isFirstHome : hebrew.anotherHome} (${maxPercentage}% ${hebrew.ofHomePrice})
              </div>
              <div style="font-size: 18px; font-weight: bold; color: #1e40af; white-space: nowrap;" class="currency">${formatCurrency(maxMortgageFromHomePrice)} ₪</div>
            </div>
            
            ${recommendedMortgage > 0 ? `
              <div style="background: #d1fae5; padding: 15px; border-radius: 6px; border: 3px solid #10b981;">
                <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0; color: #065f46;">${hebrew.recommendedMortgage}</h3>
                <div style="font-size: 13px; margin-bottom: 10px; color: #047857;">
                  ${hebrew.minimumOfThree}
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #059669; white-space: nowrap;" class="currency">${formatCurrency(recommendedMortgage)} ₪</div>
              </div>
            ` : ''}
          </div>
        `;
      })();

      // Summary Section
      html += `
        <div class="pdf-section" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 15px; color: white; page-break-inside: avoid !important; break-inside: avoid !important; overflow: hidden;">
          <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 15px 0; text-align: center; color: white; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 12px;">${hebrew.summarySection}</h2>
          <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.1); border-radius: 6px;">
            <tr style="background: rgba(255,255,255,0.15);">
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); font-weight: bold; width: 45%;">${hebrew.recommendedMortgage}</td>
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: left; font-size: 16px; font-weight: bold; white-space: nowrap;" class="currency">${formatCurrency(data.recommendedMortgage)} ₪</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2);">${hebrew.monthlyMortgagePayment}</td>
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: left; font-weight: 600; font-size: 15px; white-space: nowrap;" class="currency">${formatCurrency(data.monthlyPayment)} ₪</td>
            </tr>
            <tr style="background: rgba(255,255,255,0.1);">
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2);">${hebrew.totalAvailableFunds}</td>
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: left; font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(data.totalAvailableFunds)} ₪</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); font-weight: bold; font-size: 15px;">${hebrew.totalBuyingPower}</td>
              <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: left; font-size: 18px; font-weight: bold; white-space: nowrap;" class="currency">${formatCurrency(data.totalBuyingPower)} ₪</td>
            </tr>
            <tr style="background: ${data.hasEnoughBuyingPower ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
              <td colspan="2" style="padding: 12px; text-align: center; font-weight: bold; font-size: 15px;">
                ${data.hasEnoughBuyingPower ? '✓ ' : '✗ '}${data.hasEnoughBuyingPower ? hebrew.enoughBuyingPower : hebrew.notEnoughBuyingPower}
              </td>
            </tr>
            ${data.homePrice > 0 ? `
            <tr>
              <td style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.2);">${hebrew.missingMoney}</td>
              <td style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.2); text-align: left; font-weight: 600; color: ${data.missingMoney > 0 ? '#fee2e2' : '#d1fae5'};">
                <span style="white-space: nowrap;" class="currency">${formatCurrency(data.missingMoney)} ₪</span>
              </td>
            </tr>
            ` : ''}
            ${data.monthlyReturnPower > 0 ? `
            <tr>
              <td style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.2);">${hebrew.monthlyReturnPower}</td>
              <td style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.2); text-align: left; font-weight: 600; white-space: nowrap;" class="currency">${formatCurrency(data.monthlyReturnPower)} ₪</td>
            </tr>
            ` : ''}
            ${data.additionalSalaryNeeded > 0 ? `
            <tr>
              <td style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.2);">${hebrew.additionalSalaryNeeded}</td>
              <td style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.2); text-align: left; font-weight: 600; color: #fee2e2; white-space: nowrap;" class="currency">${formatCurrency(data.additionalSalaryNeeded)} ₪</td>
            </tr>
            ` : ''}
          </table>
        </div>
      `;
    }

    html += `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: center;">
          <p style="font-size: 10px; color: #6b7280; margin: 3px 0;">
            נוצר ב-${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p style="font-size: 9px; color: #9ca3af; margin: 3px 0;">
            ${version === 'short' ? hebrew.exportShort : hebrew.exportFull} - כלי תכנון משכנתא
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;
    document.body.appendChild(container);

    // Force a reflow to ensure content is rendered
    container.offsetHeight;

    // Wait for content to render and images to load
    setTimeout(() => {
      const options = {
        margin: [10, 10, 10, 10],
        filename: `mortgage-plan-${version}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: container.scrollWidth,
          height: container.scrollHeight
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: '.pdf-section'
        }
      };

      html2pdf()
        .set(options)
        .from(container)
        .save()
        .then(() => {
          document.body.removeChild(container);
        })
        .catch((error: Error) => {
          console.error('PDF generation error:', error);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        });
    }, 300);
  }).catch((error) => {
    console.error('Failed to load html2pdf.js:', error);
    alert('שגיאה ביצירת PDF. אנא נסה שוב.');
  });
}
