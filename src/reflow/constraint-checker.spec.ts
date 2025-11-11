import { DateTime } from "luxon";
import { isInConflict, getOverlappingMaintenanceWindows } from "./constraint-checker";
import { toUTC } from "../utils/date-utils"; // now using the real function
import { IWorkCenter } from "./types";

describe("constraint-checker utils", () => {
  // -------------------------------------------------------------------------
  // isInConflict
  // -------------------------------------------------------------------------
  describe("isInConflict()", () => {
    it("should return false if lastEndDate is null", () => {
      const start = DateTime.fromISO("2025-11-11T08:00:00Z");
      expect(isInConflict(start, null)).toBe(false);
    });

    it("should return false if startDate is after lastEndDate", () => {
      const start = DateTime.fromISO("2025-11-11T09:00:00Z");
      const lastEnd = DateTime.fromISO("2025-11-11T08:00:00Z");
      expect(isInConflict(start, lastEnd)).toBe(false);
    });

    it("should return true if startDate is before lastEndDate", () => {
      const start = DateTime.fromISO("2025-11-11T07:00:00Z");
      const lastEnd = DateTime.fromISO("2025-11-11T08:00:00Z");
      expect(isInConflict(start, lastEnd)).toBe(true);
    });

    it("should return false if startDate equals lastEndDate", () => {
      const dt = DateTime.fromISO("2025-11-11T08:00:00Z");
      expect(isInConflict(dt, dt)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // getOverlappingMaintenanceWindows
  // -------------------------------------------------------------------------
  describe("getOverlappingMaintenanceWindows()", () => {
    let workCenter: IWorkCenter;

    beforeEach(() => {
      workCenter = {
        docId: "WC1",
        docType: "workCenter",
        data: {
          name: "Line 1",
          shifts: [],
          maintenanceWindows: [
            {
              startDate: "2025-11-12T10:00:00Z",
              endDate: "2025-11-12T11:00:00Z",
              reason: "Maintenance A",
            },
            {
              startDate: "2025-11-12T15:00:00Z",
              endDate: "2025-11-12T16:00:00Z",
              reason: "Maintenance B",
            },
          ],
        },
      };
    });

    it("should return empty array if no overlap", () => {
      const start = DateTime.fromISO("2025-11-12T08:00:00Z");
      const end = DateTime.fromISO("2025-11-12T09:00:00Z");
      const overlaps = getOverlappingMaintenanceWindows(start, end, workCenter);
      expect(overlaps).toHaveLength(0);
    });

    it("should return one window if partially overlaps maintenance", () => {
      const start = DateTime.fromISO("2025-11-12T10:30:00Z");
      const end = DateTime.fromISO("2025-11-12T11:30:00Z");
      const overlaps = getOverlappingMaintenanceWindows(start, end, workCenter);
      expect(overlaps).toHaveLength(1);
      expect(overlaps[0].reason).toBe("Maintenance A");
    });

    it("should return one window if fully inside maintenance", () => {
      const start = DateTime.fromISO("2025-11-12T10:10:00Z");
      const end = DateTime.fromISO("2025-11-12T10:50:00Z");
      const overlaps = getOverlappingMaintenanceWindows(start, end, workCenter);
      expect(overlaps).toHaveLength(1);
      expect(overlaps[0].reason).toBe("Maintenance A");
    });

    it("should return multiple overlapping windows", () => {
      const start = DateTime.fromISO("2025-11-12T10:30:00Z");
      const end = DateTime.fromISO("2025-11-12T15:30:00Z");
      const overlaps = getOverlappingMaintenanceWindows(start, end, workCenter);
      expect(overlaps.map((mw) => mw.reason)).toEqual(
        expect.arrayContaining(["Maintenance A", "Maintenance B"])
      );
    });
  });
});
