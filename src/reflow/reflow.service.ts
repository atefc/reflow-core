import { DateTime } from "luxon";
import {
  IManufacturingOrder,
  IReflowResult,
  IWorkCenter,
  IWorkOrder,
} from "./types";
import _ from "lodash";
import { calculateEndDateWithShifts, diffInMinutes, toUTC } from "./../utils/date-utils";
import { getOverlappingMaintenanceWindows, isInConflict, sortWorkOrdersBasedOnDependencies } from "./constraint-checker";

export class ReflowService {
  constructor() {}

  reflow(
    workOrders: IWorkOrder[],
    workCenters: IWorkCenter[],
    manufacturingOrders: IManufacturingOrder[]
  ): IReflowResult {
    console.log("Reflowing work orders...");

    const sortedWorkOrders = sortWorkOrdersBasedOnDependencies(workOrders);
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
      let lastEndDate: DateTime | null = null;

      for (const workOrder of sortedWorkersInCenter) {
        let startDate = DateTime.fromISO(workOrder.data.startDate).toUTC();

        if(workOrder.data.isMaintenance) {
            continue;
        }

        // Check conflict
        if (isInConflict(startDate, lastEndDate)) {
          startDate = lastEndDate!;
        }

        // Calculate end date based on shifts
        let endDate = calculateEndDateWithShifts(
          startDate,
          workOrder.data.durationMinutes,
          workCenter.data.shifts
        );

        // Check maintenance window
        if (
          workCenter.data.maintenanceWindows.length
        ) {
          let isRecalculateNeeded = true;

          while (isRecalculateNeeded) {
            isRecalculateNeeded = false;
            const maintenanceWindows = getOverlappingMaintenanceWindows(
              startDate,
              endDate,
              workCenter
            );
            for (const maintenanceWindow of maintenanceWindows) {
              const maintenanceWindowStart = toUTC(DateTime.fromISO(maintenanceWindow.startDate));
              const maintenanceWindowEnd = toUTC(DateTime.fromISO(maintenanceWindow.endDate));

              // If work order overlaps maintenance window
              if (startDate < maintenanceWindowEnd && endDate > maintenanceWindowStart) {
                // Available minutes before maintenance window
                const minutesBeforeMW = diffInMinutes(startDate, maintenanceWindowStart);
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

                isRecalculateNeeded = true; // recheck against all maintenance windows
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
            delayMinutes: diffInMinutes(toUTC(DateTime.fromISO(oldStart)), startDate),
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

  private buildWorkOrderMap(workOrders: IWorkOrder[]): Map<string, IWorkOrder> {
    const map = new Map<string, IWorkOrder>();
    workOrders.forEach((wo) => map.set(wo.docId, wo));
    return map;
  }
}
