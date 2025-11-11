import { DateTime } from "luxon";
import { IWorkCenter, IWorkOrder } from "./types";
import { toUTC } from "../utils/date-utils";

export const sortWorkOrdersBasedOnDependencies = (
    workOrders: IWorkOrder[]
  ): IWorkOrder[] => {
    const visited = new Set<string>(); // permanently visited
    const visitInProgress = new Set<string>(); // currently visiting (for cycle detection)
    const sorted: IWorkOrder[] = [];

    const workOrderMap = new Map<string, IWorkOrder>();
    workOrders.forEach((w) => workOrderMap.set(w.docId, w));

    const visit = (order: IWorkOrder) => {
      if (visited.has(order.docId)) return; // already sorted
      if (visitInProgress.has(order.docId)) {
        throw new Error(
          `Circular dependency detected at work order ${order.docId}`
        );
      }

      visitInProgress.add(order.docId);

      // Visit all parents first
      for (const depId of order.data.dependsOnWorkOrderIds) {
        const dep = workOrderMap.get(depId);
        if (dep) visit(dep);
      }

      visitInProgress.delete(order.docId);
      visited.add(order.docId);
      sorted.push(order);
    };

    // Visit all work orders
    workOrders.forEach((order) => visit(order));

    return sorted;
}

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
