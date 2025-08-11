import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { AttendanceRecord, AttendanceCount } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = 'http://localhost:8080/api/attendance';
  private backendAvailable = true;

  // Mock data for fallback
  private mockAttendanceRecords: AttendanceRecord[] = [
    { employeeId: 65, date: '2024-03-15', status: 'Present', checkInTime: '09:00', checkOutTime: '18:00' },
    { employeeId: 65, date: '2024-03-14', status: 'Present', checkInTime: '09:15', checkOutTime: '17:45' },
    { employeeId: 65, date: '2024-03-13', status: 'Absent' },
    { employeeId: 66, date: '2024-03-15', status: 'Present', checkInTime: '08:45', checkOutTime: '17:30' },
    { employeeId: 66, date: '2024-03-14', status: 'Present', checkInTime: '09:00', checkOutTime: '18:15' },
    { employeeId: 67, date: '2024-03-15', status: 'Present', checkInTime: '09:30', checkOutTime: '18:30' },
    { employeeId: 67, date: '2024-03-14', status: 'Absent' }
  ];

  constructor(private http: HttpClient) {}

  markAttendance(attendance: AttendanceRecord): Observable<AttendanceRecord> {
    if (this.backendAvailable) {
      return this.http.post<AttendanceRecord>(`${this.baseUrl}/mark`, attendance)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.markAttendanceFallback(attendance)))
        );
    } else {
      return this.markAttendanceFallback(attendance);
    }
  }

  getAttendanceByEmployee(employeeId: number): Observable<AttendanceRecord[]> {
    if (this.backendAvailable) {
      return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/employee/${employeeId}`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getAttendanceByEmployeeFallback(employeeId)))
        );
    } else {
      return this.getAttendanceByEmployeeFallback(employeeId);
    }
  }

  getAttendanceByEmployeeAndDate(employeeId: number, date: string): Observable<AttendanceRecord> {
    if (this.backendAvailable) {
      return this.http.get<AttendanceRecord>(`${this.baseUrl}/employee/${employeeId}/date/${date}`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getAttendanceByEmployeeAndDateFallback(employeeId, date)))
        );
    } else {
      return this.getAttendanceByEmployeeAndDateFallback(employeeId, date);
    }
  }

  getAttendanceCount(employeeId: number): Observable<AttendanceCount> {
    if (this.backendAvailable) {
      return this.http.get<AttendanceCount>(`${this.baseUrl}/employee/${employeeId}/count`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getAttendanceCountFallback(employeeId)))
        );
    } else {
      return this.getAttendanceCountFallback(employeeId);
    }
  }

  getAllAttendanceReports(): Observable<AttendanceRecord[]> {
    if (this.backendAvailable) {
      return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/all`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getAllAttendanceReportsFallback()))
        );
    } else {
      return this.getAllAttendanceReportsFallback();
    }
  }

  getAttendanceReportsByDate(date: string): Observable<AttendanceRecord[]> {
    if (this.backendAvailable) {
      return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/date/${date}`)
        .pipe(
          catchError(error => this.handleErrorWithFallback(error, () => this.getAttendanceReportsByDateFallback(date)))
        );
    } else {
      return this.getAttendanceReportsByDateFallback(date);
    }
  }

  // Fallback methods using mock data
  private markAttendanceFallback(attendance: AttendanceRecord): Observable<AttendanceRecord> {
    // Remove existing record for same employee and date
    this.mockAttendanceRecords = this.mockAttendanceRecords.filter(
      record => !(record.employeeId === attendance.employeeId && record.date === attendance.date)
    );
    
    // Add new record
    this.mockAttendanceRecords.push(attendance);
    console.log('✓ Attendance marked successfully! (Using mock data)', attendance);
    
    return of(attendance).pipe(delay(500));
  }

  private getAttendanceByEmployeeFallback(employeeId: number): Observable<AttendanceRecord[]> {
    const employeeRecords = this.mockAttendanceRecords.filter(record => record.employeeId === employeeId);
    console.log(`✓ Loaded ${employeeRecords.length} attendance records for employee ${employeeId} (Using mock data)`);
    
    return of(employeeRecords).pipe(delay(300));
  }

  private getAttendanceByEmployeeAndDateFallback(employeeId: number, date: string): Observable<AttendanceRecord> {
    const record = this.mockAttendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
    console.log(`✓ Loaded attendance record for employee ${employeeId} on ${date} (Using mock data)`, record);
    
    return of(record || { employeeId, date, status: 'Absent' }).pipe(delay(300));
  }

  private getAttendanceCountFallback(employeeId: number): Observable<AttendanceCount> {
    const employeeRecords = this.mockAttendanceRecords.filter(record => record.employeeId === employeeId);
    const presentCount = employeeRecords.filter(record => record.status === 'Present').length;
    const absentCount = employeeRecords.filter(record => record.status === 'Absent').length;
    
    const count: AttendanceCount = {
      presentCount,
      absentCount,
      totalCount: presentCount + absentCount
    };
    
    console.log(`✓ Loaded attendance count for employee ${employeeId} (Using mock data)`, count);
    return of(count).pipe(delay(300));
  }

  private getAllAttendanceReportsFallback(): Observable<AttendanceRecord[]> {
    console.log(`✓ Loaded ${this.mockAttendanceRecords.length} total attendance reports (Using mock data)`);
    return of([...this.mockAttendanceRecords]).pipe(delay(300));
  }

  private getAttendanceReportsByDateFallback(date: string): Observable<AttendanceRecord[]> {
    const dateRecords = this.mockAttendanceRecords.filter(record => record.date === date);
    console.log(`✓ Loaded ${dateRecords.length} attendance reports for date ${date} (Using mock data)`);
    
    return of(dateRecords).pipe(delay(300));
  }

  private handleErrorWithFallback<T>(error: HttpErrorResponse, fallbackFn: () => Observable<T>): Observable<T> {
    console.error('Backend API Error:', error);
    
    if (error.status === 0) {
      console.warn('🔄 Backend not available, switching to mock data mode');
      this.backendAvailable = false;
      return fallbackFn();
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      return throwError(error);
    }
  }

  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }
}
