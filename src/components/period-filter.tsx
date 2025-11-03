'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { X } from 'lucide-react';

interface PeriodFilterAdvancedProps {
  userId: string;
}

type PresetValue = 'this-week' | 'last-week' | 'this-month' | 'last-month';

const PERIOD_PRESETS = [
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
] as const;

function normalizeRange(r: DateRange | undefined) {
  return r?.from && r?.to ? { from: startOfDay(r.from), to: endOfDay(r.to) } : undefined;
}

function rangesEqual(a?: DateRange, b?: DateRange) {
  if (!a?.from || !a?.to || !b?.from || !b?.to) return false;
  return isEqual(startOfDay(a.from), startOfDay(b.from)) && isEqual(endOfDay(a.to), endOfDay(b.to));
}

function getMatchingPreset(range: DateRange | undefined): PresetValue | null {
  if (!range?.from || !range?.to) return null;
  const normalized = normalizeRange(range)!;
  for (const p of PERIOD_PRESETS) {
    const presetRange = normalizeRange(getPresetDates(p.value))!;
    if (rangesEqual(normalized, presetRange)) return p.value;
  }
  return null;
}

function getPresetDates(preset: PresetValue): DateRange {
  const now = new Date();

  switch (preset) {
    case 'this-week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'last-week': {
      const lastWeek = subWeeks(now, 1);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    }
    case 'this-month':
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    case 'last-month': {
      const lastMonth = subMonths(now, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }
  }
}

export function PeriodFilterAdvanced({ userId }: PeriodFilterAdvancedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (fromParam && toParam) {
      return {
        from: new Date(fromParam),
        to: new Date(toParam),
      };
    }
    return undefined;
  });

  const [activePreset, setActivePreset] = useState<PresetValue | null>(null);

  useEffect(() => {
    if (fromParam && toParam) {
      const r = { from: new Date(fromParam), to: new Date(toParam) };
      setDateRange(r);
      setActivePreset(getMatchingPreset(r));
    } else {
      setDateRange(undefined);
      setActivePreset(null);
    }
  }, [fromParam, toParam]);

  const applyDateRange = (from: Date, to: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', from.toISOString());
    params.set('to', to.toISOString());
    router.replace(`/users/${userId}?${params.toString()}`, { scroll: false });
  };

  const handlePresetClick = (preset: PresetValue) => {
    const dates = getPresetDates(preset);
    setDateRange(dates);
    setActivePreset(preset);
    if (dates.from && dates.to) {
      applyDateRange(dates.from, dates.to);
    }
  };

  const handleApply = (range?: DateRange) => {
    const r = range ?? dateRange;
    if (r?.from && r?.to) {
      const matched = getMatchingPreset(r);
      setActivePreset(matched);
      applyDateRange(r.from, r.to);
    }
  };

  const handleClearFilter = () => {
    setDateRange(undefined);
    setActivePreset(null);
    router.replace(`/users/${userId}`, { scroll: false });
  };

  const hasActiveFilter = fromParam && toParam;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        {PERIOD_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant={activePreset === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <DateRangePicker date={dateRange} onDateChange={setDateRange} onApply={handleApply} />

      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearFilter}
          className="h-10 w-10"
          title="Clear filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
