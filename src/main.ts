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
  scenarioOverlapMaintenanceSameWC,
  scenarioChainedDependencies,
  scenarioLongWeekend,
} from "./data/data";

const reflowService = new ReflowService();

const scenarios = [
  { name: "Scenario 1 - Simple", workOrders: scenarioSimple },
  { name: "Scenario 2 - Long weekend", workOrders: scenarioLongWeekend },
  { name: "Scenario 3 - Conflict", workOrders: scenarioConflict },
  {
    name: "Scenario 4 - Parent-Child Same WC",
    workOrders: scenarioParentChildSameWC,
  },
  {
    name: "Scenario 5 - Parent-Child Diff WC",
    workOrders: scenarioParentChildDiffWC,
  },
  { name: "Scenario 6 - Maintenance", workOrders: scenarioMaintenance },
  { name: "Scenario 7 - Combined Complex", workOrders: scenarioCombined },
  {
    name: "Scenario 8 - Overlap with Maintenance",
    workOrders: scenarioOverlapMaintenanceSameWC,
  },
//   {
//     name: "Scenario 9 - Dependency Blocked by Maintenance",
//     workOrders: scenarioDependencyBlockedByMaintenance,
//   },
  // @update
//   {
//     name: "Scenario 10 - Multi-step dependency chain across centers",
//     workOrders: scenarioChainedDependencies,
//   },
];

scenarios.forEach(({ name, workOrders }) => {
  console.log(`\n===== Running ${name} =====\n`);

  const result = reflowService.reflow(
    workOrders,
    workCenters,
    manufacturingOrders
  );

  console.log("Updated Work Orders:");
  result.updatedWorkOrders.forEach((wo) => {
    console.log(
      `${wo.data.workOrderNumber}: ${wo.data.startDate} - ${wo.data.endDate}`
    );
  });

  console.log("\nChanges:");
  result.changes.forEach((change) => {
    console.log(
      `${change.workOrderId}: ${change.oldStart} -> ${change.newStart}, ${change.oldEnd} -> ${change.newEnd}, delay: ${change.delayMinutes} mins`
    );
  });

  console.log("\nExplanations:");
  result.explanation.forEach((explanation) => {
    console.log(`- ${explanation}`);
  });

  console.log("\n==============================\n");
});
