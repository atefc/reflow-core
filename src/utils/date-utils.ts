import {DateTime} from 'luxon';
import { IShift } from '../reflow/types';

export const calculateEndDateWithShifts = (startDate: DateTime, duration: number, shifts: IShift[]): DateTime => {
    
}

export const calculateWorkerTimeRangeBasedOnMaintenanceWindows = (startDate: DateTime, duration: number, maintenanceWindows: Array<{ startDate: string; endDate: string }>): DateTime => {
    
}

export const recalculateTimeRangeBasedOnConflicts = (startDate: DateTime, duration: number, maintenanceWindows: Array<{ startDate: string; endDate: string }>): DateTime => {
    
}