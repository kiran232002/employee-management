import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceService } from '../services/attendance.service';
import { AuthService } from '../services/auth.service';
import { AttendanceRecord, AttendanceCount } from '../models/employee.model';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendanceForm: FormGroup;
  attendanceRecords: AttendanceRecord[] = [];
  allAttendanceReports: AttendanceRecord[] = [];
  attendanceCount: AttendanceCount = { presentCount: 0, absentCount: 0, totalCount: 0 };
  userRole = '';
  currentUser: any;
  loading = false;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {
    this.attendanceForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['Present', Validators.required],
      checkInTime: ['09:00'],
      checkOutTime: ['18:00']
    });

    this.currentUser = this.authService.getCurrentUser();
    this.userRole = this.currentUser?.role || '';
  }

  ngOnInit() {
    if (this.currentUser?.role === 'DEVELOPER' && this.currentUser?.employeeId) {
      // Load personal attendance for developers
      this.loadAttendanceRecords();
      this.loadAttendanceCount();
    } else if (this.currentUser?.role === 'MANAGER') {
      // Load all employee attendance reports for managers
      this.loadAllAttendanceReports();
    }
  }

  canMarkAttendance(): boolean {
    return this.userRole === 'DEVELOPER';
  }

  loadAttendanceRecords() {
    if (this.currentUser?.employeeId) {
      this.loading = true;
      this.attendanceService.getAttendanceByEmployee(this.currentUser.employeeId).subscribe(
        data => {
          this.attendanceRecords = data.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.loading = false;
        },
        error => {
          console.error('Error loading attendance records:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          this.attendanceRecords = []; // Set empty array if backend is not available
          this.loading = false;
        }
      );
    }
  }

  loadAttendanceCount() {
    if (this.currentUser?.employeeId) {
      this.attendanceService.getAttendanceCount(this.currentUser.employeeId).subscribe(
        data => {
          this.attendanceCount = data;
        },
        error => {
          console.error('Error loading attendance count:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          // Set default values if backend is not available
          this.attendanceCount = { presentCount: 0, absentCount: 0, totalCount: 0 };
        }
      );
    }
  }

  markAttendance() {
    if (this.attendanceForm.valid && this.currentUser?.employeeId) {
      const attendanceData = {
        employeeId: this.currentUser.employeeId,
        ...this.attendanceForm.value
      };

      this.attendanceService.markAttendance(attendanceData).subscribe(
        () => {
          alert('Attendance marked successfully!');
          // Reload data after marking attendance
          setTimeout(() => {
            this.loadAttendanceRecords();
            this.loadAttendanceCount();
          }, 500);
          this.attendanceForm.patchValue({
            date: new Date().toISOString().split('T')[0]
          });
        },
        error => {
          console.error('Error marking attendance:', error);
          alert('Error marking attendance. Please try again.');
        }
      );
    }
  }

  calculateHours(checkInTime: string, checkOutTime: string): string {
    if (!checkInTime || !checkOutTime) return '-';
    
    const checkIn = new Date(`1970-01-01T${checkInTime}:00`);
    const checkOut = new Date(`1970-01-01T${checkOutTime}:00`);
    
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMins}m`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'present' ? 'status-present' : 'status-absent';
  }

  canViewAllReports(): boolean {
    return this.userRole === 'MANAGER';
  }

  loadAllAttendanceReports() {
    this.loading = true;
    this.attendanceService.getAllAttendanceReports().subscribe(
      data => {
        this.allAttendanceReports = data.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.loading = false;
      },
      error => {
        console.error('Error loading attendance reports:', error);
        this.allAttendanceReports = [];
        this.loading = false;
        if (error.status === 0) {
          alert('Cannot connect to server. Please check if the backend is running.');
        }
      }
    );
  }

  filterByDate() {
    if (this.selectedDate) {
      this.loading = true;
      this.attendanceService.getAttendanceReportsByDate(this.selectedDate).subscribe(
        data => {
          this.allAttendanceReports = data;
          this.loading = false;
        },
        error => {
          console.error('Error loading attendance reports by date:', error);
          this.allAttendanceReports = [];
          this.loading = false;
        }
      );
    } else {
      this.loadAllAttendanceReports();
    }
  }
}
