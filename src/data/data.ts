import { IWorkCenter, IManufacturingOrder, IWorkOrder } from "../reflow/types";


// ----------------------
// Work Centers
// ----------------------
export const workCenters: IWorkCenter[] = [
  {
    docId: "WC1",
    docType: "workCenter",
    data: {
      name: "Extrusion Line 1",
      shifts: [
        { dayOfWeek: 1, startHour: 8, endHour: 12 },
        { dayOfWeek: 1, startHour: 13, endHour: 17 },
        { dayOfWeek: 2, startHour: 8, endHour: 17 },
        { dayOfWeek: 3, startHour: 8, endHour: 17 },
        { dayOfWeek: 4, startHour: 8, endHour: 17 },
        { dayOfWeek: 5, startHour: 8, endHour: 17 },

      ],
      maintenanceWindows: [
        { startDate: "2025-11-12T10:00:00Z", endDate: "2025-11-12T11:00:00Z", reason: "Planned maintenance" },
      ],
    },
  },
  {
    docId: "WC2",
    docType: "workCenter",
    data: {
      name: "Extrusion Line 2",
      shifts: [
        { dayOfWeek: 1, startHour: 7, endHour: 11 },
        { dayOfWeek: 2, startHour: 14, endHour: 18 },
        { dayOfWeek: 3, startHour: 8, endHour: 17 },
        { dayOfWeek: 4, startHour: 8, endHour: 16 },
        { dayOfWeek: 5, startHour: 8, endHour: 17 },
      ],
      maintenanceWindows: [],
    },
  },
];

// ----------------------
// Manufacturing Orders
// ----------------------
export const manufacturingOrders: IManufacturingOrder[] = [
  {
    docId: "MO1",
    docType: "manufacturingOrder",
    data: {
      manufacturingOrderNumber: "MO-001",
      itemId: "Item-001",
      quantity: 100,
      dueDate: "2025-11-15T17:00:00Z",
    },
  },
];

// ----------------------
// Scenario 1: Simple WO, no dependencies
// ----------------------
export const scenarioSimple: IWorkOrder[] = [
  {
    docId: "WO1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-001",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T08:00:00Z",
      endDate: "2025-11-11T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
];

// ----------------------
// Scenario 2: Conflict WO, same work center
// ----------------------
export const scenarioConflict: IWorkOrder[] = [
  {
    docId: "WO2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-002",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T08:00:00Z",
      endDate: "2025-11-11T12:00:00Z",
      durationMinutes: 240,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO3",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-003",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T10:00:00Z",
      endDate: "2025-11-11T12:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
];

// ----------------------
// Scenario 3: Parent-child dependencies (same WC)
// ----------------------
export const scenarioParentChildSameWC: IWorkOrder[] = [
  {
    docId: "WO4",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-004",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T08:00:00Z",
      endDate: "2025-11-11T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO5",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-005",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T10:00:00Z",
      endDate: "2025-11-11T12:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO4"],
    },
  },
];

// ----------------------
// Scenario 4: Parent-child dependencies (different WC)
// ----------------------
export const scenarioParentChildDiffWC: IWorkOrder[] = [
  {
    docId: "WO6",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-006",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T08:00:00Z",
      endDate: "2025-11-11T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO7",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-007",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-11T08:00:00Z",
      endDate: "2025-11-11T12:00:00Z",
      durationMinutes: 240,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO6"],
    },
  },
];

// ----------------------
// Scenario 5: Maintenance work orders
// ----------------------
export const scenarioMaintenance: IWorkOrder[] = [
  {
    docId: "WO-M1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-M1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-12T10:00:00Z",
      endDate: "2025-11-12T12:00:00Z",
      durationMinutes: 120,
      isMaintenance: true,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO-M2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-M2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-12T14:00:00Z",
      endDate: "2025-11-12T16:00:00Z",
      durationMinutes: 120,
      isMaintenance: true,
      dependsOnWorkOrderIds: [],
    },
  },
];

// ----------------------
// Scenario 6: Combined complex case
// ----------------------
export const scenarioCombined: IWorkOrder[] = [
  // Simple WO
  {
    docId: "WO1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-001",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T08:00:00Z",
      endDate: "2025-11-11T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  // Conflict WO (same WC overlapping)
  {
    docId: "WO2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-002",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T09:00:00Z",
      endDate: "2025-11-11T11:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  // Parent-child same WC
  {
    docId: "WO3",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-003",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T11:00:00Z",
      endDate: "2025-11-11T13:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO1"],
    },
  },
  // Parent-child different WC
  {
    docId: "WO4",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-004",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-11T07:00:00Z",
      endDate: "2025-11-11T09:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO1"],
    },
  },
  // Multiple parents
  {
    docId: "WO5",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-005",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-12T08:00:00Z",
      endDate: "2025-11-12T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO3", "WO4"],
    },
  },
  // Multi-shift / multi-day
  {
    docId: "WO6",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-006",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-12T08:00:00Z",
      endDate: "2025-11-12T12:00:00Z",
      durationMinutes: 240,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  // Maintenance WOs
  {
    docId: "WO-M1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-M1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-12T10:00:00Z",
      endDate: "2025-11-12T12:00:00Z",
      durationMinutes: 120,
      isMaintenance: true,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO-M2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-M2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-12T14:00:00Z",
      endDate: "2025-11-12T16:00:00Z",
      durationMinutes: 120,
      isMaintenance: true,
      dependsOnWorkOrderIds: [],
    },
  },
];

