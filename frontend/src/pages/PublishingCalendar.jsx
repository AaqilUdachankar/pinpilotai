import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  Send
} from 'lucide-react';
import { pinAPI } from '../services/api';
import { RescheduleModal } from '../components/Pin/RescheduleModal';
import { useToast } from '../components/Common/Toast';
import { StatusBadge } from '../components/Common/Badge';

export const PublishingCalendar = () => {
  const { addToast } = useToast();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reschedulingPin, setReschedulingPin] = useState(null);

  const fetchPins = async () => {
    try {
      const res = await pinAPI.getPins({ limit: 150 });
      if (res.data?.success) {
        setPins(res.data.pins);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const handleReschedule = async (pinId, newDate) => {
    try {
      await pinAPI.reschedulePin(pinId, newDate);
      addToast('Pin publishing time updated on calendar!', 'success');
      fetchPins();
    } catch (err) {
      addToast('Failed to update publishing time', 'error');
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Group pins by day string "YYYY-MM-DD"
  const pinsByDay = {};
  pins.forEach((pin) => {
    if (pin.scheduledAt) {
      const d = new Date(pin.scheduledAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!pinsByDay[key]) pinsByDay[key] = [];
      pinsByDay[key].push(pin);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Publishing Calendar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual 24/7 calendar of scheduled, published, and pending Pinterest pins.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-auto">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white px-3 flex-1 sm:min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="lg:hidden flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>👉 Scroll horizontally to inspect full calendar grid</span>
      </div>

      {/* Calendar Grid Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px]">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 text-center py-3 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/20 dark:bg-slate-950/20 p-2 min-h-[120px]" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayPins = pinsByDay[dateStr] || [];

            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                key={dateStr}
                className={`p-2 min-h-[120px] transition flex flex-col justify-between ${
                  isToday ? 'bg-rose-50/30 dark:bg-rose-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayPins.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayPins.length} {dayPins.length === 1 ? 'pin' : 'pins'}
                    </span>
                  )}
                </div>

                {/* Day Pins Stack */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-28 pr-0.5">
                  {dayPins.map((pin) => {
                    let borderClass = 'border-l-2 border-blue-500';
                    let bgClass = 'bg-blue-50/70 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200';

                    if (pin.publishingStatus === 'published') {
                      borderClass = 'border-l-2 border-emerald-500';
                      bgClass = 'bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200';
                    } else if (pin.publishingStatus === 'failed') {
                      borderClass = 'border-l-2 border-rose-500';
                      bgClass = 'bg-rose-50/70 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200';
                    }

                    const timeStr = new Date(pin.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={pin._id}
                        onClick={() => setReschedulingPin(pin)}
                        className={`p-1.5 rounded-lg text-[11px] font-medium cursor-pointer shadow-sm hover:shadow transition flex items-center gap-1.5 ${borderClass} ${bgClass}`}
                        title={`${timeStr} - ${pin.title} (Click to reschedule)`}
                      >
                        <Clock className="w-3 h-3 shrink-0 opacity-70" />
                        <span className="font-bold shrink-0">{timeStr}</span>
                        <span className="truncate">{pin.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

      {/* Legend & Guidance */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Legend:</span>
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Scheduled (Cloud Queue)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Published to Pinterest
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Failed / Error
          </span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Click any pin inside a calendar cell to modify its scheduled publishing time.
        </p>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!reschedulingPin}
        onClose={() => setReschedulingPin(null)}
        pin={reschedulingPin}
        onReschedule={handleReschedule}
      />
    </div>
  );
};
