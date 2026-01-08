import type { TimeSlot } from '../types';

export const SLOT_HEIGHT = 18;

// TIME_SLOTS: 06:00 → 06:00 next day
// Hours 6-23.5 = day, 24-30 = night (00:00-06:00)
export const TIME_SLOTS: TimeSlot[] = (() => {
  const slots: TimeSlot[] = [];

  // Day hours: 06:00 - 23:30
  for (let i = 6; i < 24; i++) {
    slots.push({ hour: i, label: `${i.toString().padStart(2, '0')}`, isHalf: false });
    slots.push({ hour: i + 0.5, label: '', isHalf: true });
  }

  // Night hours after midnight: 00:00 - 06:00 (hour 24-30 internally)
  for (let i = 0; i <= 6; i++) {
    const internalHour = 24 + i; // 24 = 00:00, 25 = 01:00, ..., 30 = 06:00
    slots.push({
      hour: internalHour,
      label: `${i.toString().padStart(2, '0')}`,
      isHalf: false,
      isMidnight: i === 0,
      isNight: i > 0
    });
    if (i < 6) {
      slots.push({ hour: internalHour + 0.5, label: '', isHalf: true, isNight: true });
    }
  }

  return slots;
})();

export const roundToHalfHour = (hour: number): number => Math.round(hour * 2) / 2;
