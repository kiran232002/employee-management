import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AttendanceRecord, AttendanceCount } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  markAttendance(attendance: AttendanceRecord): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}/mark`, attendance)
      .pipe(catchError(this.handleError));
  }

  getAttendanceByEmployee(employeeId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/employee/${employeeId}`)
      .pipe(catchError(this.handleError));
  }

  getAttendanceByEmployeeAndDate(employeeId: number, date: string): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.baseUrl}/employee/${employeeId}/date/${date}`)
      .pipe(catchError(this.handleError));
  }

  getAttendanceCount(employeeId: number): Observable<AttendanceCount> {
    return this.http.get<AttendanceCount>(`${this.baseUrl}/employee/${employeeId}/count`)
      .pipe(catchError(this.handleError));
  }

  getAllAttendanceReports(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/all`)
      .pipe(catchError(this.handleError));
  }

  getAttendanceReportsByDate(date: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/date/${date}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Attendance Service Error:', error);
    if (error.status === 0) {
      console.error('Client-side error or network issue:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(error);
  }
}
