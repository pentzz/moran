import React, { useState } from 'react';
import Modal from './Modal';
import { Project, ExportOptions } from '../types';
import { exportToExcel } from '../services/excelExport';
import { useCategories } from '../context/CategoriesContext';
import { useSuppliers } from '../context/SuppliersContext';
import { DownloadIcon } from './Icons';

interface ExportExcelModalProps {
  project: Project;
  summaryData: any;
  isOpen: boolean;
  onClose: () => void;
}

const ExportExcelModal: React.FC<ExportExcelModalProps> = ({ project, summaryData, isOpen, onClose }) => {
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  
  const handleExportShort = () => {
    const options: ExportOptions = {
        includeSummary: true,
        includeIncomes: false,
        expenseFormat: 'none',
    };
    exportToExcel(project, summaryData, categories, options, suppliers);
    onClose();
  };
  
  const handleExportLong = () => {
      const options: ExportOptions = {
        includeSummary: true,
        includeIncomes: true,
        expenseFormat: 'multi-sheet',
      };
      exportToExcel(project, summaryData, categories, options, suppliers);
      onClose();
  };

  return (
    <Modal isOpen={isOpen} title="בחר סוג דוח לייצוא" onClose={onClose}>
      <div className="space-y-4 text-center">
        <p className="text-gray-600">בחר את רמת הפירוט הרצויה עבור דוח האקסל שלך.</p>
        <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
          <button 
            type="button" 
            onClick={handleExportShort} 
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center text-lg font-semibold"
            >
             <DownloadIcon />
             <span className="mr-2">ייצוא דוח מקוצר</span>
          </button>
          <button 
            type="button" 
            onClick={handleExportLong} 
            className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-flex items-center justify-center text-lg font-semibold"
            >
            <DownloadIcon />
            <span className="mr-2">ייצוא דוח מלא</span>
          </button>
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