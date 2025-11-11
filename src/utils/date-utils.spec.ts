import { DateTime } from "luxon";
import {
  toUTC,
  diffInMinutes,
  calculateEndDateWithShifts,
  findNextShift,
} from "./date-utils";
import { IShift } from "../reflow/types";

describe("date-utils", () => {
  // -------------------------------------------------------
  // toUTC()
  // -------------------------------------------------------
  describe("toUTC", () => {
    it("should convert a DateTime to UTC", () => {
      const dt = DateTime.fromISO("2025-11-11T08:00:00-05:00"); // EST
      const utc = toUTC(dt);
      expect(utc.offset).toBe(0);
      expect(utc.toISO()).toBe("2025-11-11T13:00:00.000Z");
    });
  });

  // -------------------------------------------------------
  // diffInMinutes()
  // -------------------------------------------------------
  describe("diffInMinutes", () => {
    it("should return positive difference in minutes", () => {
      const start = DateTime.fromISO("2025-11-11T08:00:00Z");
      const end = DateTime.fromISO("2025-11-11T09:30:00Z");
      expect(diffInMinutes(start, end)).toBe(90);
    });

    it("should return negative if end is before start", () => {
      const start = DateTime.fromISO("2025-11-11T10:00:00Z");
      const end = DateTime.fromISO("2025-11-11T09:00:00Z");
      expect(diffInMinutes(start, end)).toBe(-60);
    });

    it("should return 0 if start equals end", () => {
      const dt = DateTime.fromISO("2025-11-11T10:00:00Z");
      expect(diffInMinutes(dt, dt)).toBe(0);
    });
  });

  // -------------------------------------------------------
  // findNextShift()
  // -------------------------------------------------------
  describe("findNextShift", () => {
    const shifts: IShift[] = [
      { dayOfWeek: 1, startHour: 8, endHour: 12 },
      { dayOfWeek: 1, startHour: 13, endHour: 17 },
      { dayOfWeek: 2, startHour: 9, endHour: 17 },
    ];

    it("should return first shift if before any shift", () => {
      const current = DateTime.fromISO("2025-11-10T07:00:00Z").set({ weekday: 1 });
      const shift = findNextShift(current, shifts);
      expect(shift).not.toBeNull();
      expect(shift?.shiftStart.hour).toBe(8);
    });

    it("should return current time if inside a shift", () => {
      const current = DateTime.fromISO("2025-11-10T09:00:00Z").toUTC().set({ weekday: 1 });
      const shift = findNextShift(current, shifts);
      expect(shift).not.toBeNull();
      expect(shift?.shiftStart.hour).toBe(9);
      expect(shift?.shiftEnd.hour).toBe(12);
    });

    it("should return next shift if after first shift", () => {
      const current = DateTime.fromISO("2025-11-10T12:30:00Z").toUTC().set({ weekday: 1 });
      const shift = findNextShift(current, shifts);
      expect(shift).not.toBeNull();
      expect(shift?.shiftStart.hour).toBe(13);
      expect(shift?.shiftEnd.hour).toBe(17);
    });

    it("should return null if after last shift of the day", () => {
      const current = DateTime.fromISO("2025-11-10T18:00:00Z").toUTC().set({ weekday: 1 });
      const shift = findNextShift(current, shifts);
      expect(shift).toBeNull();
    });
  });

  // -------------------------------------------------------
  // calculateEndDateWithShifts()
  // -------------------------------------------------------
  describe("calculateEndDateWithShifts", () => {
    const shifts: IShift[] = [
      { dayOfWeek: 1, startHour: 8, endHour: 12 },
      { dayOfWeek: 1, startHour: 13, endHour: 17 },
    ];

    it("should finish within the same shift", () => {
      const start = DateTime.fromISO("2025-11-10T08:30:00Z").toUTC().set({ weekday: 1 });
      const end = calculateEndDateWithShifts(start, 90, shifts);
      expect(end.hour).toBe(10);
      expect(end.minute).toBe(0);
    });

    it("should continue to next shift if needed", () => {
      const start = DateTime.fromISO("2025-11-10T11:00:00Z").toUTC().set({ weekday: 1 });
      const end = calculateEndDateWithShifts(start, 120, shifts); // 2 hours
      expect(end.hour).toBe(14);
      expect(end.minute).toBe(0); // continues after lunch shift
    });

    it("should skip days with no shifts", () => {
      const start = DateTime.fromISO("2025-11-10T16:00:00Z").toUTC().set({ weekday: 1 });
      const end = calculateEndDateWithShifts(start, 180, shifts); // 3 hours
      expect(end.weekday).toBe(1); // next day
      expect(end.hour).toBe(10); // assumes shift starts at 9 by default next day
    });
  });
});
