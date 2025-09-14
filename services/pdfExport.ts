import { Project, Expense, Income, ExportOptions, Category, Supplier } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Hebrew fonts support for jsPDF
declare const window: any;

export const exportToPDF = async (
  project: Project, 
  summaryData: any, 
  categories: Category[], 
  options: ExportOptions,
  suppliers?: Supplier[]
): Promise<void> => {
  try {
    // Get recipient name
    const recipientName = prompt('עבור מי הדוח מונפק?') || 'לקוח יקר';
    
    // Create temporary div for PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '794px'; // A4 width in pixels (210mm @ 96 DPI)
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    
    // Add CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = getPDFStyles();
    document.head.appendChild(styleElement);
    
    // Generate HTML content
    tempDiv.innerHTML = createPDFContent(project, summaryData, categories, recipientName, suppliers, options.includeIncomes);
    
    document.body.appendChild(tempDiv);
    
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 3, // Even higher quality for crisp text
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: tempDiv.scrollHeight,
      logging: false, // Disable logging for cleaner output
      onclone: (clonedDoc) => {
        // Ensure Hebrew text rendering
        const clonedDiv = clonedDoc.querySelector('div');
        if (clonedDiv) {
          clonedDiv.style.fontFamily = 'Arial, "Segoe UI", Tahoma, sans-serif';
          clonedDiv.style.direction = 'rtl';
        }
      }
    });
    
    // Clean up
    document.body.removeChild(tempDiv);
    document.head.removeChild(styleElement);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // If content is too long, split into multiple pages
    if (imgHeight > 297) { // A4 height in mm
      const totalPages = Math.ceil(imgHeight / 297);
      const pageHeight = canvas.height / totalPages;
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeight;
        
        pageCtx?.drawImage(
          canvas,
          0, i * pageHeight,
          canvas.width, pageHeight,
          0, 0,
          canvas.width, pageHeight
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, 297);
      }
    } else {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
    
    // Save file
    const reportType = options.includeIncomes ? 'מלא' : 'מקוצר';
    const fileName = `דוח_${reportType}_${project.name}_${recipientName}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('שגיאה ביצירת קובץ PDF. אנא נסה שוב.');
  }
};

const createPDFContent = (
  project: Project, 
  summaryData: any, 
  categories: Category[], 
  recipientName: string, 
  suppliers?: Supplier[],
  includeIncomeDetails?: boolean
): string => {
  let html = '';

  // Company header
  html += `
    <div class="pdf-header">
      <h1>🏗️ מערכת ניהול פרויקטים לקבלן</h1>
      <p class="copyright">זכויות יוצרים ליטל ביטון</p>
      <h2>דוח פרימיום - ${project.name}</h2>
      <p class="project-desc">${project.description || 'תיאור הפרויקט'}</p>
    </div>
  `;

  // Project info section
  html += `
    <div class="pdf-section">
      <h3>📋 פרטי פרויקט</h3>
      <table class="pdf-table info-table">
        <tr>
          <td><strong>תאריך הפקת הדוח:</strong></td>
          <td>${new Date().toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</td>
          <td><strong>שם פרויקט:</strong></td>
          <td>${project.name}</td>
        </tr>
        <tr>
          <td><strong>מוכן עבור:</strong></td>
          <td>${recipientName}</td>
          <td><strong>סטטוס פרויקט:</strong></td>
          <td class="${summaryData.profit >= 0 ? 'status-good' : 'status-critical'}">
            ${summaryData.profit >= 0 ? 'רווחי 📈' : 'דורש שיפור 📉'}
          </td>
        </tr>
        <tr>
          <td><strong>גרסת דוח:</strong></td>
          <td>מקצועי Pro v2.0</td>
          <td><strong>תאריך עדכון:</strong></td>
          <td>${new Date().toLocaleDateString('he-IL')}</td>
        </tr>
      </table>
    </div>
  `;

  // Financial summary
  html += `
    <div class="pdf-section">
      <h3>📊 ניתוח פיננסי מתקדם</h3>
      <table class="pdf-table financial-table">
        <thead>
          <tr>
            <th>פרט פיננסי</th>
            <th>סכום (₪)</th>
            <th>אחוז מחוזה</th>
            <th>דירוג ביצועים</th>
            <th>ניתוח מקצועי</th>
          </tr>
        </thead>
        <tbody>
  `;

  const financialData = [
    {
      item: '💰 סכום חוזה כולל',
      amount: summaryData.contractAmount,
      percent: '100.0%',
      rating: '⭐ בסיס',
      analysis: 'סכום החוזה המקורי שנחתם'
    },
    {
      item: '✅ הכנסות מצטברות',
      amount: summaryData.totalIncomes,
      percent: `${summaryData.contractAmount > 0 ? ((summaryData.totalIncomes / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
      rating: summaryData.totalIncomes >= summaryData.contractAmount * 0.9 ? '🟢 מעולה' : 
               summaryData.totalIncomes >= summaryData.contractAmount * 0.7 ? '🟡 טוב' : '🔴 נדרש מעקב',
      analysis: summaryData.totalIncomes >= summaryData.contractAmount ? 'גביה הושלמה במלואה' : 'בתהליך גביה פעיל'
    },
    {
      item: '💸 הוצאות מצטברות',
      amount: summaryData.totalExpenses,
      percent: `${summaryData.contractAmount > 0 ? ((summaryData.totalExpenses / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
      rating: summaryData.totalExpenses <= summaryData.contractAmount * 0.8 ? '🟢 מצוין' :
               summaryData.totalExpenses <= summaryData.contractAmount ? '🟡 בגבול' : '🔴 חריגה קריטית!',
      analysis: summaryData.totalExpenses > summaryData.contractAmount ? 'חריגה מתקציב - דורש בדיקה מיידית' : 'ניהול תקציב תקין'
    },
    {
      item: '🎯 רווח/הפסד נקי',
      amount: summaryData.profit,
      percent: `${summaryData.totalIncomes > 0 ? ((summaryData.profit / summaryData.totalIncomes) * 100).toFixed(1) : 0}%`,
      rating: summaryData.profit >= summaryData.contractAmount * 0.15 ? '🟢 רווחיות מעולה' :
               summaryData.profit >= 0 ? '🟡 רווחיות בסיסית' : '🔴 הפסד',
      analysis: summaryData.profit >= 0 ? 'הפרויקט מניב רווח חיובי' : 'הפרויקט בהפסד - נדרש תיקון'
    }
  ];

  financialData.forEach((row, index) => {
    const isAlternating = index % 2 === 1;
    const rowClass = isAlternating ? 'alternating' : '';
    const ratingClass = row.rating.includes('🟢') ? 'status-good' : 
                       row.rating.includes('🟡') ? 'status-warning' : 
                       row.rating.includes('🔴') ? 'status-critical' : '';
    
    html += `
      <tr class="${rowClass}">
        <td class="item-cell">${row.item}</td>
        <td class="currency">${formatCurrency(row.amount)}</td>
        <td class="center">${row.percent}</td>
        <td class="center ${ratingClass}">${row.rating}</td>
        <td class="analysis">${row.analysis}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  // Expenses by categories
  html += `
    <div class="pdf-section">
      <h3>💼 ניתוח הוצאות לפי קטגוריות</h3>
      <table class="pdf-table category-table">
        <thead>
          <tr>
            <th>קטגוריית הוצאה</th>
            <th>סכום (₪)</th>
            <th>אחוז מסך הוצאות</th>
            <th>אחוז מחוזה</th>
            <th>דירוג יעילות</th>
          </tr>
        </thead>
        <tbody>
  `;

  categories.forEach((cat, index) => {
    const categoryAmount = summaryData.expensesByCategory[cat.name] || 0;
    const percentOfExpenses = summaryData.totalExpenses > 0 ? ((categoryAmount / summaryData.totalExpenses) * 100).toFixed(1) : '0.0';
    const percentOfContract = summaryData.contractAmount > 0 ? ((categoryAmount / summaryData.contractAmount) * 100).toFixed(1) : '0.0';
    const efficiency = categoryAmount <= summaryData.contractAmount * 0.2 ? '🟢 יעיל' :
                      categoryAmount <= summaryData.contractAmount * 0.4 ? '🟡 בינוני' : '🔴 גבוה';

    html += `
      <tr class="${index % 2 === 1 ? 'alternating' : ''}">
        <td>${getCategoryIcon(cat.name)} ${cat.name}</td>
        <td class="currency">${formatCurrency(categoryAmount)}</td>
        <td class="center">${percentOfExpenses}%</td>
        <td class="center">${percentOfContract}%</td>
        <td class="center">${efficiency}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  // Suppliers breakdown (if available)
  if (suppliers && suppliers.length > 0) {
    html += `
      <div class="pdf-section">
        <h3>🏢 פירוט הוצאות לפי ספקים</h3>
        <table class="pdf-table supplier-table">
          <thead>
            <tr>
              <th>ספק</th>
              <th>תיאור</th>
              <th>לפני מע"מ (₪)</th>
              <th>כולל מע"מ (₪)</th>
              <th>אחוז מחוזה</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Group expenses by supplier
    const supplierExpenses: { [key: string]: { supplier: Supplier, totalBeforeVat: number, totalWithVat: number } } = {};
    
    project.expenses.forEach(expense => {
      if (expense.supplierId) {
        const supplier = suppliers.find(s => s.id === expense.supplierId);
        if (supplier) {
          if (!supplierExpenses[expense.supplierId]) {
            supplierExpenses[expense.supplierId] = {
              supplier,
              totalBeforeVat: 0,
              totalWithVat: 0
            };
          }
          supplierExpenses[expense.supplierId].totalBeforeVat += expense.amount;
          supplierExpenses[expense.supplierId].totalWithVat += expense.amountWithVat || (expense.amount * 1.18);
        }
      }
    });

    let totalBeforeVat = 0;
    let totalWithVat = 0;

    Object.values(supplierExpenses).forEach((supplierData, index) => {
      totalBeforeVat += supplierData.totalBeforeVat;
      totalWithVat += supplierData.totalWithVat;
      const percentOfContract = summaryData.contractAmount > 0 ? 
        ((supplierData.totalWithVat / summaryData.contractAmount) * 100).toFixed(1) : '0.0';

      html += `
        <tr class="${index % 2 === 1 ? 'alternating' : ''}">
          <td><strong>${supplierData.supplier.name}</strong></td>
          <td>${supplierData.supplier.description || 'ללא תיאור'}</td>
          <td class="currency">${formatCurrency(supplierData.totalBeforeVat)}</td>
          <td class="currency">${formatCurrency(supplierData.totalWithVat)}</td>
          <td class="center">${percentOfContract}%</td>
        </tr>
      `;
    });

    // Summary row
    const vatAmount = totalWithVat - totalBeforeVat;
    html += `
          <tr class="summary-row">
            <td colspan="2"><strong>🎯 סיכום כולל</strong></td>
            <td class="currency"><strong>${formatCurrency(totalBeforeVat)}</strong></td>
            <td class="currency"><strong>${formatCurrency(totalWithVat)}</strong></td>
            <td class="center"><strong>${summaryData.contractAmount > 0 ? ((totalWithVat / summaryData.contractAmount) * 100).toFixed(1) : '0.0'}%</strong></td>
          </tr>
          <tr class="vat-row">
            <td colspan="4"><strong>🧾 סה"כ מע"מ (18%)</strong></td>
            <td class="currency vat-amount"><strong>${formatCurrency(vatAmount)}</strong></td>
          </tr>
    `;

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Income details (if full report)
  if (includeIncomeDetails && project.incomes && project.incomes.length > 0) {
    html += `
      <div class="pdf-section page-break">
        <h3>💰 פירוט הכנסות מלא</h3>
        <table class="pdf-table income-table">
          <thead>
            <tr>
              <th>תאריך הכנסה</th>
              <th>תיאור הכנסה</th>
              <th>סכום (₪)</th>
              <th>אחוז מחוזה</th>
              <th>סטטוס</th>
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
    `;

    let cumulativeIncome = 0;
    project.incomes.forEach((income, index) => {
      cumulativeIncome += income.amount;
      const percentOfContract = summaryData.contractAmount > 0 ? ((income.amount / summaryData.contractAmount) * 100).toFixed(1) : '0.0';
      const cumulativePercent = summaryData.contractAmount > 0 ? ((cumulativeIncome / summaryData.contractAmount) * 100).toFixed(1) : '0.0';
      
      html += `
        <tr class="${index % 2 === 1 ? 'alternating' : ''}">
          <td class="center">${new Date(income.date).toLocaleDateString('he-IL')}</td>
          <td>${income.description}</td>
          <td class="currency">${formatCurrency(income.amount)}</td>
          <td class="center">${percentOfContract}%</td>
          <td class="center status-good">✅ אושר</td>
          <td class="notes">מצטבר: ${formatCurrency(cumulativeIncome)} (${cumulativePercent}%)</td>
        </tr>
      `;
    });

    // Income summary
    html += `
          <tr class="summary-row">
            <td colspan="2"><strong>🎯 סיכום כולל הכנסות</strong></td>
            <td class="currency"><strong>${formatCurrency(summaryData.totalIncomes)}</strong></td>
            <td class="center"><strong>${summaryData.contractAmount > 0 ? ((summaryData.totalIncomes / summaryData.contractAmount) * 100).toFixed(1) : '0.0'}%</strong></td>
            <td class="center"><strong>${summaryData.totalIncomes >= summaryData.contractAmount ? '🟢 הושלם' : '🟡 בתהליך'}</strong></td>
            <td><strong>${project.incomes.length} תשלומים</strong></td>
          </tr>
    `;

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  return html;
};

const getPDFStyles = (): string => `
  .pdf-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 3px solid #1E40AF;
    padding-bottom: 20px;
  }

  .pdf-header h1 {
    color: #1E40AF;
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 10px 0;
  }

  .pdf-header h2 {
    color: #059669;
    font-size: 20px;
    font-weight: bold;
    margin: 15px 0 10px 0;
  }

  .copyright {
    color: #6B7280;
    font-size: 14px;
    margin: 5px 0;
  }

  .project-desc {
    color: #374151;
    font-size: 14px;
    margin: 10px 0;
  }

  .pdf-section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }

  .pdf-section h3 {
    color: #1E40AF;
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 15px 0;
    border-bottom: 2px solid #E5E7EB;
    padding-bottom: 8px;
  }

  .pdf-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 11px;
  }

  .pdf-table th {
    background-color: #1E40AF;
    color: white;
    padding: 10px 8px;
    border: 1px solid #1E40AF;
    font-weight: bold;
    text-align: center;
  }

  .pdf-table td {
    padding: 8px;
    border: 1px solid #E5E7EB;
    vertical-align: middle;
  }

  .pdf-table .alternating {
    background-color: #F9FAFB;
  }

  .currency {
    text-align: left;
    font-weight: bold;
    color: #059669;
    direction: ltr;
  }

  .center {
    text-align: center;
  }

  .item-cell {
    font-weight: bold;
    color: #1E40AF;
  }

  .analysis {
    font-size: 10px;
    color: #6B7280;
  }

  .notes {
    font-size: 10px;
    color: #6B7280;
    font-style: italic;
  }

  .status-good {
    background-color: #D1FAE5;
    color: #047857;
    font-weight: bold;
  }

  .status-warning {
    background-color: #FEF3C7;
    color: #D97706;
    font-weight: bold;
  }

  .status-critical {
    background-color: #FEE2E2;
    color: #DC2626;
    font-weight: bold;
  }

  .summary-row {
    background-color: #F3F4F6;
    font-weight: bold;
  }

  .vat-row {
    background-color: #FEF3C7;
  }

  .vat-amount {
    color: #D97706;
    font-weight: bold;
  }

  .page-break {
    page-break-before: always;
  }

  .info-table td {
    padding: 6px 8px;
  }

  .financial-table th,
  .category-table th,
  .supplier-table th,
  .income-table th {
    font-size: 10px;
  }

  @media print {
    .pdf-section {
      page-break-inside: avoid;
    }
    
    .page-break {
      page-break-before: always;
    }
  }
`;

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getCategoryIcon = (categoryName: string): string => {
  const icons: { [key: string]: string } = {
    'חומרי בנייה': '🧱',
    'קבלני משנה': '👷',
    'חשמל': '⚡',
    'אינסטלציה': '🔧',
    'ציוד': '🔨',
    'הובלה': '🚛',
    'ביטוח': '🛡️',
    'היתרים': '📋',
    'כללי': '📄'
  };
  return icons[categoryName] || '📄';
};
