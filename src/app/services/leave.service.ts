import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LeaveRequest } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private mockLeaveRequests: LeaveRequest[] = [
    {
      id: 1,
      employeeId: 65,
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      reason: 'Family vacation',
      status: 'Approved',
      appliedDate: '2024-03-01'
    },
    {
      id: 2,
      employeeId: 65,
      startDate: '2024-04-10',
      endDate: '2024-04-12',
      reason: 'Medical appointment',
      status: 'Pending',
      appliedDate: '2024-04-05'
    },
    {
      id: 3,
      employeeId: 66,
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      reason: 'Personal work',
      status: 'Rejected',
      appliedDate: '2024-03-10'
    }
  ];

  private nextId = 4;

  constructor() {}

  applyLeave(employeeId: number, leaveRequest: Partial<LeaveRequest>): Observable<LeaveRequest> {
    const newLeaveRequest: LeaveRequest = {
      id: this.nextId++,
      employeeId: employeeId,
      startDate: leaveRequest.startDate || '',
      endDate: leaveRequest.endDate || '',
      reason: leaveRequest.reason || '',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    this.mockLeaveRequests.push(newLeaveRequest);
    console.log('Leave application submitted successfully!', newLeaveRequest);
    
    return of(newLeaveRequest).pipe(delay(500));
  }

  getLeavesByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    const employeeLeaves = this.mockLeaveRequests.filter(leave => leave.employeeId === employeeId);
    console.log(`Loaded ${employeeLeaves.length} leave requests for employee ${employeeId}`);
    
    return of(employeeLeaves).pipe(delay(300));
  }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    console.log(`Loaded ${this.mockLeaveRequests.length} total leave requests`);
    return of(this.mockLeaveRequests).pipe(delay(300));
  }

  updateLeaveStatus(leaveId: number, status: string): Observable<boolean> {
    const leaveIndex = this.mockLeaveRequests.findIndex(leave => leave.id === leaveId);
    
    if (leaveIndex !== -1) {
      this.mockLeaveRequests[leaveIndex].status = status;
      console.log(`Leave request ${leaveId} status updated to ${status}`);
      return of(true).pipe(delay(500));
    } else {
      console.error(`Leave request ${leaveId} not found`);
      return of(false).pipe(delay(500));
    }
  }
}
