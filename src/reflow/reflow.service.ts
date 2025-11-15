import { DateTime } from "luxon";
import _ from "lodash";
import {
  IManufacturingOrder,
  IReflowResult,
  IWorkCenter,
  IWorkOrder,
} from "./types";
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

  /**
   * Reflow work orders to resolve conflicts, respect dependencies, and account for maintenance windows.
   * @param workOrders 
   * @param workCenters 
   * @param manufacturingOrders 
   * @returns IReflowResult
   */
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

    const changes: Array<any> = [];
    const explanations: string[] = [];

    // Last end date per work center to detect conflicts in the same work center
    const lastEndDatePerWorkCenter: Map<string, DateTime | null> = new Map();

    // Track updated end date per work order that can be used by children
    const endDatePerWorkOrder = new Map<string, DateTime>();

    const workCentersMap = this.getWorkCentersMap(workCenters);

    // Process parents then children
    for (const workOrder of sortedWorkOrders) {
      let workerDelays = 0;
      const workCenterId = workOrder.data.workCenterId;
      const workCenter = workCentersMap.get(workCenterId);
      if (!workCenter) {
        throw new Error(
          `Work Center ${workCenterId} not found for ${workOrder.docId}`
        );
      }

      if (workOrder.data.isMaintenance) {
        const mEnd = toUTC(DateTime.fromISO(workOrder.data.endDate));
        lastEndDatePerWorkCenter.set(workCenterId, mEnd);
        endDatePerWorkOrder.set(workOrder.docId, mEnd);
        continue;
      }

      // Original timestamps
      const originalStart = toUTC(DateTime.fromISO(workOrder.data.startDate));
      const originalEnd = toUTC(DateTime.fromISO(workOrder.data.endDate));

      // Update earliest start date allowed by dependencies
      let earliestStart = originalStart;

      // Parent workers are done first, so we're sure their end dates are updated
      if (workOrder.data.dependsOnWorkOrderIds?.length) {
        for (const depId of workOrder.data.dependsOnWorkOrderIds) {
          const parentEnd = endDatePerWorkOrder.get(depId);
          // Update earliest start if parent ends later
          if (parentEnd && isInConflict(earliestStart, parentEnd)) {
            earliestStart = parentEnd;
            explanations.push(
              `Work Order ${
                workOrder.docId
              } waits for dependency ${depId} finishing at ${parentEnd.toISO()}.`
            );
          }
        }
      }

      // Check conflicts in the same work center
      const workCenterLastEnd = lastEndDatePerWorkCenter.get(workCenterId) ?? null;
      if (isInConflict(earliestStart, workCenterLastEnd)) {
        explanations.push(
          `Work Order ${
            workOrder.docId
          } shifted to avoid intra work center conflict in ${workCenterId}. Was ${earliestStart.toISO()}, now ${workCenterLastEnd!!.toISO()}.`
        );
        earliestStart = workCenterLastEnd!!;
      }

      // Calculate end date with shifts and adjust for maintenance windows
      let startDate = earliestStart;
      let endDate = calculateEndDateWithShifts(
        startDate,
        workOrder.data.durationMinutes,
        workCenter.data.shifts
      );

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
                // workerDelays += diffInMinutes(
                //   toUTC(DateTime.fromISO(workOrder.data.endDate)),
                //   endDate
                // );
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

      // Record changes if different from original dates
      const isoNewStart = startDate.toISO();
      const isoNewEnd = endDate.toISO();

      const startChanged = originalStart.toMillis() !== startDate.toMillis();
      const endChanged = originalEnd.toMillis() !== endDate.toMillis();

      if (startChanged || endChanged) {
        const delayMinutes = diffInMinutes(originalEnd, endDate);
        changes.push({
          workOrderId: workOrder.docId,
          oldStart: originalStart.toISO(),
          oldEnd: originalEnd.toISO(),
          newStart: isoNewStart,
          newEnd: isoNewEnd,
          delayMinutes,
        });

        explanations.push(
          `Work Order ${
            workOrder.docId
          } adjusted: ${originalStart.toISO()}-${originalEnd.toISO()} -> ${isoNewStart}-${isoNewEnd} (delay: ${delayMinutes} mins)`
        );

        // Update workers dates
        if (isoNewStart) {
          workOrder.data.startDate = isoNewStart;
        }
        if (isoNewEnd) {
          workOrder.data.endDate = isoNewEnd;
        }
      }

      lastEndDatePerWorkCenter.set(workCenterId, endDate);
      endDatePerWorkOrder.set(workOrder.docId, endDate);
    }

    result.changes = changes;
    result.updatedWorkOrders = sortedWorkOrders;
    result.explanation = explanations;

    return result;
  }

  getWorkCentersMap(workCenters: IWorkCenter[]): Map<string, IWorkCenter> {
    const workCentersMap: Map<string, IWorkCenter> = workCenters.reduce(
      (map, wc) => map.set(wc.docId, wc),
      new Map<string, IWorkCenter>()
    );
    return workCentersMap;
  }
}
