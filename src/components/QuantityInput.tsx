import React, { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityInputProps {
  id?: string;
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  id,
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  ariaLabel = 'Quantity',
}) => {
  const [draft, setDraft] = useState<string>(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitValue = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < min) {
      setDraft(String(min));
      onChange(min);
      return;
    }
    const clamped = Math.min(max, parsed);
    setDraft(String(clamped));
    onChange(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setDraft(digitsOnly);
    if (digitsOnly !== '') {
      const parsed = parseInt(digitsOnly, 10);
      if (!Number.isNaN(parsed) && parsed >= min) {
        onChange(Math.min(max, parsed));
      }
    }
  };

  const btnCls =
    size === 'sm'
      ? 'px-2 py-1 text-[#0F1111] hover:bg-[#E3E6E6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors'
      : 'px-2.5 py-1.5 text-[#0F1111] hover:bg-[#E3E6E6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors';

  const inputCls =
    size === 'sm'
      ? 'w-10 py-1 text-center text-xs font-semibold tabular-nums bg-white text-[#0F1111] border-x border-[#D5D9D9] focus:outline-none focus:bg-[#F0F8FA]'
      : 'w-12 py-1.5 text-center text-xs font-semibold tabular-nums bg-white text-[#0F1111] border-x border-[#D5D9D9] focus:outline-none focus:bg-[#F0F8FA]';

  return (
    <div className="inline-flex items-center rounded-md border border-[#D5D9D9] bg-[#F0F2F2] overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={btnCls}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={ariaLabel}
        value={draft}
        onChange={handleInputChange}
        onBlur={() => commitValue(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitValue(draft);
            e.currentTarget.blur();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            onChange(Math.min(max, value + 1));
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onChange(Math.max(min, value - 1));
          }
        }}
        className={inputCls}
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={btnCls}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
