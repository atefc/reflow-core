import { DateTime } from "luxon";
import { IShift } from "../reflow/types";


/**
 * Format a DateTime to UTC
 */
export const toUTC = (date: DateTime): DateTime => {
  return date.toUTC();
};

/**
 * Get minutes difference between two DateTime objects.
 */
export const diffInMinutes = (start: DateTime, end: DateTime): number => {
  return end.diff(start, "minutes").minutes;
};

/**
 * Calculate end date considering shifts.
 */
export const calculateEndDateWithShifts = (
  startDate: DateTime,
  durationMinutes: number,
  shifts: IShift[]
): DateTime => {
  let remaining = durationMinutes;
  let current = startDate;

  while (remaining > 0) {
    const nextShift = findNextShift(current, shifts);

    if (!nextShift) {
      // No shift left today, so move to next day and retry
      // console.log('No shift found for date', current.toUTC(), current.weekday, remaining, ', moving to next day');
      current = current.plus({ days: 1 }).startOf("day");
      continue;
    }

    const availableMinutes = diffInMinutes(nextShift.shiftStart, nextShift.shiftEnd);
    
    if (remaining <= availableMinutes) {
      return nextShift.shiftStart.plus({ minutes: remaining });
    }

    // Update remaining time and current time
    remaining -= availableMinutes;
    current = nextShift.shiftEnd;
  }

  return current;
}

/**
 * Find the next shift for a given date.
 */
export const findNextShift = (
  current: DateTime,
  shifts: IShift[]
): { shiftStart: DateTime; shiftEnd: DateTime } | null => {
  // Map shifts to concrete start/end today
  const todayShifts = shifts
    .filter(s => s.dayOfWeek === current.weekday % 7) // convert from 1-7(luxon weekday) to 0-6
    .map(s => ({
      shiftStart: current.set({ hour: s.startHour, minute: 0, second: 0, millisecond: 0 }),
      shiftEnd: current.set({ hour: s.endHour, minute: 0, second: 0, millisecond: 0 }),
    }))
    .sort((a, b) => a.shiftStart.toMillis() - b.shiftStart.toMillis());

  // Return first shift that hasn't ended yet
  const shift = todayShifts.find(s => current < s.shiftEnd);
  if (shift) {
    const shiftStart = current < shift.shiftStart ? shift.shiftStart : current;
    return { shiftStart, shiftEnd: shift.shiftEnd };
  }

  return null;
}
