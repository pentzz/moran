import { Project, Expense, Income, ExportOptions, Category } from '../types';

declare const XLSX: any;

// --- ULTRA PROFESSIONAL STYLES ---
const COLORS = {
  // Primary palette - Professional blues
  PRIMARY_DARK: "0F172A",      // Dark navy for headers
  PRIMARY_BLUE: "1E40AF",      // Royal blue for main elements
  LIGHT_BLUE: "3B82F6",       // Medium blue for sections
  VERY_LIGHT_BLUE: "EFF6FF",  // Very light blue backgrounds
  ACCENT_BLUE: "1D4ED8",       // Accent blue for highlights
  
  // Success colors - Professional greens
  SUCCESS_DARK: "065F46",      // Dark green for strong positive
  SUCCESS_GREEN: "10B981",     // Medium green for positive
  LIGHT_GREEN: "D1FAE5",      // Light green backgrounds
  PROFIT_GREEN: "047857",      // Specific for profit indicators
  
  // Warning colors - Professional yellows/oranges
  WARNING_DARK: "D97706",      // Dark orange for strong warnings
  WARNING_YELLOW: "F59E0B",    // Medium yellow for warnings
  LIGHT_YELLOW: "FEF3C7",     // Light yellow backgrounds
  ALERT_ORANGE: "EA580C",      // Strong alert color
  
  // Danger colors - Professional reds
  DANGER_DARK: "991B1B",       // Dark red for critical issues
  DANGER_RED: "EF4444",        // Medium red for errors
  LIGHT_RED: "FEE2E2",        // Light red backgrounds
  LOSS_RED: "DC2626",          // Specific for loss indicators
  
  // Neutral colors - Professional grays
  CHARCOAL: "1F2937",          // Dark charcoal for text
  DARK_GREY: "374151",         // Medium dark gray
  MEDIUM_GREY: "6B7280",       // Medium gray
  LIGHT_GREY: "F9FAFB",       // Light gray backgrounds
  BORDER_GREY: "E5E7EB",      // Border gray
  WHITE: "FFFFFF",             // Pure white
  
  // Accent colors - Professional highlights
  GOLD: "F59E0B",              // Gold for premium elements
  PURPLE: "7C3AED",            // Purple for special highlights
  TEAL: "0D9488",              // Teal for data visualization
  
  // Company brand colors
  BRAND_PRIMARY: "1E40AF",     // Main brand color
  BRAND_SECONDARY: "0F172A",   // Secondary brand color
  BRAND_ACCENT: "F59E0B"       // Brand accent color
};

// Ultra Professional Borders System
const BORDERS = {
  // Thick borders for major sections
  ULTRA_THICK: { style: "thick", color: { rgb: COLORS.PRIMARY_DARK } },
  THICK_BLUE: { style: "thick", color: { rgb: COLORS.PRIMARY_BLUE } },
  THICK_BRAND: { style: "thick", color: { rgb: COLORS.BRAND_PRIMARY } },
  
  // Medium borders for subsections
  MEDIUM_BLUE: { style: "medium", color: { rgb: COLORS.LIGHT_BLUE } },
  MEDIUM_GREY: { style: "medium", color: { rgb: COLORS.MEDIUM_GREY } },
  MEDIUM_ACCENT: { style: "medium", color: { rgb: COLORS.BRAND_ACCENT } },
  
  // Thin borders for data
  THIN_GREY: { style: "thin", color: { rgb: COLORS.BORDER_GREY } },
  THIN_LIGHT: { style: "thin", color: { rgb: COLORS.LIGHT_GREY } },
  
  // Double borders for special emphasis
  DOUBLE_BLUE: { style: "double", color: { rgb: COLORS.PRIMARY_BLUE } },
  DOUBLE_DARK: { style: "double", color: { rgb: COLORS.PRIMARY_DARK } },
  
  // Dotted borders for subtle separation
  DOT_GREY: { style: "dotted", color: { rgb: COLORS.MEDIUM_GREY } }
};

const BORDER_SETS = {
  // Premium header borders
  HEADER_PREMIUM: { 
    top: BORDERS.ULTRA_THICK, 
    bottom: BORDERS.DOUBLE_BLUE, 
    left: BORDERS.THICK_BLUE, 
    right: BORDERS.THICK_BLUE 
  },
  
  // Section borders
  SECTION_MAIN: { 
    top: BORDERS.THICK_BRAND, 
    bottom: BORDERS.MEDIUM_BLUE, 
    left: BORDERS.MEDIUM_BLUE, 
    right: BORDERS.MEDIUM_BLUE 
  },
  
  // Table header borders
  TABLE_HEADER: { 
    top: BORDERS.MEDIUM_BLUE, 
    bottom: BORDERS.MEDIUM_BLUE, 
    left: BORDERS.THIN_GREY, 
    right: BORDERS.THIN_GREY 
  },
  
  // Data cell borders
  DATA_CELL: { 
    top: BORDERS.THIN_GREY, 
    bottom: BORDERS.THIN_GREY, 
    left: BORDERS.THIN_GREY, 
    right: BORDERS.THIN_GREY 
  },
  
  // Total row borders
  TOTAL_ROW: { 
    top: BORDERS.MEDIUM_ACCENT, 
    bottom: BORDERS.THICK_BRAND, 
    left: BORDERS.MEDIUM_GREY, 
    right: BORDERS.MEDIUM_GREY 
  },
  
  // Special emphasis borders
  EMPHASIS: { 
    top: BORDERS.DOUBLE_DARK, 
    bottom: BORDERS.DOUBLE_DARK, 
    left: BORDERS.THICK_BLUE, 
    right: BORDERS.THICK_BLUE 
  }
};

