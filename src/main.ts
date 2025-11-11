import { ReflowService } from "./reflow/reflow.service";
import {
  workCenters,
  manufacturingOrders,
  scenarioSimple,
  scenarioConflict,
  scenarioParentChildSameWC,
  scenarioParentChildDiffWC,
  scenarioMaintenance,
  scenarioCombined,
  scenarioDependencyBlockedByMaintenance,
  scenarioOverlapMaintenanceSameWC
} from "./data/data";

const reflowService = new ReflowService();

const scenarios = [
//   { name: "Scenario 1 - Simple", workOrders: scenarioSimple },
//   { name: "Scenario 2 - Conflict", workOrders: scenarioConflict },
//   { name: "Scenario 3 - Parent-Child Same WC", workOrders: scenarioParentChildSameWC },
//   { name: "Scenario 4 - Parent-Child Diff WC", workOrders: scenarioParentChildDiffWC },
//   { name: "Scenario 5 - Maintenance", workOrders: scenarioMaintenance },
//   { name: "Scenario 6 - Combined Complex", workOrders: scenarioCombined },
  { name: "Scenario 7 - Overlap with Maintenance", workOrders: scenarioOverlapMaintenanceSameWC },
//  { name: "Scenario 8 - Dependency Blocked by Maintenance", workOrders: scenarioDependencyBlockedByMaintenance },
];

scenarios.forEach(({ name, workOrders }) => {
  console.log(`\n===== Running ${name} =====\n`);

  const result = reflowService.reflow(workOrders, workCenters, manufacturingOrders);

  console.log("Updated Work Orders:");
  result.updatedWorkOrders.forEach((wo) => {
    console.log(`${wo.data.workOrderNumber}: ${wo.data.startDate} - ${wo.data.endDate}`);
  });

  console.log("\nChanges:");
  result.changes.forEach((change) => {
    console.log(
      `${change.workOrderId}: ${change.oldStart} -> ${change.newStart}, ${change.oldEnd} -> ${change.newEnd}, delay: ${change.delayMinutes} mins`
    );
  });

  console.log("\n==============================\n");
});
