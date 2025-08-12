import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { LeaveRequest } from '../models/employee.model';
import { AuthService } from './auth.service';
import { SafeErrorLogger } from '../utils/safe-error-logger';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl = 'http://localhost:8080/api/leaves';
  private backendAvailable = true;
  
  // Mock data for fallback
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

  private nextId = 5;

  constructor(private http: HttpClient, private authService: AuthService) {}

  applyLeave(employeeId: number, leaveRequest: Partial<LeaveRequest>): Observable<LeaveRequest> {
    const leaveData = {
      employeeId: employeeId,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reason: leaveRequest.reason,
      status: 'PENDING'
    };
    
    if (this.backendAvailable) {
      return this.http.post<LeaveRequest>(`${this.baseUrl}/apply/${employeeId}`, leaveData)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.applyLeaveFallback(employeeId, leaveRequest)))
        );
    } else {
      return this.applyLeaveFallback(employeeId, leaveRequest);
    }
  }

  getLeavesByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    if (this.backendAvailable) {
      return this.http.get<LeaveRequest[]>(`${this.baseUrl}/employee/${employeeId}`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getLeavesByEmployeeFallback(employeeId)))
        );
    } else {
      return this.getLeavesByEmployeeFallback(employeeId);
    }
  }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    if (this.backendAvailable) {
      return this.http.get<LeaveRequest[]>(`${this.baseUrl}/all`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getAllLeaveRequestsFallback()))
        );
    } else {
      return this.getAllLeaveRequestsFallback();
    }
  }

  updateLeaveStatus(leaveId: number, status: string): Observable<boolean> {
    if (this.backendAvailable) {
      return this.http.put<boolean>(`${this.baseUrl}/update-status/${leaveId}`, { status: status })
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.updateLeaveStatusFallback(leaveId, status)))
        );
    } else {
      return this.updateLeaveStatusFallback(leaveId, status);
    }
  }

  // Fallback methods using mock data
  private applyLeaveFallback(employeeId: number, leaveRequest: Partial<LeaveRequest>): Observable<LeaveRequest> {
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
    console.log('✓ Leave application submitted successfully! (Using mock data)', newLeaveRequest);
    
    return of(newLeaveRequest).pipe(delay(500));
  }

  private getLeavesByEmployeeFallback(employeeId: number): Observable<LeaveRequest[]> {
    const employeeLeaves = this.mockLeaveRequests.filter(leave => leave.employeeId === employeeId);
    console.log(`✓ Loaded ${employeeLeaves.length} leave requests for employee ${employeeId} (Using mock data)`);
    
    return of(employeeLeaves.map(leave => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      employee: leave.employee
    }))).pipe(delay(300));
  }

  private getAllLeaveRequestsFallback(): Observable<LeaveRequest[]> {
    console.log(`✓ Loaded ${this.mockLeaveRequests.length} total leave requests (Using mock data)`);
    return of(this.mockLeaveRequests.map(leave => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      employee: leave.employee
    }))).pipe(delay(300));
  }

  private updateLeaveStatusFallback(leaveId: number, status: string): Observable<boolean> {
    const leaveIndex = this.mockLeaveRequests.findIndex(leave => leave.id === leaveId);
    
    if (leaveIndex !== -1) {
      this.mockLeaveRequests[leaveIndex].status = status.toUpperCase();
      console.log(`✓ Leave request ${leaveId} status updated to ${status.toUpperCase()} (Using mock data)`);
      return of(true).pipe(delay(500));
    } else {
      console.error(`✗ Leave request ${leaveId} not found (Using mock data)`);
      return of(false).pipe(delay(500));
    }
  }

  private handleErrorWithFallback<T>(error: HttpErrorResponse, fallbackFn: () => Observable<T>): Observable<T> {
    SafeErrorLogger.logHttpError('Leave Service API Error', error);

    if (error.status === 0) {
      console.warn('🔄 Backend not available, switching to mock data mode');
      this.backendAvailable = false;
      return fallbackFn();
    } else {
      return throwError(error);
    }
  }

  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }
}
