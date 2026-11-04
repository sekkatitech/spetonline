import { useRef, type KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
}

export function Tabs({ items, value, onChange, label, className = '' }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === null) return;

    event.preventDefault();
    onChange(items[nextIndex].id);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className={`flex gap-1 overflow-x-auto border-b border-spet-line ${className}`}>
      {items.map((item, index) => {
        const isSelected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={isSelected}
            aria-controls={`panel-${item.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
              isSelected
                ? 'border-spet-blue text-spet-blue'
                : 'border-transparent text-spet-ink-2 hover:text-spet-ink'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