// Ultra Professional Styles System
const STYLES = {
  // === HEADER STYLES ===
  COMPANY_LOGO_HEADER: {
    font: { sz: 32, bold: true, color: { rgb: COLORS.BRAND_PRIMARY }, name: "Calibri", italic: false },
    fill: { fgColor: { rgb: COLORS.WHITE } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: BORDER_SETS.HEADER_PREMIUM
  },
  
  COMPANY_HEADER: {
    font: { sz: 28, bold: true, color: { rgb: COLORS.PRIMARY_DARK }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.VERY_LIGHT_BLUE } },
    alignment: { horizontal: "right", vertical: "center" },
    border: { bottom: BORDERS.DOUBLE_BLUE, top: BORDERS.THICK_BRAND }
  },
  
  PROJECT_TITLE: {
    font: { sz: 24, bold: true, color: { rgb: COLORS.BRAND_PRIMARY }, name: "Calibri", italic: true },
    fill: { fgColor: { rgb: COLORS.LIGHT_GREY } },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    border: BORDER_SETS.SECTION_MAIN
  },
  
  // === MAIN TITLES ===
  MAIN_TITLE_PREMIUM: {
    font: { sz: 26, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri", shadow: true },
    fill: { fgColor: { rgb: COLORS.PRIMARY_DARK } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: BORDER_SETS.HEADER_PREMIUM
  },
  
  SECTION_TITLE_MAJOR: {
    font: { sz: 20, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.BRAND_PRIMARY } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.SECTION_MAIN
  },
  
  SECTION_TITLE_MINOR: {
    font: { sz: 16, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_BLUE } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.TABLE_HEADER
  },
  
  // === TABLE HEADERS RTL ===
  TABLE_HEADER_PREMIUM: {
    font: { sz: 14, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.PRIMARY_BLUE } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true, readingOrder: 2 },
    border: BORDER_SETS.TABLE_HEADER
  },
  
  TABLE_SUBHEADER: {
    font: { sz: 12, bold: true, color: { rgb: COLORS.CHARCOAL }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.VERY_LIGHT_BLUE } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  // === DATA CELLS RTL ===
  DATA_CELL_PREMIUM: {
    font: { sz: 11, name: "Calibri", color: { rgb: COLORS.CHARCOAL } },
    alignment: { horizontal: "right", vertical: "center", readingOrder: 2 },
    border: BORDER_SETS.DATA_CELL
  },
  
  DATA_CELL_CENTER_PREMIUM: {
    font: { sz: 11, name: "Calibri", color: { rgb: COLORS.CHARCOAL } },
    alignment: { horizontal: "center", vertical: "center", readingOrder: 2 },
    border: BORDER_SETS.DATA_CELL
  },
  
  DATA_CELL_ALTERNATING: {
    font: { sz: 11, name: "Calibri", color: { rgb: COLORS.CHARCOAL } },
    fill: { fgColor: { rgb: COLORS.LIGHT_GREY } },
    alignment: { horizontal: "right", vertical: "center", readingOrder: 2 },
    border: BORDER_SETS.DATA_CELL
  },
  
  // === FINANCIAL DATA RTL ===
  CURRENCY_POSITIVE: {
    font: { sz: 12, bold: true, color: { rgb: COLORS.PROFIT_GREEN }, name: "Calibri" },
    alignment: { horizontal: "right", vertical: "center", readingOrder: 2 },
    border: BORDER_SETS.DATA_CELL
  },
  
  CURRENCY_NEGATIVE: {
    font: { sz: 12, bold: true, color: { rgb: COLORS.LOSS_RED }, name: "Calibri" },
    alignment: { horizontal: "right", vertical: "center", readingOrder: 2 },
    border: BORDER_SETS.DATA_CELL
  },
  
  CURRENCY_NEUTRAL: {
    font: { sz: 12, name: "Calibri", color: { rgb: COLORS.CHARCOAL } },
    alignment: { horizontal: "right", vertical: "center", readingOrder: 2 },
    border: BORDER_SETS.DATA_CELL
  },
  
  // === TOTAL ROWS ===
  TOTAL_ROW_PREMIUM: {
    font: { sz: 14, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.BRAND_PRIMARY } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.TOTAL_ROW
  },
  
  SUBTOTAL_ROW: {
    font: { sz: 12, bold: true, color: { rgb: COLORS.PRIMARY_DARK }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.VERY_LIGHT_BLUE } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  // === PROFIT/LOSS INDICATORS ===
  PROFIT_EXCELLENT: {
    font: { sz: 16, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.SUCCESS_DARK } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.EMPHASIS
  },
  
  PROFIT_GOOD: {
    font: { sz: 14, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.SUCCESS_GREEN } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.TOTAL_ROW
  },
  
  LOSS_CRITICAL: {
    font: { sz: 16, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.DANGER_DARK } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.EMPHASIS
  },
  
  LOSS_WARNING: {
    font: { sz: 14, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.DANGER_RED } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.TOTAL_ROW
  },
  
  // === STATUS INDICATORS ===
  STATUS_EXCELLENT: {
    font: { sz: 11, bold: true, color: { rgb: COLORS.SUCCESS_DARK }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_GREEN } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  STATUS_GOOD: {
    font: { sz: 11, bold: true, color: { rgb: COLORS.SUCCESS_GREEN }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_GREEN } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  STATUS_WARNING: {
    font: { sz: 11, bold: true, color: { rgb: COLORS.WARNING_DARK }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_YELLOW } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  STATUS_CRITICAL: {
    font: { sz: 11, bold: true, color: { rgb: COLORS.DANGER_DARK }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_RED } },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  // === HIGHLIGHT STYLES ===
  HIGHLIGHT_PREMIUM: {
    font: { sz: 13, bold: true, color: { rgb: COLORS.BRAND_PRIMARY }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_YELLOW } },
    alignment: { horizontal: "right", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  HIGHLIGHT_FINANCIAL: {
    font: { sz: 12, bold: true, color: { rgb: COLORS.GOLD }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_YELLOW } },
    alignment: { horizontal: "right", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  // === INFO STYLES ===
  INFO_HEADER: {
    font: { sz: 11, bold: true, color: { rgb: COLORS.MEDIUM_GREY }, name: "Calibri" },
    fill: { fgColor: { rgb: COLORS.LIGHT_GREY } },
    alignment: { horizontal: "right", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  },
  
  INFO_VALUE: {
    font: { sz: 11, name: "Calibri", color: { rgb: COLORS.CHARCOAL } },
    alignment: { horizontal: "right", vertical: "center" },
    border: BORDER_SETS.DATA_CELL
  }
};

// Enhanced RTL formats
const FORMATS = {
  CURRENCY: '[$₪-40D] #,##0;[Red][$₪-40D] -#,##0',
  CURRENCY_RTL: '#,##0 [$₪-40D];[Red]-#,##0 [$₪-40D]',
  PERCENT: '0.00%',
  PERCENT_RTL: '%0.00',
  DATE: 'dd/mm/yyyy',
  DATE_RTL: 'dd/mm/yyyy',
  HEADER_DATE: 'dddd, dd mmmm yyyy',
  HEADER_DATE_RTL: 'dddd, dd mmmm yyyy'
};

// --- ENHANCED HELPER FUNCTIONS ---
const applyCellStyle = (ws: any, cellAddress: string, style: object, type?: string, value?: any, format?: string) => {
  if (!ws[cellAddress]) ws[cellAddress] = { t: 'z' };
  ws[cellAddress].s = style;
  if (type) ws[cellAddress].t = type;
  if (value !== undefined) ws[cellAddress].v = value;
  if (format) ws[cellAddress].z = format;
};

const setRowHeight = (ws: any, rowIndex: number, height: number) => {
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][rowIndex] = { hpt: height };
};

const addMerge = (ws: any, startRow: number, startCol: number, endRow: number, endCol: number) => {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({
    s: { r: startRow, c: startCol },
    e: { r: endRow, c: endCol }
  });
};

// Enhanced RTL table creation with elegant borders
const createRTLTable = (ws: any, startRow: number, headers: string[], data: any[][], options: {
  headerStyle?: any,
  dataStyle?: any,
  alternatingStyle?: any,
  useRTLFormats?: boolean
} = {}) => {
  const { 
    headerStyle = STYLES.TABLE_HEADER_PREMIUM,
    dataStyle = STYLES.DATA_CELL_PREMIUM,
    alternatingStyle = STYLES.DATA_CELL_ALTERNATING,
    useRTLFormats = true
  } = options;

  // Add headers with elegant styling
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: `A${startRow + 1}` });
  for (let col = 0; col < headers.length; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: startRow, c: col });
    applyCellStyle(ws, cellAddr, headerStyle);
  }
  setRowHeight(ws, startRow, 30);

  // Add data with alternating colors and RTL support
  if (data.length > 0) {
    XLSX.utils.sheet_add_aoa(ws, data, { origin: `A${startRow + 2}` });
    
    data.forEach((row, rowIndex) => {
      const actualRow = startRow + 1 + rowIndex;
      const isAlternating = rowIndex % 2 === 1;
      
      row.forEach((_, colIndex) => {
        const cellAddr = XLSX.utils.encode_cell({ r: actualRow, c: colIndex });
        const cellStyle = isAlternating ? alternatingStyle : dataStyle;
        
        // Apply RTL currency formatting for amount columns
        if (useRTLFormats && typeof row[colIndex] === 'number' && 
            (headers[colIndex].includes('סכום') || headers[colIndex].includes('₪'))) {
          applyCellStyle(ws, cellAddr, cellStyle, 'n', row[colIndex], FORMATS.CURRENCY_RTL);
        } else {
          applyCellStyle(ws, cellAddr, cellStyle);
        }
      });
      
      setRowHeight(ws, actualRow, 25);
    });
  }

  return startRow + data.length + 2;
};

const createUltraProfessionalHeader = (ws: any, project: Project, summaryData: any) => {
  // Ultra-professional company header with premium styling
  const headerData = [
    ['🏗️ מערכת ניהול פרויקטים לקבלן | אופיר ברנס', '', '', '', '', ''],
    [project.name, '', '', '', '', ''],
    [project.description || 'תיאור מפורט של הפרויקט', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['תאריך הפקת הדוח:', new Date().toLocaleDateString('he-IL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), '', 'מספר פרויקט:', project.id.slice(-8), ''],
    ['מוכן עבור:', 'ליטל ברנס', '', 'סטטוס פרויקט:', summaryData.profit >= 0 ? 'רווחי 📈' : 'דורש שיפור 📉', ''],
    ['גרסת דוח:', 'מקצועי Pro v2.0', '', 'תאריך עדכון:', new Date().toLocaleDateString('he-IL'), ''],
    ['', '', '', '', '', ''],
  ];

  XLSX.utils.sheet_add_aoa(ws, headerData, { origin: 'A1' });

  // === PREMIUM HEADER STYLING ===
  
  // Company logo header - Row 1
  addMerge(ws, 0, 0, 0, 5);
  applyCellStyle(ws, 'A1', STYLES.COMPANY_LOGO_HEADER);
  setRowHeight(ws, 0, 45);
  
  // Project name - Row 2  
  addMerge(ws, 1, 0, 1, 5);
  applyCellStyle(ws, 'A2', STYLES.PROJECT_TITLE);
  setRowHeight(ws, 1, 35);

  // Project description - Row 3
  addMerge(ws, 2, 0, 2, 5);
  applyCellStyle(ws, 'A3', {
    font: { sz: 14, italic: true, color: { rgb: COLORS.MEDIUM_GREY }, name: "Calibri" },
    alignment: { horizontal: "right", vertical: "center", wrapText: true },
    fill: { fgColor: { rgb: COLORS.LIGHT_GREY } },
    border: BORDER_SETS.DATA_CELL
  });
  setRowHeight(ws, 2, 28);

  // Spacer row
  setRowHeight(ws, 3, 15);

  // === INFO SECTION STYLING ===
  
  // Date row - Row 5
  applyCellStyle(ws, 'A5', STYLES.INFO_HEADER);
  applyCellStyle(ws, 'B5', STYLES.INFO_VALUE, 's', headerData[4][1]);
  applyCellStyle(ws, 'D5', STYLES.INFO_HEADER);
  applyCellStyle(ws, 'E5', STYLES.INFO_VALUE);
  setRowHeight(ws, 4, 25);

  // Status row - Row 6
  applyCellStyle(ws, 'A6', STYLES.INFO_HEADER);
  applyCellStyle(ws, 'B6', STYLES.INFO_VALUE);
  applyCellStyle(ws, 'D6', STYLES.INFO_HEADER);
  
  // Dynamic status styling based on profit
  const statusStyle = summaryData.profit >= 0 ? STYLES.STATUS_EXCELLENT : STYLES.STATUS_CRITICAL;
  applyCellStyle(ws, 'E6', statusStyle);
  setRowHeight(ws, 5, 25);

  // Version row - Row 7
  applyCellStyle(ws, 'A7', STYLES.INFO_HEADER);
  applyCellStyle(ws, 'B7', {
    ...STYLES.INFO_VALUE,
    font: { sz: 11, bold: true, color: { rgb: COLORS.BRAND_ACCENT }, name: "Calibri" }
  });
  applyCellStyle(ws, 'D7', STYLES.INFO_HEADER);
  applyCellStyle(ws, 'E7', STYLES.INFO_VALUE);
  setRowHeight(ws, 6, 25);

  // Final spacer
  setRowHeight(ws, 7, 20);

  return 9; // Return next available row
};

const createUltraFinancialSummarySection = (ws: any, startRow: number, summaryData: any) => {
  // Ultra-premium section title
  XLSX.utils.sheet_add_aoa(ws, [['📊 ניתוח פיננסי מתקדם', '', '', '', '', '']], { origin: `A${startRow}` });
  addMerge(ws, startRow - 1, 0, startRow - 1, 5);
  applyCellStyle(ws, `A${startRow}`, STYLES.SECTION_TITLE_MAJOR);
  setRowHeight(ws, startRow - 1, 40);

  const financialData = [
    ['', '', '', '', '', ''],
    ['📈 פרט פיננסי', 'סכום (₪)', 'אחוז מחוזה', 'דירוג ביצועים', 'ניתוח מקצועי', 'המלצות'],
    ['💰 סכום חוזה כולל', summaryData.contractAmount, '100.0%', '⭐ בסיס', 'סכום החוזה המקורי שנחתם', 'נקודת ייחוס לכל החישובים'],
    ['✅ הכנסות מצטברות', summaryData.totalIncomes, 
     `${summaryData.contractAmount > 0 ? ((summaryData.totalIncomes / summaryData.contractAmount) * 100).toFixed(1) : 0}%`, 
     summaryData.totalIncomes >= summaryData.contractAmount * 0.9 ? '🟢 מעולה' : 
     summaryData.totalIncomes >= summaryData.contractAmount * 0.7 ? '🟡 טוב' : '🔴 נדרש מעקב', 
     summaryData.totalIncomes >= summaryData.contractAmount ? 'גביה הושלמה במלואה' : 'בתהליך גביה פעיל',
     summaryData.totalIncomes < summaryData.contractAmount * 0.5 ? 'יש להאיץ תהליכי גביה' : 'מצב גביה תקין'],
    ['💸 הוצאות מצטברות', summaryData.totalExpenses, 
     `${summaryData.contractAmount > 0 ? ((summaryData.totalExpenses / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
     summaryData.totalExpenses <= summaryData.contractAmount * 0.8 ? '🟢 מצוין' :
     summaryData.totalExpenses <= summaryData.contractAmount ? '🟡 בגבול' : '🔴 חריגה קריטית!', 
     summaryData.totalExpenses > summaryData.contractAmount ? 'חריגה מתקציב - דורש בדיקה מיידית' : 'ניהול תקציב תקין',
     summaryData.totalExpenses > summaryData.contractAmount * 0.9 ? 'בקרת הוצאות מחמירה נדרשת' : 'המשך ניהול זהיר'],
    ['💳 יתרת תקציב נוכחית', summaryData.remainingBudget, 
     `${summaryData.contractAmount > 0 ? ((summaryData.remainingBudget / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
     summaryData.remainingBudget >= summaryData.contractAmount * 0.2 ? '🟢 בריא' :
     summaryData.remainingBudget >= 0 ? '🟡 זהירות' : '🔴 חריגה', 
     summaryData.remainingBudget >= 0 ? 'יתרה חיובית - ניהול תקין' : 'חריגה מתקציב - נדרש תיקון מיידי',
     summaryData.remainingBudget < 0 ? 'צמצום הוצאות דחוף!' : 'ניהול זהיר של יתרת התקציב'],
    ['🎯 רווח/הפסד נקי', summaryData.profit, 
     `${summaryData.totalIncomes > 0 ? ((summaryData.profit / summaryData.totalIncomes) * 100).toFixed(1) : 0}%`, 
     summaryData.profit >= summaryData.contractAmount * 0.15 ? '🟢 רווחיות מעולה' :
     summaryData.profit >= 0 ? '🟡 רווחיות בסיסית' : '🔴 הפסד', 
     summaryData.profit >= 0 ? 'הפרויקט מניב רווח חיובי' : 'הפרויקט בהפסד - נדרש תיקון',
     summaryData.profit < 0 ? 'ניתוח מחדש של עלויות והכנסות' : 'המשך הניהול הנוכחי'],
    ['📊 שולי רווח %', 0, `${summaryData.profitMargin.toFixed(2)}%`, 
     summaryData.profitMargin >= 20 ? '🟢 יוצא דופן' :
     summaryData.profitMargin >= 15 ? '🟢 מעולה' : 
     summaryData.profitMargin >= 10 ? '🟡 טוב' :
     summaryData.profitMargin >= 5 ? '🟡 בסיסי' : '🔴 נמוך מדי', 
     summaryData.profitMargin >= 15 ? 'ביצועים יוצאי דופן בתחום' : 
     summaryData.profitMargin >= 5 ? 'ביצועים סבירים בתחום' : 'ביצועים מתחת לממוצע',
     summaryData.profitMargin < 10 ? 'חיפוש דרכים להגדלת יעילות' : 'שמירה על רמת הביצועים']
  ];

  XLSX.utils.sheet_add_aoa(ws, financialData, { origin: `A${startRow + 1}` });

  // === PREMIUM TABLE STYLING ===
  
  // Enhanced table headers
  const headerRow = startRow + 2;
  for (let col = 0; col < 6; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
    applyCellStyle(ws, cellAddr, STYLES.TABLE_HEADER_PREMIUM);
  }
  setRowHeight(ws, headerRow - 1, 30);

  // === DATA ROWS WITH PREMIUM STYLING ===
  for (let row = 0; row < financialData.length - 2; row++) {
    const actualRow = headerRow + row;
    const isAlternating = row % 2 === 1;
    
    // Column A - Item description with icons
    applyCellStyle(ws, `A${actualRow + 1}`, STYLES.HIGHLIGHT_PREMIUM);
    
    // Column B - Currency amounts with conditional coloring
    const amount = financialData[row + 2][1];
    let currencyStyle;
    if (row === 5) { // Profit row
      currencyStyle = summaryData.profit >= 0 ? STYLES.CURRENCY_POSITIVE : STYLES.CURRENCY_NEGATIVE;
    } else if (row === 4) { // Remaining budget
      currencyStyle = summaryData.remainingBudget >= 0 ? STYLES.CURRENCY_POSITIVE : STYLES.CURRENCY_NEGATIVE;
    } else {
      currencyStyle = STYLES.CURRENCY_NEUTRAL;
    }
    applyCellStyle(ws, `B${actualRow + 1}`, currencyStyle, 'n', amount, FORMATS.CURRENCY_RTL);
    
    // Column C - Percentages
    const percentStyle = isAlternating ? STYLES.DATA_CELL_ALTERNATING : STYLES.DATA_CELL_CENTER_PREMIUM;
    applyCellStyle(ws, `C${actualRow + 1}`, percentStyle);
    
    // Column D - Performance rating with emoji indicators
    const rating = financialData[row + 2][3];
    let ratingStyle;
    if (rating.includes('🟢')) {
      ratingStyle = STYLES.STATUS_EXCELLENT;
    } else if (rating.includes('🟡')) {
      ratingStyle = STYLES.STATUS_WARNING;
    } else if (rating.includes('🔴')) {
      ratingStyle = STYLES.STATUS_CRITICAL;
    } else {
      ratingStyle = STYLES.STATUS_GOOD;
    }
    applyCellStyle(ws, `D${actualRow + 1}`, ratingStyle);
    
    // Column E - Analysis
    const analysisStyle = isAlternating ? STYLES.DATA_CELL_ALTERNATING : STYLES.DATA_CELL_PREMIUM;
    applyCellStyle(ws, `E${actualRow + 1}`, analysisStyle);
    
    // Column F - Recommendations
    applyCellStyle(ws, `F${actualRow + 1}`, {
      ...STYLES.INFO_VALUE,
      font: { sz: 10, italic: true, color: { rgb: COLORS.MEDIUM_GREY }, name: "Calibri" }
    });
    
    setRowHeight(ws, actualRow, 35);
  }

  // === SPECIAL EMPHASIS FOR PROFIT ROW ===
  const profitRowIndex = headerRow + 5;
  const profitAmount = summaryData.profit;
  
  if (profitAmount >= summaryData.contractAmount * 0.15) {
    applyCellStyle(ws, `B${profitRowIndex + 1}`, STYLES.PROFIT_EXCELLENT, 'n', profitAmount, FORMATS.CURRENCY_RTL);
  } else if (profitAmount >= 0) {
    applyCellStyle(ws, `B${profitRowIndex + 1}`, STYLES.PROFIT_GOOD, 'n', profitAmount, FORMATS.CURRENCY_RTL);
  } else if (profitAmount >= summaryData.contractAmount * -0.1) {
    applyCellStyle(ws, `B${profitRowIndex + 1}`, STYLES.LOSS_WARNING, 'n', profitAmount, FORMATS.CURRENCY_RTL);
  } else {
    applyCellStyle(ws, `B${profitRowIndex + 1}`, STYLES.LOSS_CRITICAL, 'n', profitAmount, FORMATS.CURRENCY_RTL);
  }

  return startRow + financialData.length + 3;
};

const createEnhancedSheet = (title: string, headers: string[], data: any[][], colWidths: number[], isRTL: boolean = true) => {
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Set RTL direction and enhanced column widths
  ws['!view'] = { rightToLeft: isRTL };
  ws['!cols'] = colWidths.map(wch => ({ wch }));

  // Add enhanced title with professional styling
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
  const titleColSpan = headers.length - 1;
  addMerge(ws, 0, 0, 0, titleColSpan);
  applyCellStyle(ws, 'A1', STYLES.MAIN_TITLE_PREMIUM);
  setRowHeight(ws, 0, 35);

  // Add spacing row
  XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A2' });

  // Add headers with enhanced styling
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' });
  for (let col = 0; col < headers.length; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 2, c: col });
    applyCellStyle(ws, cellAddr, STYLES.TABLE_HEADER_PREMIUM);
  }
  setRowHeight(ws, 2, 25);

  // Add data with alternating row colors and enhanced styling
  if (data.length > 0) {
    XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A4' });
    
    // Style data rows with professional alternating colors
    for (let row = 0; row < data.length; row++) {
      const actualRow = row + 3;
      const isEvenRow = row % 2 === 0;
      
      for (let col = 0; col < headers.length; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: actualRow, c: col });
        let cellStyle: any = isEvenRow ? STYLES.DATA_CELL_PREMIUM : STYLES.DATA_CELL_ALTERNATING;
        
        applyCellStyle(ws, cellAddr, cellStyle);
      }
      setRowHeight(ws, actualRow, 20);
    }

    // Add enhanced autofilter
    ws['!autofilter'] = { 
      ref: XLSX.utils.encode_range({
        s: { c: 0, r: 2 }, 
        e: { c: headers.length - 1, r: data.length + 2 }
      })
    };
  }

  return ws;
};

// Helper function to get category icons
const getCategoryIcon = (categoryName: string): string => {
  if (categoryName.includes('חומרי בנייה') || categoryName.includes('חומרים')) return '🧱';
  if (categoryName.includes('קבלני משנה') || categoryName.includes('קבלן')) return '👷';
  if (categoryName.includes('חשמל') || categoryName.includes('חשמלאי')) return '⚡';
  if (categoryName.includes('אינסטלציה') || categoryName.includes('צנרות')) return '🔧';
  if (categoryName.includes('גימור') || categoryName.includes('צבע')) return '🎨';
  if (categoryName.includes('ציוד') || categoryName.includes('כלים')) return '🛠️';
  if (categoryName.includes('תחבורה') || categoryName.includes('משלוח')) return '🚛';
  if (categoryName.includes('רישיונות') || categoryName.includes('היתר')) return '📋';
  return '📦'; // Default icon
};

// --- MAIN ENHANCED EXPORT FUNCTION ---
export const exportToExcel = (project: Project, summaryData: any, categories: Category[], options: ExportOptions, suppliers?: any[]) => {
  // Ask user for whom the report is being generated
  const recipientName = prompt('עבור מי הדוח מונפק?', 'ליטל ברנס') || 'ליטל ברנס';
  
  // Create HTML Excel format like the example for perfect RTL support
  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\./g, '-');
  
  const timeStr = now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/:/g, '-');
  
  const profitStatus = summaryData.profit >= 0 ? 'רווח' : 'הפסד';
  const filename = `🏗️_דוח_פרימיום_${project.name.replace(/[\/\\:*?"<>|]/g, "_")}_${recipientName.replace(/[\/\\:*?"<>|]/g, "_")}_${profitStatus}_${dateStr}_${timeStr}.xls`;

  // Create HTML content for Excel
  let htmlContent = createHTMLExcelContent(project, summaryData, categories, options, recipientName, suppliers);

  // Create blob and download
  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.ms-excel;charset=UTF-8' 
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Create HTML Excel content with perfect RTL styling
const createHTMLExcelContent = (project: Project, summaryData: any, categories: Category[], options: ExportOptions, recipientName: string, suppliers?: any[]): string => {
  // BOM for UTF-8 recognition in Excel
  let content = '\ufeff';
  
  // HTML structure with RTL support
  content += '<!DOCTYPE html>\n';
  content += '<html dir="rtl">\n';
  content += '<head>\n';
  content += '<meta charset="UTF-8">\n';
  content += '<style>\n';
  content += `
    @page { 
      size: A4; 
      margin: 2cm; 
    }
    body { 
      direction: rtl; 
      font-family: 'Segoe UI', Arial, sans-serif; 
      margin: 0; 
      padding: 20px; 
      width: 210mm;
      max-width: 794px;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      direction: rtl; 
      margin-bottom: 20px;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 10px; 
      text-align: right; 
      vertical-align: middle;
      font-size: 12px;
    }
    .header { 
      background-color: #1E40AF; 
      color: white; 
      font-weight: bold; 
      text-align: center; 
      font-size: 16px;
      padding: 15px;
    }
    .company-header {
      background-color: #0F172A;
      color: white;
      font-weight: bold;
      text-align: center;
      font-size: 18px;
      padding: 20px;
    }
    .section-title { 
      background-color: #3B82F6; 
      color: white;
      font-weight: bold; 
      text-align: center; 
      font-size: 14px;
      padding: 12px;
    }
    .subheader { 
      background-color: #EFF6FF; 
      font-weight: bold; 
      color: #1E40AF;
    }
    .total { 
      background-color: #F59E0B; 
      color: white;
      font-weight: bold; 
      text-align: center;
      font-size: 14px;
    }
    .profit { 
      background-color: #10B981; 
      color: white;
      font-weight: bold; 
      text-align: center;
    }
    .loss { 
      background-color: #EF4444; 
      color: white;
      font-weight: bold; 
      text-align: center;
    }
    .overtime { 
      background-color: #FEE2E2; 
      color: #991B1B;
    }
    .info-row {
      background-color: #F9FAFB;
      color: #374151;
    }
    .alternating {
      background-color: #F9FAFB;
    }
    .currency {
      text-align: right;
      font-weight: bold;
    }
    .status-good {
      background-color: #D1FAE5;
      color: #065F46;
      font-weight: bold;
    }
    .status-warning {
      background-color: #FEF3C7;
      color: #D97706;
      font-weight: bold;
    }
    .status-critical {
      background-color: #FEE2E2;
      color: #991B1B;
      font-weight: bold;
    }
  `;
  content += '</style>\n';
  content += '</head>\n';
  content += '<body>\n';

  // Add main summary content
  content += createHTMLSummarySection(project, summaryData, categories, recipientName, suppliers, options.includeIncomes);

  content += '</body>\n';
  content += '</html>';

  return content;
};

// Create HTML summary section
const createHTMLSummarySection = (project: Project, summaryData: any, categories: Category[], recipientName: string, suppliers?: any[], includeIncomeDetails?: boolean): string => {
  let html = '';

  // Company header
  html += '<table>\n';
  html += `<tr><td colspan="6" class="company-header">🏗️ מערכת ניהול פרויקטים לקבלן | זכויות יוצרים ליטל ביטון</td></tr>\n`;
  html += `<tr><td colspan="6" class="header">דוח פרימיום - ${project.name}</td></tr>\n`;
  html += `<tr><td colspan="6" class="info-row" style="text-align: center;">${project.description || 'תיאור הפרויקט'}</td></tr>\n`;
  html += '<tr><td colspan="6">&nbsp;</td></tr>\n';
  html += '</table>\n';

  // Project info section
  html += '<table>\n';
  html += '<tr><td colspan="4" class="section-title">פרטי פרויקט</td></tr>\n';
  html += `<tr><td class="subheader">תאריך הפקת הדוח:</td><td>${new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</td><td class="subheader">שם פרויקט:</td><td>${project.name}</td></tr>\n`;
  html += `<tr><td class="subheader">מוכן עבור:</td><td>${recipientName}</td><td class="subheader">סטטוס פרויקט:</td><td class="${summaryData.profit >= 0 ? 'status-good' : 'status-critical'}">${summaryData.profit >= 0 ? 'רווחי 📈' : 'דורש שיפור 📉'}</td></tr>\n`;
  html += `<tr><td class="subheader">גרסת דוח:</td><td>מקצועי Pro v2.0</td><td class="subheader">תאריך עדכון:</td><td>${new Date().toLocaleDateString('he-IL')}</td></tr>\n`;
  html += '<tr><td colspan="4">&nbsp;</td></tr>\n';
  html += '</table>\n';

  // Financial summary section
  html += '<table>\n';
  html += '<tr><td colspan="6" class="section-title">📊 ניתוח פיננסי מתקדם</td></tr>\n';
  html += '<tr class="header">\n';
  html += '<th>📈 פרט פיננסי</th><th>סכום (₪)</th><th>אחוז מחוזה</th><th>דירוג ביצועים</th><th>ניתוח מקצועי</th><th>המלצות</th>\n';
  html += '</tr>\n';

  // Financial data rows
  const financialData = [
    {
      item: '💰 סכום חוזה כולל',
      amount: summaryData.contractAmount,
      percent: '100.0%',
      rating: '⭐ בסיס',
      analysis: 'סכום החוזה המקורי שנחתם',
      recommendation: 'נקודת ייחוס לכל החישובים'
    },
    {
      item: '✅ הכנסות מצטברות',
      amount: summaryData.totalIncomes,
      percent: `${summaryData.contractAmount > 0 ? ((summaryData.totalIncomes / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
      rating: summaryData.totalIncomes >= summaryData.contractAmount * 0.9 ? '🟢 מעולה' : 
               summaryData.totalIncomes >= summaryData.contractAmount * 0.7 ? '🟡 טוב' : '🔴 נדרש מעקב',
      analysis: summaryData.totalIncomes >= summaryData.contractAmount ? 'גביה הושלמה במלואה' : 'בתהליך גביה פעיל',
      recommendation: summaryData.totalIncomes < summaryData.contractAmount * 0.5 ? 'יש להאיץ תהליכי גביה' : 'מצב גביה תקין'
    },
    {
      item: '💸 הוצאות מצטברות',
      amount: summaryData.totalExpenses,
      percent: `${summaryData.contractAmount > 0 ? ((summaryData.totalExpenses / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
      rating: summaryData.totalExpenses <= summaryData.contractAmount * 0.8 ? '🟢 מצוין' :
               summaryData.totalExpenses <= summaryData.contractAmount ? '🟡 בגבול' : '🔴 חריגה קריטית!',
      analysis: summaryData.totalExpenses > summaryData.contractAmount ? 'חריגה מתקציב - דורש בדיקה מיידית' : 'ניהול תקציב תקין',
      recommendation: summaryData.totalExpenses > summaryData.contractAmount * 0.9 ? 'בקרת הוצאות מחמירה נדרשת' : 'המשך ניהול זהיר'
    },
    {
      item: '🎯 רווח/הפסד נקי',
      amount: summaryData.profit,
      percent: `${summaryData.totalIncomes > 0 ? ((summaryData.profit / summaryData.totalIncomes) * 100).toFixed(1) : 0}%`,
      rating: summaryData.profit >= summaryData.contractAmount * 0.15 ? '🟢 רווחיות מעולה' :
               summaryData.profit >= 0 ? '🟡 רווחיות בסיסית' : '🔴 הפסד',
      analysis: summaryData.profit >= 0 ? 'הפרויקט מניב רווח חיובי' : 'הפרויקט בהפסד - נדרש תיקון',
      recommendation: summaryData.profit < 0 ? 'ניתוח מחדש של עלויות והכנסות' : 'המשך הניהול הנוכחי'
    }
  ];

  financialData.forEach((row, index) => {
    const isAlternating = index % 2 === 1;
    const rowClass = isAlternating ? 'alternating' : '';
    const ratingClass = row.rating.includes('🟢') ? 'status-good' : 
                       row.rating.includes('🟡') ? 'status-warning' : 
                       row.rating.includes('🔴') ? 'status-critical' : '';
    
    html += `<tr class="${rowClass}">\n`;
    html += `<td style="font-weight: bold; color: #1E40AF;">${row.item}</td>\n`;
    html += `<td class="currency">${formatCurrency(row.amount)}</td>\n`;
    html += `<td style="text-align: center;">${row.percent}</td>\n`;
    html += `<td class="${ratingClass}" style="text-align: center;">${row.rating}</td>\n`;
    html += `<td>${row.analysis}</td>\n`;
    html += `<td style="font-style: italic; color: #6B7280;">${row.recommendation}</td>\n`;
    html += '</tr>\n';
  });

  html += '</table>\n';

  // Expense breakdown by categories
  html += '<table>\n';
  html += '<tr><td colspan="6" class="section-title">💼 ניתוח הוצאות מתקדם לפי קטגוריות</td></tr>\n';
  html += '<tr class="header">\n';
  html += '<th>🏷️ קטגוריית הוצאה</th><th>סכום (₪)</th><th>אחוז מסך הוצאות</th><th>אחוז מחוזה</th><th>דירוג יעילות</th><th>המלצות לשיפור</th>\n';
  html += '</tr>\n';

  // Add category data
  categories.forEach((cat, index) => {
    const categoryAmount = summaryData.expensesByCategory[cat.name] || 0;
    if (categoryAmount > 0) {
      const percentOfTotal = summaryData.totalExpenses > 0 ? (categoryAmount / summaryData.totalExpenses * 100) : 0;
      const percentOfContract = summaryData.contractAmount > 0 ? (categoryAmount / summaryData.contractAmount * 100) : 0;
      
      let efficiencyRating = '';
      let recommendation = '';
      let ratingClass = '';
      
      if (percentOfContract > 40) {
        efficiencyRating = '🔴 קריטי - חריגה חמורה';
        recommendation = 'בדיקה מיידית של העלויות ומו"מ עם ספקים';
        ratingClass = 'status-critical';
      } else if (percentOfContract > 30) {
        efficiencyRating = '🟠 גבוה - נדרש מעקב';
        recommendation = 'ניתוח מחירים והשוואת ספקים חלופיים';
        ratingClass = 'status-warning';
      } else if (percentOfContract > 20) {
        efficiencyRating = '🟡 בינוני - ניתן לשפר';
        recommendation = 'חיפוש דרכים להפחתת עלויות';
        ratingClass = 'status-warning';
      } else if (percentOfContract > 10) {
        efficiencyRating = '🟢 טוב - יעיל';
        recommendation = 'המשך הניהול הנוכחי';
        ratingClass = 'status-good';
      } else {
        efficiencyRating = '🟢 מעולה - חסכוני';
        recommendation = 'שמירה על רמת היעילות הנוכחית';
        ratingClass = 'status-good';
      }
      
      const isAlternating = index % 2 === 1;
      const rowClass = isAlternating ? 'alternating' : '';
      
      html += `<tr class="${rowClass}">\n`;
      html += `<td style="font-weight: bold;">${getCategoryIcon(cat.name)} ${cat.name}</td>\n`;
      html += `<td class="currency">${formatCurrency(categoryAmount)}</td>\n`;
      html += `<td style="text-align: center;">${percentOfTotal.toFixed(1)}%</td>\n`;
      html += `<td style="text-align: center;">${percentOfContract.toFixed(1)}%</td>\n`;
      html += `<td class="${ratingClass}" style="text-align: center;">${efficiencyRating}</td>\n`;
      html += `<td style="font-style: italic; color: #6B7280;">${recommendation}</td>\n`;
      html += '</tr>\n';
    }
  });

  // Total row for expenses
  const totalRating = summaryData.totalExpenses <= summaryData.contractAmount ? '🟢 בתקציב' : '🔴 חריגה';
  const totalRecommendation = summaryData.totalExpenses > summaryData.contractAmount ? 'צמצום הוצאות דרוש' : 'ניהול תקציב מצוין';
  const totalRatingClass = summaryData.totalExpenses <= summaryData.contractAmount ? 'status-good' : 'status-critical';

  html += `<tr class="total">\n`;
  html += `<td>📊 סה"כ כל ההוצאות</td>\n`;
  html += `<td class="currency">${formatCurrency(summaryData.totalExpenses)}</td>\n`;
  html += `<td style="text-align: center;">100.0%</td>\n`;
  html += `<td style="text-align: center;">${summaryData.contractAmount > 0 ? ((summaryData.totalExpenses / summaryData.contractAmount) * 100).toFixed(1) : 0}%</td>\n`;
  html += `<td class="${totalRatingClass}" style="text-align: center;">${totalRating}</td>\n`;
  html += `<td style="font-weight: bold;">${totalRecommendation}</td>\n`;
  html += '</tr>\n';
  html += '</table>\n';

  // Suppliers breakdown section
  if (suppliers && suppliers.length > 0) {
    html += '<br><br>\n';
    html += '<table>\n';
    html += '<tr><td colspan="4" class="section-title">📋 פירוט הוצאות לפי ספקים</td></tr>\n';
    html += '<tr>\n';
    html += '<td class="subheader">שם ספק</td>\n';
    html += '<td class="subheader">תיאור הספק</td>\n';
    html += '<td class="subheader">סכום לפני מע"מ</td>\n';
    html += '<td class="subheader">סכום כולל מע"מ</td>\n';
    html += '</tr>\n';

    // Group expenses by supplier
    const supplierExpenses = new Map();
    project.expenses.forEach(expense => {
      const supplierId = expense.supplierId || 'unknown';
      const supplier = suppliers.find(s => s.id === supplierId) || { name: expense.supplier, description: '' };
      
      if (!supplierExpenses.has(supplierId)) {
        supplierExpenses.set(supplierId, {
          supplier: supplier,
          totalAmount: 0,
          totalAmountWithVat: 0,
          expenses: []
        });
      }
      
      const supplierData = supplierExpenses.get(supplierId);
      supplierData.totalAmount += expense.amount;
      supplierData.totalAmountWithVat += expense.amountWithVat || expense.amount;
      supplierData.expenses.push(expense);
    });

    let totalBeforeVat = 0;
    let totalWithVat = 0;

    // Display supplier data
    Array.from(supplierExpenses.values()).forEach((supplierData, index) => {
      const rowClass = index % 2 === 0 ? 'alternating' : '';
      totalBeforeVat += supplierData.totalAmount;
      totalWithVat += supplierData.totalAmountWithVat;
      
      html += `<tr class="${rowClass}">\n`;
      html += `<td style="font-weight: bold;">${supplierData.supplier.name}</td>\n`;
      html += `<td>${supplierData.supplier.description || '-'}</td>\n`;
      html += `<td class="currency">${formatCurrency(supplierData.totalAmount)}</td>\n`;
      html += `<td class="currency">${formatCurrency(supplierData.totalAmountWithVat)}</td>\n`;
      html += '</tr>\n';
    });

    // Total row for suppliers
    html += '<tr class="total">\n';
    html += '<td colspan="2" style="text-align: center; font-weight: bold;">💰 סה"כ כלל הספקים</td>\n';
    html += `<td class="currency">${formatCurrency(totalBeforeVat)}</td>\n`;
    html += `<td class="currency">${formatCurrency(totalWithVat)}</td>\n`;
    html += '</tr>\n';

    // VAT difference row
    const vatDifference = totalWithVat - totalBeforeVat;
    html += '<tr class="info-row">\n';
    html += '<td colspan="2" style="text-align: center; font-weight: bold;">🧾 סה"כ מע"מ (18%)</td>\n';
    html += '<td colspan="2" class="currency" style="background-color: #FEF3C7; color: #D97706; font-weight: bold;">';
    html += `${formatCurrency(vatDifference)}</td>\n`;
    html += '</tr>\n';
    
    html += '</table>\n';
  }

  // Income details section (only for full report)
  if (includeIncomeDetails && project.incomes && project.incomes.length > 0) {
    html += '<br><br>\n';
    html += '<table>\n';
    html += '<tr><td colspan="6" class="section-title">💰 פירוט הכנסות מלא</td></tr>\n';
    html += '<tr class="header">\n';
    html += '<th>📅 תאריך הכנסה</th><th>📝 תיאור הכנסה</th><th>💵 סכום (₪)</th><th>📊 אחוז מחוזה</th><th>🔄 סטטוס</th><th>📋 הערות</th>\n';
    html += '</tr>\n';

    let cumulativeIncome = 0;
    project.incomes.forEach((income, index) => {
      const isAlternating = index % 2 === 1;
      const rowClass = isAlternating ? 'alternating' : '';
      cumulativeIncome += income.amount;
      const percentOfContract = summaryData.contractAmount > 0 ? ((income.amount / summaryData.contractAmount) * 100).toFixed(1) : '0.0';
      const cumulativePercent = summaryData.contractAmount > 0 ? ((cumulativeIncome / summaryData.contractAmount) * 100).toFixed(1) : '0.0';
      
      html += `<tr class="${rowClass}">\n`;
      html += `<td style="text-align: center;">${new Date(income.date).toLocaleDateString('he-IL')}</td>\n`;
      html += `<td>${income.description}</td>\n`;
      html += `<td class="currency">${formatCurrency(income.amount)}</td>\n`;
      html += `<td style="text-align: center;">${percentOfContract}%</td>\n`;
      html += `<td class="status-good" style="text-align: center;">✅ אושר</td>\n`;
      html += `<td style="font-size: 11px; color: #6B7280;">מצטבר: ${formatCurrency(cumulativeIncome)} (${cumulativePercent}%)</td>\n`;
      html += '</tr>\n';
    });

    // Income summary row
    html += '<tr class="header">\n';
    html += '<td colspan="2" style="font-weight: bold;">🎯 סיכום כולל הכנסות</td>\n';
    html += `<td class="currency" style="font-weight: bold;">${formatCurrency(summaryData.totalIncomes)}</td>\n`;
    html += `<td style="text-align: center; font-weight: bold;">${summaryData.contractAmount > 0 ? ((summaryData.totalIncomes / summaryData.contractAmount) * 100).toFixed(1) : '0.0'}%</td>\n`;
    html += `<td style="text-align: center; font-weight: bold;">${summaryData.totalIncomes >= summaryData.contractAmount ? '🟢 הושלם' : '🟡 בתהליך'}</td>\n`;
    html += `<td style="font-weight: bold;">${project.incomes.length} תשלומים</td>\n`;
    html += '</tr>\n';
    
    html += '</table>\n';
  }

  return html;
};

// Helper function to format currency in Hebrew style
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('₪', '') + ' ₪';
};

// Legacy XLSX function (keep for compatibility)
const createLegacyXLSXExport = (project: Project, summaryData: any, categories: Category[], options: ExportOptions) => {
  const wb = XLSX.utils.book_new();

  // --- ULTRA PREMIUM SUMMARY SHEET ---
  if (options.includeSummary) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    ws['!view'] = { rightToLeft: true };
    // Enhanced column widths for premium layout
    ws['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 35 }, { wch: 25 }];

    // Create ultra-professional header
    let currentRow = createUltraProfessionalHeader(ws, project, summaryData);

    // Add ultra-premium financial summary
    currentRow = createUltraFinancialSummarySection(ws, currentRow + 1, summaryData);

    // Add ultra-premium expense breakdown section
    XLSX.utils.sheet_add_aoa(ws, [['💼 ניתוח הוצאות מתקדם לפי קטגוריות', '', '', '', '', '']], { origin: `A${currentRow + 1}` });
    addMerge(ws, currentRow, 0, currentRow, 5);
    applyCellStyle(ws, `A${currentRow + 1}`, STYLES.SECTION_TITLE_MINOR);
    setRowHeight(ws, currentRow, 35);

    const expenseBreakdown = [
      ['', '', '', '', '', ''],
      ['🏷️ קטגוריית הוצאה', 'סכום (₪)', 'אחוז מסך הוצאות', 'אחוז מחוזה', 'דירוג יעילות', 'המלצות לשיפור'],
    ];

    // Add expense categories with enhanced analysis
    categories.forEach(cat => {
      const categoryAmount = summaryData.expensesByCategory[cat.name] || 0;
      if (categoryAmount > 0) {
        const percentOfTotal = summaryData.totalExpenses > 0 ? (categoryAmount / summaryData.totalExpenses * 100) : 0;
        const percentOfContract = summaryData.contractAmount > 0 ? (categoryAmount / summaryData.contractAmount * 100) : 0;
        
        let efficiencyRating = '';
        let recommendation = '';
        
        if (percentOfContract > 40) {
          efficiencyRating = '🔴 קריטי - חריגה חמורה';
          recommendation = 'בדיקה מיידית של העלויות ומו"מ עם ספקים';
        } else if (percentOfContract > 30) {
          efficiencyRating = '🟠 גבוה - נדרש מעקב';
          recommendation = 'ניתוח מחירים והשוואת ספקים חלופיים';
        } else if (percentOfContract > 20) {
          efficiencyRating = '🟡 בינוני - ניתן לשפר';
          recommendation = 'חיפוש דרכים להפחתת עלויות';
        } else if (percentOfContract > 10) {
          efficiencyRating = '🟢 טוב - יעיל';
          recommendation = 'המשך הניהול הנוכחי';
        } else {
          efficiencyRating = '🟢 מעולה - חסכוני';
          recommendation = 'שמירה על רמת היעילות הנוכחית';
        }
        
        expenseBreakdown.push([
          `${getCategoryIcon(cat.name)} ${cat.name}`,
          categoryAmount,
          `${percentOfTotal.toFixed(1)}%`,
          `${percentOfContract.toFixed(1)}%`,
          efficiencyRating,
          recommendation
        ]);
      }
    });

    // Add total row
    expenseBreakdown.push([
      '📊 סה"כ כל ההוצאות',
      summaryData.totalExpenses,
      '100.0%',
      `${summaryData.contractAmount > 0 ? ((summaryData.totalExpenses / summaryData.contractAmount) * 100).toFixed(1) : 0}%`,
      summaryData.totalExpenses <= summaryData.contractAmount ? '🟢 בתקציב' : '🔴 חריגה',
      summaryData.totalExpenses > summaryData.contractAmount ? 'צמצום הוצאות דרוש' : 'ניהול תקציב מצוין'
    ]);

    XLSX.utils.sheet_add_aoa(ws, expenseBreakdown, { origin: `A${currentRow + 2}` });

    // === PREMIUM EXPENSE TABLE STYLING ===
    
    const expenseHeaderRow = currentRow + 3;
    for (let col = 0; col < 6; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: expenseHeaderRow - 1, c: col });
      applyCellStyle(ws, cellAddr, STYLES.TABLE_HEADER_PREMIUM);
    }
    setRowHeight(ws, expenseHeaderRow - 1, 30);

    // Style expense data with ultra-premium conditional formatting
    for (let row = 2; row < expenseBreakdown.length; row++) {
      const actualRow = expenseHeaderRow + row - 2;
      const isTotal = row === expenseBreakdown.length - 1;
      const isAlternating = row % 2 === 1;
      
      // Column A - Category with icons
      const categoryStyle = isTotal ? STYLES.TOTAL_ROW_PREMIUM : 
                          isAlternating ? STYLES.DATA_CELL_ALTERNATING : STYLES.HIGHLIGHT_PREMIUM;
      applyCellStyle(ws, `A${actualRow + 1}`, categoryStyle);
      
      // Column B - Amount with special styling for total
      const amountStyle = isTotal ? STYLES.TOTAL_ROW_PREMIUM : STYLES.CURRENCY_NEUTRAL;
      applyCellStyle(ws, `B${actualRow + 1}`, amountStyle, 'n', expenseBreakdown[row][1], FORMATS.CURRENCY_RTL);
      
      // Column C & D - Percentages
      const percentStyle = isTotal ? STYLES.TOTAL_ROW_PREMIUM : 
                          isAlternating ? STYLES.DATA_CELL_ALTERNATING : STYLES.DATA_CELL_CENTER_PREMIUM;
      applyCellStyle(ws, `C${actualRow + 1}`, percentStyle);
      applyCellStyle(ws, `D${actualRow + 1}`, percentStyle);
      
      // Column E - Efficiency rating with conditional colors
      const rating = expenseBreakdown[row][4];
      let ratingStyle;
      if (rating.includes('🔴') || rating.includes('קריטי')) {
        ratingStyle = STYLES.STATUS_CRITICAL;
      } else if (rating.includes('🟠') || rating.includes('🟡')) {
        ratingStyle = STYLES.STATUS_WARNING;
      } else if (rating.includes('🟢')) {
        ratingStyle = isTotal ? STYLES.TOTAL_ROW_PREMIUM : STYLES.STATUS_EXCELLENT;
      } else {
        ratingStyle = isTotal ? STYLES.TOTAL_ROW_PREMIUM : STYLES.STATUS_GOOD;
      }
      applyCellStyle(ws, `E${actualRow + 1}`, ratingStyle);
      
      // Column F - Recommendations
      const recommendationStyle = isTotal ? STYLES.TOTAL_ROW_PREMIUM : {
        ...STYLES.INFO_VALUE,
        font: { sz: 10, italic: true, color: { rgb: COLORS.MEDIUM_GREY }, name: "Calibri" }
      };
      applyCellStyle(ws, `F${actualRow + 1}`, recommendationStyle);
      
      setRowHeight(ws, actualRow, isTotal ? 40 : 30);
    }

    XLSX.utils.book_append_sheet(wb, ws, "דוח מסכם פרימיום");
  }

  // --- ULTRA PREMIUM INCOMES SHEET ---
  if (options.includeIncomes) {
    const headers = ['📅 תאריך', '💰 תיאור הכנסה', '💳 אופן תשלום', '💵 סכום (₪)', '📊 מס\' שוטף'];
    const data = project.incomes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((income, index) => [
        new Date(income.date),
        income.description,
        income.paymentMethod,
        income.amount,
        index + 1
      ]);
    
    const ws = XLSX.utils.aoa_to_sheet([]);
    ws['!view'] = { rightToLeft: true };
    ws['!cols'] = [{ wch: 15 }, { wch: 45 }, { wch: 20 }, { wch: 20 }, { wch: 12 }];

    // Premium title
    XLSX.utils.sheet_add_aoa(ws, [[`💰 פירוט הכנסות מקצועי - ${project.name}`]], { origin: 'A1' });
    addMerge(ws, 0, 0, 0, 4);
    applyCellStyle(ws, 'A1', STYLES.MAIN_TITLE_PREMIUM);
    setRowHeight(ws, 0, 40);

    // Headers
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' });
    for (let col = 0; col < headers.length; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 2, c: col });
      applyCellStyle(ws, cellAddr, STYLES.TABLE_HEADER_PREMIUM);
    }
    setRowHeight(ws, 2, 30);

    // Data with premium styling
    if (data.length > 0) {
      XLSX.utils.sheet_add_aoa(ws, data, { origin: 'A4' });
      
      data.forEach((_, index) => {
        const row = index + 4;
        const isAlternating = index % 2 === 1;
        
        // Date column
        applyCellStyle(ws, `A${row}`, STYLES.DATA_CELL_CENTER_PREMIUM, 'd', data[index][0], FORMATS.DATE);
        
        // Description column with alternating colors
        const descStyle = isAlternating ? STYLES.DATA_CELL_ALTERNATING : STYLES.DATA_CELL_PREMIUM;
        applyCellStyle(ws, `B${row}`, descStyle);
        
        // Payment method
        applyCellStyle(ws, `C${row}`, STYLES.DATA_CELL_CENTER_PREMIUM);
        
        // Amount with positive styling
        applyCellStyle(ws, `D${row}`, STYLES.CURRENCY_POSITIVE, 'n', data[index][3], FORMATS.CURRENCY_RTL);
        
        // Serial number
        applyCellStyle(ws, `E${row}`, STYLES.DATA_CELL_CENTER_PREMIUM);
        
        setRowHeight(ws, row - 1, 25);
      });

      // Enhanced total row
      const totalRowIndex = data.length + 4;
      XLSX.utils.sheet_add_aoa(ws, [['', '', '✅ סך הכל הכנסות:', summaryData.totalIncomes, '']], { origin: `A${totalRowIndex}` });
      ['A', 'B', 'C', 'E'].forEach(col => {
        applyCellStyle(ws, `${col}${totalRowIndex}`, STYLES.TOTAL_ROW_PREMIUM);
      });
      applyCellStyle(ws, `D${totalRowIndex}`, {
        ...STYLES.TOTAL_ROW_PREMIUM,
        font: { sz: 16, bold: true, color: { rgb: COLORS.WHITE }, name: "Calibri" }
      }, 'n', summaryData.totalIncomes, FORMATS.CURRENCY_RTL);
      setRowHeight(ws, totalRowIndex - 1, 35);

      // Autofilter
      ws['!autofilter'] = { 
        ref: XLSX.utils.encode_range({
          s: { c: 0, r: 2 }, 
          e: { c: headers.length - 1, r: data.length + 2 }
        })
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, "💰 הכנסות פרימיום");
  }

  // --- ENHANCED EXPENSES SHEETS ---
  const sortedExpenses = [...project.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (options.expenseFormat === 'single-sheet') {
    const headers = ['קטגוריה', 'תאריך', 'ספק/נותן שירות', 'תיאור הוצאה', 'סכום (₪)', 'מס\''];
    const data = sortedExpenses.map((expense, index) => [
      expense.category,
      new Date(expense.date),
      expense.supplier,
      expense.description,
      expense.amount,
      index + 1
    ]);

    const ws = createEnhancedSheet(`כל ההוצאות מפורט - ${project.name}`, headers, data, [20, 15, 25, 40, 18, 10]);

    // Format specific columns with enhanced styling
    data.forEach((_, index) => {
      const row = index + 4;
      applyCellStyle(ws, `B${row}`, STYLES.DATA_CELL_CENTER_PREMIUM, 'd', data[index][1], FORMATS.DATE);
      applyCellStyle(ws, `E${row}`, STYLES.CURRENCY_NEUTRAL, 'n', data[index][4], FORMATS.CURRENCY_RTL);
      applyCellStyle(ws, `F${row}`, STYLES.DATA_CELL_CENTER_PREMIUM);
    });

    // Add enhanced total row
    const totalRowIndex = data.length + 4;
    XLSX.utils.sheet_add_aoa(ws, [['', '', '', 'סך הכל הוצאות:', summaryData.totalExpenses, '']], { origin: `A${totalRowIndex}` });
    ['A', 'B', 'C', 'D', 'F'].forEach(col => {
      applyCellStyle(ws, `${col}${totalRowIndex}`, STYLES.TOTAL_ROW_PREMIUM);
    });
    applyCellStyle(ws, `E${totalRowIndex}`, STYLES.TOTAL_ROW_PREMIUM, 'n', summaryData.totalExpenses, FORMATS.CURRENCY_RTL);
    setRowHeight(ws, totalRowIndex - 1, 25);

    XLSX.utils.book_append_sheet(wb, ws, "כל ההוצאות");
  }
  else if (options.expenseFormat === 'multi-sheet') {
    categories.forEach(category => {
      const categoryExpenses = sortedExpenses.filter(e => e.category === category.name);
      if (categoryExpenses.length > 0) {
        const headers = ['תאריך', 'ספק/נותן שירות', 'תיאור הוצאה', 'סכום (₪)', 'מס\''];
        const data = categoryExpenses.map((expense, index) => [
          new Date(expense.date),
          expense.supplier,
          expense.description,
          expense.amount,
          index + 1
        ]);

        const ws = createEnhancedSheet(`${category.name} מפורט - ${project.name}`, headers, data, [15, 25, 40, 18, 10]);

        // Format specific columns with enhanced styling
        data.forEach((_, index) => {
          const row = index + 4;
          applyCellStyle(ws, `A${row}`, STYLES.DATA_CELL_CENTER_PREMIUM, 'd', data[index][0], FORMATS.DATE);
          applyCellStyle(ws, `D${row}`, STYLES.CURRENCY_NEUTRAL, 'n', data[index][3], FORMATS.CURRENCY_RTL);
          applyCellStyle(ws, `E${row}`, STYLES.DATA_CELL_CENTER_PREMIUM);
        });

        // Add enhanced total row
        const categoryTotal = summaryData.expensesByCategory[category.name] || 0;
        const totalRowIndex = data.length + 4;
        XLSX.utils.sheet_add_aoa(ws, [['', '', `סך הכל ${category.name}:`, categoryTotal, '']], { origin: `A${totalRowIndex}` });
        ['A', 'B', 'C', 'E'].forEach(col => {
          applyCellStyle(ws, `${col}${totalRowIndex}`, STYLES.TOTAL_ROW_PREMIUM);
        });
        applyCellStyle(ws, `D${totalRowIndex}`, STYLES.TOTAL_ROW_PREMIUM, 'n', categoryTotal, FORMATS.CURRENCY_RTL);
        setRowHeight(ws, totalRowIndex - 1, 25);

        // Use safe sheet name (Excel limit is 31 characters)
        const safeSheetName = category.name.length > 28 ? category.name.substring(0, 25) + '...' : category.name;
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      }
    });
  }

  // Generate premium filename with current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\./g, '-');
  
  const timeStr = now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/:/g, '-');
  
  const profitStatus = summaryData.profit >= 0 ? 'רווח' : 'הפסד';
  const fileName = `🏗️_דוח_פרימיום_${project.name.replace(/[\/\\:*?"<>|]/g, "_")}_${profitStatus}_${dateStr}_${timeStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
