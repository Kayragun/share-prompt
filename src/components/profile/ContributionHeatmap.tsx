'use client';

import { useMemo } from 'react';

type DayCell = {
  date: string;
  count: number;
  isFuture: boolean;
};

type MonthLabel = {
  weekIndex: number;
  month: number;
};

function buildGrid(dates: string[]): { weeks: DayCell[][]; monthLabels: MonthLabel[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts: Record<string, number> = {};
  for (const d of dates) {
    const key = d.slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  // Start from the Sunday 51 weeks before the current week's Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - startDate.getDay() - 51 * 7);

  const weeks: DayCell[][] = [];
  const monthLabels: MonthLabel[] = [];
  const cursor = new Date(startDate);

  for (let w = 0; w < 52; w++) {
    const week: DayCell[] = [];
    let monthForWeek: number | null = null;

    for (let d = 0; d < 7; d++) {
      const isFuture = cursor > today;
      const y = cursor.getFullYear();
      const mo = cursor.getMonth();
      const day = cursor.getDate();
      const dateStr = `${y}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (day === 1 && !isFuture) monthForWeek = mo;

      week.push({ date: dateStr, count: isFuture ? 0 : (counts[dateStr] ?? 0), isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }

    if (monthForWeek !== null) monthLabels.push({ weekIndex: w, month: monthForWeek });
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

function getCellClass(count: number, isFuture: boolean): string {
  if (isFuture) return 'bg-muted/30';
  if (count === 0) return 'bg-border dark:bg-muted';
  if (count === 1) return 'bg-[oklch(0.83_0.10_73)] dark:bg-[oklch(0.42_0.10_73)]';
  if (count === 2) return 'bg-[oklch(0.71_0.15_72)] dark:bg-[oklch(0.57_0.15_72)]';
  return 'bg-[oklch(0.56_0.19_71)] dark:bg-[oklch(0.70_0.18_72)]';
}

const MONTHS_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type Props = {
  dates: string[];
  locale: string;
  totalCount: number;
};

export default function ContributionHeatmap({ dates, locale, totalCount }: Props) {
  const { weeks, monthLabels } = useMemo(() => buildGrid(dates), [dates]);
  const months = locale === 'tr' ? MONTHS_TR : MONTHS_EN;

  const heading = locale === 'tr'
    ? `Son 1 yılda ${totalCount} katkı`
    : `${totalCount} contributions in the last year`;

  const dayLabels = locale === 'tr'
    ? ['', 'Pzt', '', 'Çar', '', 'Cum', '']
    : ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // 12px cell + 2px gap = 14px per column
  const CELL = 14;

  return (
    <div className="mt-6 p-4 border rounded-xl bg-card overflow-x-auto">
      <p className="text-sm font-medium mb-3 text-foreground">{heading}</p>
      <div className="flex gap-3 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] pt-6">
          {dayLabels.map((lbl, i) => (
            <div
              key={i}
              className="h-[12px] text-[10px] text-muted-foreground leading-[12px] w-6 text-right"
            >
              {lbl}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div>
          {/* Month labels */}
          <div className="relative h-5 mb-1">
            {monthLabels.map((ml) => (
              <span
                key={`${ml.weekIndex}-${ml.month}`}
                className="absolute text-[10px] text-muted-foreground whitespace-nowrap leading-none"
                style={{ left: `${ml.weekIndex * CELL}px` }}
              >
                {months[ml.month]}
              </span>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-[2px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={`${cell.date}: ${cell.count}`}
                    className={`w-[12px] h-[12px] rounded-[2px] transition-opacity ${getCellClass(cell.count, cell.isFuture)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end text-[10px] text-muted-foreground select-none">
        <span>{locale === 'tr' ? 'Az' : 'Less'}</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-border dark:bg-muted" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[oklch(0.83_0.10_73)] dark:bg-[oklch(0.42_0.10_73)]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[oklch(0.71_0.15_72)] dark:bg-[oklch(0.57_0.15_72)]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-[oklch(0.56_0.19_71)] dark:bg-[oklch(0.70_0.18_72)]" />
        <span>{locale === 'tr' ? 'Çok' : 'More'}</span>
      </div>
    </div>
  );
}
