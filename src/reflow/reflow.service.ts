import { DateTime } from "luxon";
import {
  IManufacturingOrder,
  IReflowResult,
  IWorkCenter,
  IWorkOrder,
} from "./types";
import _ from "lodash";
import { calculateEndDateWithShifts } from "./constraint-checker";

export class ReflowService {
  constructor() {}

  reflow(
    workOrders: IWorkOrder[],
    workCenters: IWorkCenter[],
    manufacturingOrders: IManufacturingOrder[]
  ): IReflowResult {
    console.log("Reflowing work orders...");

    const sortedWorkOrders = this.sortWorkOrdersBasedOnDependencies(workOrders);
    console.log("Sorted Work Orders:", sortedWorkOrders);
    const result: IReflowResult = {
      updatedWorkOrders: [],
      changes: [],
      explanation: [],
    };

    // Group workers by work center
    const groupedWorkers = _.groupBy(
      sortedWorkOrders,
      (wo: IWorkOrder) => wo.data.workCenterId
    );
    const changes = [];
    const explanations = [];

    // Check conflicts per work center, adjust start and end dates if needed
    for (const [workCenterId, workersInCenter] of Object.entries(
      groupedWorkers
    )) {
      console.log(
        `Checking conflicts for Work Center ${workCenterId}:`,
        workersInCenter
      );

      const workCenter = workCenters.find((wc) => wc.docId === workCenterId);
      if (!workCenter) continue;

      // Sort workers by start date
      const sortedWorkersInCenter = workersInCenter.sort(
        (a, b) =>
          new Date(a.data.startDate).getTime() -
          new Date(b.data.startDate).getTime()
      );
      // Check for conflicts
      let lastEndDate: DateTime | null = null;

      for (const workOrder of sortedWorkersInCenter) {
        let startDate = DateTime.fromISO(workOrder.data.startDate).toUTC();

        if(workOrder.data.isMaintenance) {
            continue;
        }

        // Conflict check
        if (lastEndDate && startDate < lastEndDate) {
          startDate = lastEndDate;
        }

        // Calculate end date based on shifts
        let endDate = calculateEndDateWithShifts(
          startDate,
          workOrder.data.durationMinutes,
          workCenter.data.shifts
        );

        // --- Maintenance window check ---
        if (
          workCenter.data.maintenanceWindows.length
        ) {
          let adjusted = true;

          while (adjusted) {
            adjusted = false;
            const maintenanceWindows = workCenter.data.maintenanceWindows.filter(
              (mw) =>
                DateTime.fromISO(mw.endDate).toUTC() > startDate &&
                DateTime.fromISO(mw.startDate).toUTC() < endDate
            );
            for (const maintenanceWindow of maintenanceWindows) {
              const maintenanceWindowStart = DateTime.fromISO(maintenanceWindow.startDate).toUTC();
              const maintenanceWindowEnd = DateTime.fromISO(maintenanceWindow.endDate).toUTC();

              // If work order overlaps maintenance window
              if (startDate < maintenanceWindowEnd && endDate > maintenanceWindowStart) {
                // Available minutes before maintenance window
                const minutesBeforeMW = maintenanceWindowStart.diff(
                  startDate,
                  "minutes"
                ).minutes;

                // If there’s any work done before MW, reduce remaining minutes
                let remainingMinutes =
                  workOrder.data.durationMinutes -
                  (workOrder.data.durationMinutes - minutesBeforeMW);

                // Resume work after maintenance
                startDate = maintenanceWindowEnd;

                // Recalculate end date based on shifts after maintenance
                endDate = calculateEndDateWithShifts(
                  startDate,
                  remainingMinutes,
                  workCenter.data.shifts
                );

                adjusted = true; // recheck against all maintenance windows
              }
            }
          }
        }

        // Record changes if start or end date changed
        const oldStart = workOrder.data.startDate;
        const oldEnd = workOrder.data.endDate;

        if (oldStart !== startDate.toISO() || oldEnd !== endDate.toISO()) {
          changes.push({
            workOrderId: workOrder.docId,
            oldStart,
            oldEnd,
            newStart: startDate.toISO(),
            newEnd: endDate.toISO(),
            delayMinutes: startDate.diff(DateTime.fromISO(oldStart).toUTC(), "minutes")
              .minutes,
          });

          const isoStartDate = startDate.toISO();
          const isoEndDate = endDate.toISO();
          if (isoStartDate) workOrder.data.startDate = isoStartDate;
          if (isoEndDate) workOrder.data.endDate = isoEndDate;
        }

        lastEndDate = endDate;
      }
    }

    result.changes = changes;

    result.updatedWorkOrders = sortedWorkOrders;

    return result;
  }

  private sortWorkOrdersBasedOnDependencies(
    workOrders: IWorkOrder[]
  ): IWorkOrder[] {
    const visited = new Set<string>(); // permanently visited
    const visiting = new Set<string>(); // currently visiting (for cycle detection)
    const sorted: IWorkOrder[] = [];

    const workOrderMap = new Map<string, IWorkOrder>();
    workOrders.forEach((w) => workOrderMap.set(w.docId, w));

    const visit = (order: IWorkOrder) => {
      if (visited.has(order.docId)) return; // already sorted
      if (visiting.has(order.docId)) {
        throw new Error(
          `Circular dependency detected at work order ${order.docId}`
        );
      }

      visiting.add(order.docId);

      // Visit all parents first
      for (const depId of order.data.dependsOnWorkOrderIds) {
        const dep = workOrderMap.get(depId);
        if (dep) visit(dep);
      }

      visiting.delete(order.docId);
      visited.add(order.docId);
      sorted.push(order);
    };

    // Visit all work orders
    workOrders.forEach((order) => visit(order));

    return sorted;
  }

  private buildWorkOrderMap(workOrders: IWorkOrder[]): Map<string, IWorkOrder> {
    const map = new Map<string, IWorkOrder>();
    workOrders.forEach((wo) => map.set(wo.docId, wo));
    return map;
  }
}
