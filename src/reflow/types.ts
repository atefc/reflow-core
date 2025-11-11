export type IWorkOrder = {
  docId: string;
  docType: "workOrder";
  data: {
    workOrderNumber: string;
    manufacturingOrderId: string;
    workCenterId: string;
    
    // Timing
    startDate: string;              
    endDate: string;                
    durationMinutes: number;        // Total working time required
    
    // Constraints
    isMaintenance: boolean;         // Cannot be rescheduled if true
    
    // Dependencies (can have multiple parents)
    dependsOnWorkOrderIds: string[]; // All must complete before this starts

    setupTimeMinutes?: number;    // Setup time in minutes

    totalDelay ? : number;        // Total delay time in minutes


  }

}


export type IWorkCenter = {
  docId: string;
  docType: "workCenter";
  data: {
    name: string;
    
    // Shifts
    shifts: IShift[];
    
    // Maintenance windows (blocked time periods)
    maintenanceWindows: Array<{
      startDate: string;           
      endDate: string;             
      reason?: string;             // Optional description
    }>;
  }
}


export type IShift = {
    dayOfWeek: number;           // 0-6, Sunday = 0
    startHour: number;           // 0-23
    endHour: number;             // 0-23
}

export type IManufacturingOrder = {
  docId: string;
  docType: "manufacturingOrder";
  data: {
    manufacturingOrderNumber: string;
    itemId: string;
    quantity: number;
    dueDate: string;               
  }
}

export type IDateRange = {
    startDate: Date;
    endDate: Date;
}


export type IReflowResult = {
    updatedWorkOrders: IWorkOrder[];
    changes: any[];
    explanation: any[];
}