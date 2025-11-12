import { DateTime } from "luxon";
import {
  IManufacturingOrder,
  IReflowResult,
  IWorkCenter,
  IWorkOrder,
} from "./types";
import _ from "lodash";
import {
  calculateEndDateWithShifts,
  diffInMinutes,
  toUTC,
} from "./../utils/date-utils";
import {
  getOverlappingMaintenanceWindows,
  isInConflict,
  sortWorkOrdersBasedOnDependencies,
} from "./constraint-checker";

export class ReflowService {
  constructor() {}

  reflow(
    workOrders: IWorkOrder[],
    workCenters: IWorkCenter[],
    manufacturingOrders: IManufacturingOrder[]
  ): IReflowResult {
    const sortedWorkOrders = sortWorkOrdersBasedOnDependencies(workOrders);
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
      const workCenter = workCenters.find((wc) => wc.docId === workCenterId);
      if (!workCenter) {
        throw new Error(`Work Center ${workCenterId} not found`);
      }

      // Sort workers by start date
      const sortedWorkersInCenter = workersInCenter.sort(
        (a, b) =>
          new Date(a.data.startDate).getTime() -
          new Date(b.data.startDate).getTime()
      );
      let lastEndDate: DateTime | null = null;

      // @upgrade
      let workerDelays = 0;
      for (const workOrder of sortedWorkersInCenter) {
        const originalStartDate = toUTC(DateTime.fromISO(workOrder.data.startDate));
        const originalEndDate = toUTC(DateTime.fromISO(workOrder.data.endDate));

        let startDate = toUTC(DateTime.fromISO(workOrder.data.startDate));

        if (workOrder.data.isMaintenance) {
          continue;
        }

        // Check conflict
        if (isInConflict(startDate, lastEndDate)) {
          startDate = lastEndDate!;
          explanations.push(
            `Work Order ${
              workOrder.docId
            } start date adjusted to ${startDate.toISO()} due to conflict in Work Center ${workCenterId}.`
          );
        }

        // Calculate end date based on shifts
        let endDate = calculateEndDateWithShifts(
          startDate,
          workOrder.data.durationMinutes,
          workCenter.data.shifts
        );
        if (
          endDate.toMillis() !==
          toUTC(DateTime.fromISO(workOrder.data.endDate)).toMillis()
        ) {
          explanations.push(
            `Work Order ${workOrder.docId} end date adjusted from ${
              workOrder.data.endDate
            } to ${endDate.toISO()} based on shifts in Work Center ${workCenterId}.`
          );
          workerDelays += diffInMinutes(
            toUTC(DateTime.fromISO(workOrder.data.endDate)),
            endDate
          );
        }

        // Check maintenance window
        if (workCenter.data.maintenanceWindows.length) {
          let isRecalculateNeeded = true;

          while (isRecalculateNeeded) {
            isRecalculateNeeded = false;
            const maintenanceWindows = getOverlappingMaintenanceWindows(
              startDate,
              endDate,
              workCenter
            );
            for (const maintenanceWindow of maintenanceWindows) {
              const maintenanceWindowStart = toUTC(
                DateTime.fromISO(maintenanceWindow.startDate)
              );
              const maintenanceWindowEnd = toUTC(
                DateTime.fromISO(maintenanceWindow.endDate)
              );

              // If work order overlaps maintenance window
              if (
                startDate < maintenanceWindowEnd &&
                endDate > maintenanceWindowStart
              ) {
                // Available minutes before maintenance window
                const minutesBeforeMW = diffInMinutes(
                  startDate,
                  maintenanceWindowStart
                );
                // If there’s any work done before MW, reduce remaining minutes
                let remainingMinutes =
                  workOrder.data.durationMinutes - minutesBeforeMW;

                // Resume work after maintenance
                startDate = maintenanceWindowEnd;
                explanations.push(
                  `Work Order ${
                    workOrder.docId
                  } delayed due to maintenance window from ${toUTC(
                    DateTime.fromISO(workOrder.data.startDate).plus({
                      minutes: minutesBeforeMW,
                    })
                  )} to ${
                    maintenanceWindow.endDate
                  } in Work Center ${workCenterId}.`
                );

                // Recalculate end date based on shifts after maintenance
                endDate = calculateEndDateWithShifts(
                  startDate,
                  remainingMinutes,
                  workCenter.data.shifts
                );
                workerDelays += diffInMinutes(
                  toUTC(DateTime.fromISO(workOrder.data.endDate)),
                  endDate
                );
                if (
                  endDate.toMillis() !==
                  toUTC(DateTime.fromISO(workOrder.data.endDate)).toMillis()
                ) {
                  explanations.push(
                    `Work Order ${workOrder.docId} end date adjusted from ${
                      workOrder.data.endDate
                    } to ${endDate.toISO()} after maintenance in Work Center ${workCenterId}.`
                  );
                }

                isRecalculateNeeded = true; // recheck against all maintenance windows
              }
            }
          }
        }

        // Record changes if start or end date changed

        if (originalStartDate !== startDate || originalEndDate !== endDate) {
          changes.push({
            workOrderId: workOrder.docId,
            oldStart: originalStartDate,
            oldEnd: originalEndDate,
            newStart: startDate.toISO(),
            newEnd: endDate.toISO(),
            delayMinutes: workerDelays,
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
    result.explanation = explanations;

    return result;
  }

  private buildWorkOrderMap(workOrders: IWorkOrder[]): Map<string, IWorkOrder> {
    const map = new Map<string, IWorkOrder>();
    workOrders.forEach((wo) => map.set(wo.docId, wo));
    return map;
  }
}
