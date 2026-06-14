// components/CustomSelect.js
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  name,
  displayField = 'name',
  'data-testid': dataTestId
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={dataTestId}
        className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-base flex justify-between items-center hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
      >
        <span className={value ? 'text-white' : 'text-slate-400'}>
          {selectedOption ? selectedOption[displayField] : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-2 w-full max-h-60 overflow-y-auto rounded-lg bg-slate-800 border border-slate-600 shadow-xl scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {options.length > 0 ? (
            options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange({ target: { name, value: option.id } });
                  setIsOpen(false);
                }}
                data-testid={`${dataTestId}-option-${option.id}`}
                className="w-full px-4 py-2 text-left text-white text-base hover:bg-orange-600/20 transition first:rounded-t-lg last:rounded-b-lg"
              >
                {option[displayField]}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-slate-400 text-sm italic">Nenhum item encontrado</div>
          )}
        </div>
      )}
    </div>
  );
}