import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LeaveRequest } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  applyLeave(employeeId: number, leaveRequest: Partial<LeaveRequest>): Observable<LeaveRequest> {
    const leaveData = {
      employeeId: employeeId,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reason: leaveRequest.reason,
      status: 'PENDING'
    };
    
    return this.http.post<LeaveRequest>(`${this.baseUrl}/apply/${employeeId}`, leaveData)
      .pipe(catchError(this.handleError));
  }

  getLeavesByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/employee/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.baseUrl}/all`)
      .pipe(catchError(this.handleError));
  }

  updateLeaveStatus(leaveId: number, status: string): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/update-status/${leaveId}`, { status: status })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Leave Service Error:', error);
    if (error.status === 0) {
      console.error('Client-side error or network issue:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(error);
  }
}
