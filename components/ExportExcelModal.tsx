import React, { useState } from 'react';
import Modal from './Modal';
import { Project, ExportOptions } from '../types';
import { exportToExcel } from '../services/excelExport';
import { exportToPDF } from '../services/pdfExport';
import { useCategories } from '../context/CategoriesContext';
import { useSuppliers } from '../context/SuppliersContext';
import { DownloadIcon, PDFIcon } from './Icons';

interface ExportExcelModalProps {
  project: Project;
  summaryData: any;
  isOpen: boolean;
  onClose: () => void;
}

const ExportExcelModal: React.FC<ExportExcelModalProps> = ({ project, summaryData, isOpen, onClose }) => {
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  
  const handleExportExcelShort = () => {
    const options: ExportOptions = {
        includeSummary: true,
        includeIncomes: false,
        expenseFormat: 'none',
    };
    exportToExcel(project, summaryData, categories, options, suppliers);
    onClose();
  };
  
  const handleExportExcelLong = () => {
      const options: ExportOptions = {
        includeSummary: true,
        includeIncomes: true,
        expenseFormat: 'multi-sheet',
      };
      exportToExcel(project, summaryData, categories, options, suppliers);
      onClose();
  };

  const handleExportPDFShort = async () => {
    const options: ExportOptions = {
        includeSummary: true,
        includeIncomes: false,
        expenseFormat: 'none',
    };
    await exportToPDF(project, summaryData, categories, options, suppliers);
    onClose();
  };
  
  const handleExportPDFLong = async () => {
      const options: ExportOptions = {
        includeSummary: true,
        includeIncomes: true,
        expenseFormat: 'multi-sheet',
      };
      await exportToPDF(project, summaryData, categories, options, suppliers);
      onClose();
  };

  return (
    <Modal isOpen={isOpen} title="בחר סוג דוח לייצוא" onClose={onClose}>
      <div className="space-y-6 text-center">
        <div>
          <p className="text-gray-600 mb-4">בחר את סוג הקובץ ורמת הפירוט:</p>
          <div className="text-sm text-gray-500 space-y-2 mb-6">
            <p><strong>דוח מקוצר:</strong> פירוט ספקים בלבד</p>
            <p><strong>דוח מלא:</strong> פירוט ספקים + פירוט מלא של הכנסות (תאריכים, אחוזים ומעקב מצטבר)</p>
          </div>
        </div>

        {/* Excel Export Options */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">📊 ייצוא לאקסל (Excel)</h4>
          <div className="flex flex-col md:flex-row justify-center gap-3">
            <button 
              type="button" 
              onClick={handleExportExcelShort} 
              className="w-full md:w-auto bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center font-medium"
              >
               <DownloadIcon />
               <span className="mr-2">אקסל מקוצר</span>
            </button>
            <button 
              type="button" 
              onClick={handleExportExcelLong} 
              className="w-full md:w-auto bg-blue-800 text-white px-5 py-2 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center font-medium"
              >
              <DownloadIcon />
              <span className="mr-2">אקסל מלא</span>
            </button>
          </div>
        </div>

        {/* PDF Export Options */}
        <div className="border rounded-lg p-4 bg-red-50">
          <h4 className="text-lg font-semibold text-red-800 mb-3">📄 ייצוא ל-PDF (מותאם A4)</h4>
          <div className="flex flex-col md:flex-row justify-center gap-3">
            <button 
              type="button" 
              onClick={handleExportPDFShort} 
              className="w-full md:w-auto bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center justify-center font-medium"
              >
               <PDFIcon />
               <span className="mr-2">PDF מקוצר</span>
            </button>
            <button 
              type="button" 
              onClick={handleExportPDFLong} 
              className="w-full md:w-auto bg-red-800 text-white px-5 py-2 rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center justify-center font-medium"
              >
              <PDFIcon />
              <span className="mr-2">PDF מלא</span>
            </button>
          </div>
        </div>
        <div className="pt-4">
             <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
                ביטול
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportExcelModal;