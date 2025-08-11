import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LeaveRequest } from '../models/employee.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private mockLeaveRequests: (LeaveRequest & { employeeId: number })[] = [
    {
      id: 1,
      employeeId: 65,
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      reason: 'Family vacation',
      status: 'APPROVED',
      employee: { id: 65, name: 'John Doe', email: 'john@example.com', designation: 'Senior Developer', department: 'IT', joiningDate: '2023-01-01', isAvailable: true, skills: 'Angular, TypeScript' }
    },
    {
      id: 2,
      employeeId: 65,
      startDate: '2024-04-10',
      endDate: '2024-04-12',
      reason: 'Medical appointment',
      status: 'PENDING',
      employee: { id: 65, name: 'John Doe', email: 'john@example.com', designation: 'Senior Developer', department: 'IT', joiningDate: '2023-01-01', isAvailable: true, skills: 'Angular, TypeScript' }
    },
    {
      id: 3,
      employeeId: 66,
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      reason: 'Personal work',
      status: 'REJECTED',
      employee: { id: 66, name: 'Jane Smith', email: 'jane@example.com', designation: 'Frontend Developer', department: 'IT', joiningDate: '2023-02-01', isAvailable: true, skills: 'React, JavaScript' }
    },
    {
      id: 4,
      employeeId: 67,
      startDate: '2024-05-01',
      endDate: '2024-05-03',
      reason: 'Wedding ceremony',
      status: 'PENDING',
      employee: { id: 67, name: 'Mike Johnson', email: 'mike@example.com', designation: 'Backend Developer', department: 'IT', joiningDate: '2023-03-01', isAvailable: true, skills: 'Node.js, Python' }
    }
  ];

  private nextId = 4;

  constructor(private authService: AuthService) {}

  applyLeave(employeeId: number, leaveRequest: Partial<LeaveRequest>): Observable<LeaveRequest> {
    const currentUser = this.authService.getCurrentUser();
    const newLeaveRequest = {
      id: this.nextId++,
      employeeId: employeeId,
      startDate: leaveRequest.startDate || '',
      endDate: leaveRequest.endDate || '',
      reason: leaveRequest.reason || '',
      status: 'PENDING',
      employee: {
        id: employeeId,
        name: currentUser?.name || 'Unknown User',
        email: currentUser?.email || 'unknown@example.com',
        designation: 'Developer',
        department: 'IT',
        joiningDate: '2023-01-01',
        isAvailable: true,
        skills: 'Angular, TypeScript'
      }
    };

    this.mockLeaveRequests.push(newLeaveRequest);
    console.log('Leave application submitted successfully!', newLeaveRequest);

    return of(newLeaveRequest).pipe(delay(500));
  }

  getLeavesByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    const employeeLeaves = this.mockLeaveRequests.filter(leave => leave.employeeId === employeeId);
    console.log(`Loaded ${employeeLeaves.length} leave requests for employee ${employeeId}`);

    return of(employeeLeaves.map(leave => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      employee: leave.employee
    }))).pipe(delay(300));
  }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    console.log(`Loaded ${this.mockLeaveRequests.length} total leave requests`);
    return of(this.mockLeaveRequests.map(leave => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      employee: leave.employee
    }))).pipe(delay(300));
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
