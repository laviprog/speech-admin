// src/components/date-range-picker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange: (date: DateRange | undefined) => void;
  onApply: (date: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ date, onDateChange, onApply, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);

  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleSelect = (range: DateRange | undefined) => {
    setTempDate(range);
  };

  const handleApply = () => {
    if (tempDate?.from && tempDate?.to) {
      onDateChange(tempDate);
      setOpen(false);
      onApply(tempDate);
    }
  };

  const handleCancel = () => {
    setTempDate(date);
    setOpen(false);
  };

  const isRangeComplete = tempDate?.from && tempDate?.to;

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={tempDate?.from}
            selected={tempDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="flex items-center gap-2 p-3 border-t">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleApply} disabled={!isRangeComplete}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