// ----------------------
// Scenario 7: Work order overlaps with maintenance on same WC
// ----------------------
export const scenarioOverlapMaintenanceSameWC: IWorkOrder[] = [
  {
    docId: "WO7-1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-007-1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-12T09:30:00Z", // overlaps with maintenance 10:00–11:00
      endDate: "2025-11-12T11:30:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO7-2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-007-2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-12T10:30:00Z", // overlaps with maintenance 10:00–11:00 and WO7-1
      endDate: "2025-11-12T12:30:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO7-1"],
    },
  },
];

// ----------------------
// Scenario 8: Work order dependency blocked by maintenance in another WC
// ----------------------
export const scenarioDependencyBlockedByMaintenance: IWorkOrder[] = [
  {
    docId: "WO8-1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-008-1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-12T08:00:00Z",
      endDate: "2025-11-12T09:30:00Z",
      durationMinutes: 90,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO8-2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-008-2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-12T09:00:00Z", // scheduled before dependency done
      endDate: "2025-11-12T11:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO8-1"],
    },
  },
  {
    docId: "WO8-M",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-008-M",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-12T10:00:00Z",
      endDate: "2025-11-12T11:00:00Z",
      durationMinutes: 60,
      isMaintenance: true,
      dependsOnWorkOrderIds: [],
    },
  },
];


// ----------------------
// Scenario 9: Multi-step dependency chain across centers
// ----------------------
export const scenarioChainedDependencies: IWorkOrder[] = [
  {
    docId: "WO9-1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-009-1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-13T08:00:00Z",
      endDate: "2025-11-13T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO9-2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-009-2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-13T10:00:00Z",
      endDate: "2025-11-13T12:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO9-1"],
    },
  },
  {
    docId: "WO9-3",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-009-3",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-13T12:30:00Z",
      endDate: "2025-11-13T14:30:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO9-2"],
    },
  },
];

// ----------------------
// Scenario 10: Work order extends beyond shift boundary
// ----------------------
export const scenarioShiftBoundary: IWorkOrder[] = [
  {
    docId: "WO10-1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-010-1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-11T16:00:00Z", // shift ends 17:00
      endDate: "2025-11-11T18:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
];

// ----------------------
// Scenario 11: Multiple WOs in same WC, no overlap
// ----------------------
export const scenarioParallelNonConflict: IWorkOrder[] = [
  {
    docId: "WO11-1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-011-1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-11T07:00:00Z",
      endDate: "2025-11-11T09:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
  {
    docId: "WO11-2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-011-2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC2",
      startDate: "2025-11-11T09:00:00Z",
      endDate: "2025-11-11T11:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: [],
    },
  },
];

// ----------------------
// Scenario 12: Circular dependency (invalid)
// ----------------------
export const scenarioCircularDependency: IWorkOrder[] = [
  {
    docId: "WO12-1",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-012-1",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-14T08:00:00Z",
      endDate: "2025-11-14T10:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO12-2"], // circular link
    },
  },
  {
    docId: "WO12-2",
    docType: "workOrder",
    data: {
      workOrderNumber: "WO-012-2",
      manufacturingOrderId: "MO1",
      workCenterId: "WC1",
      startDate: "2025-11-14T10:00:00Z",
      endDate: "2025-11-14T12:00:00Z",
      durationMinutes: 120,
      isMaintenance: false,
      dependsOnWorkOrderIds: ["WO12-1"],
    },
  },
];

export const scenarioLongWeekend: IWorkOrder[] = [
  {
    docId: "WO100",
    docType: "workOrder",
    data: {
      workCenterId: "WC1",
      manufacturingOrderId: "MO1",
      workOrderNumber: "WO100-1",
      startDate: "2025-11-14T08:00:00Z", // Friday 8 AM
      endDate: "2025-11-14T16:00:00Z", // initially same day (will change)
      durationMinutes: 15 * 60, // 15 hours
      dependsOnWorkOrderIds: [],
      isMaintenance: false,
    },
  },
];