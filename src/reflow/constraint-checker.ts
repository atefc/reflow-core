import { DateTime } from "luxon";
import { IWorkCenter, IWorkOrder } from "./types";
import { toUTC } from "../utils/date-utils";

/**
 * Check for overlapping work orders within a work center.
 */
export function isInConflict(
  startDate: DateTime,
  lastEndDate: DateTime | null
): boolean {
  return !!lastEndDate && startDate < lastEndDate;
}

/**
 * Get the list of overlapping maintenance windows for a given time range.
 */
export function getOverlappingMaintenanceWindows(
  startDate: DateTime,
  endDate: DateTime,
  workCenter: IWorkCenter
) {
  return workCenter.data.maintenanceWindows.filter(
    (mw) =>
      toUTC(DateTime.fromISO(mw.endDate)) > startDate &&
      toUTC(DateTime.fromISO(mw.startDate)) < endDate
  );
}
