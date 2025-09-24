// components/ui/multi-select.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Option = { label: string; value: string };

type MultiSelectProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: Option[];
  placeholder?: string;
  maxSelected?: number;
  disabled?: boolean;
  className?: string;
  emptyText?: string;
  searchPlaceholder?: string;
};

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Auswählen…',
  maxSelected,
  disabled,
  className,
  emptyText = 'Keine Treffer',
  searchPlaceholder = 'Suchen…',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSet = React.useMemo(() => new Set(value ?? []), [value]);
  const selectedOptions = React.useMemo(
    () => options.filter((o) => selectedSet.has(o.value)),
    [options, selectedSet]
  );

  const toggle = (val: string) => {
    const has = selectedSet.has(val);
    if (!has) {
      if (maxSelected && selectedSet.size >= maxSelected) return;
      onChange([...(value ?? []), val]);
    } else {
      onChange((value ?? []).filter((v) => v !== val));
    }
  };

  const clearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange([]);
  };

  const triggerLabel =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length <= 2
      ? selectedOptions.map((o) => o.label).join(', ')
      : `${selectedOptions[0].label}, ${selectedOptions[1].label} +${
          selectedOptions.length - 2
        }`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between cursor-pointer bg-white/50 border border-light-mint/30 rounded-lg h-11 hover:bg-white/70 transition-all duration-200',
            selectedOptions.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          <span className='truncate'>{triggerLabel}</span>
          <div className='ml-2 flex items-center gap-1'>
            {selectedOptions.length > 0 && (
              <Badge
                variant='secondary'
                className='rounded-sm px-1.5 py-0 text-xs'
              >
                {selectedOptions.length}
              </Badge>
            )}
            <ChevronsUpDown className='h-4 w-4 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[--radix-popover-trigger-width] p-0 bg-white/95 backdrop-blur border border-light-mint/30 shadow-xl rounded-lg'
        align='start'
      >
        <Command shouldFilter={true}>
          <div className='flex items-center gap-2 p-2'>
            <CommandInput placeholder={searchPlaceholder} />
            {selectedOptions.length > 0 && (
              <Button
                type='button'
                size='sm'
                variant='ghost'
                className='ml-auto h-8 px-2'
                onClick={clearAll}
              >
                <X className='mr-1 h-4 w-4' />
                Leeren
              </Button>
            )}
          </div>
          <CommandList className='max-h-64'>
            <CommandEmpty className='py-6 text-center text-sm text-muted-foreground'>
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const checked = selectedSet.has(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => toggle(opt.value)}
                    className='cursor-pointer'
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        checked
                          ? 'bg-primary text-primary-foreground '
                          : 'bg-white border-black opacity-50 text-transparent'
                      )}
                    >
                      <Check className='h-3.5 w-3.5' />
                    </div>
                    <span>{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
