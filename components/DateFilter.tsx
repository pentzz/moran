import React, { useState } from 'react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateFilterProps {
  onFilterChange: (range: DateRange | null) => void;
  placeholder?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, placeholder = "סנן לפי תאריכים" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });

  const getDateRange = (type: string): DateRange | null => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (type) {
      case 'thisMonth':
        return {
          startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
      
      case 'lastMonth':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return {
          startDate: new Date(lastMonthYear, lastMonth, 1).toISOString().split('T')[0],
          endDate: new Date(lastMonthYear, lastMonth + 1, 0).toISOString().split('T')[0]
        };
      
      case 'thisYear':
        return {
          startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, 11, 31).toISOString().split('T')[0]
        };
      
      case 'custom':
        return customRange.startDate && customRange.endDate ? customRange : null;
      
      default:
        return null;
    }
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type as any);
    const range = getDateRange(type);
    onFilterChange(range);
    if (type !== 'custom') {
      setIsOpen(false);
    }
  };

  const handleCustomRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const newRange = { ...customRange, [field]: value };
    setCustomRange(newRange);
    
    if (newRange.startDate && newRange.endDate) {
      onFilterChange(newRange);
    }
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'thisMonth':
        return 'החודש הנוכחי';
      case 'lastMonth':
        return 'החודש הקודם';
      case 'thisYear':
        return 'השנה הנוכחית';
      case 'custom':
        if (customRange.startDate && customRange.endDate) {
          return `${customRange.startDate} - ${customRange.endDate}`;
        }
        return 'טווח מותאם אישית';
      default:
        return placeholder;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">{getFilterLabel()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`w-full text-right px-3 py-2 rounded ${filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                הצג הכל
              </button>
              
              <button
                onClick={() => handleFilterChange('thisMonth')}
                className={`w-full text-right px-3 py-2 rounded ${filterType === 'thisMonth' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                החודש הנוכחי
              </button>
              
              <button
                onClick={() => handleFilterChange('lastMonth')}
                className={`w-full text-right px-3 py-2 rounded ${filterType === 'lastMonth' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                החודש הקודם
              </button>
              
              <button
                onClick={() => handleFilterChange('thisYear')}
                className={`w-full text-right px-3 py-2 rounded ${filterType === 'thisYear' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                השנה הנוכחית
              </button>
              
              <button
                onClick={() => handleFilterChange('custom')}
                className={`w-full text-right px-3 py-2 rounded ${filterType === 'custom' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                טווח מותאם אישית
              </button>
            </div>

            {filterType === 'custom' && (
              <div className="border-t pt-3 space-y-3">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך התחלה
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={customRange.startDate}
                    onChange={(e) => handleCustomRangeChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך סיום
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={customRange.endDate}
                    onChange={(e) => handleCustomRangeChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setCustomRange({ startDate: '', endDate: '' });
                      handleFilterChange('all');
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    נקה
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    סגור
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
