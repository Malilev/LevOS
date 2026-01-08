export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatHour = (hour: number): string => {
  // Convert internal hour (6-30) to display format
  const displayHour = hour >= 24 ? hour - 24 : hour;
  const h = Math.floor(displayHour);
  const m = (displayHour % 1) * 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekDays = (weekStart: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

export const getDayName = (date: Date, short = true): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: short ? 'short' : 'long' };
  return date.toLocaleDateString('en-US', options);
};

export const getDayNumber = (date: Date): number => {
  return date.getDate();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};
