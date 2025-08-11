import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { EmployeeService } from '../services/employee.service';
import { ProjectService } from '../services/project.service';
import { LeaveService } from '../services/leave.service';
import { AttendanceService } from '../services/attendance.service';
import { Employee, User, Project, LeaveRequest, AttendanceCount } from '../models/employee.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  employee: Employee | null = null;
  assignedProjects: Project[] = [];
  leaveRequests: LeaveRequest[] = [];
  attendanceCount: AttendanceCount = { presentCount: 0, absentCount: 0, totalCount: 0 };
  
  profileForm: FormGroup;
  leaveForm: FormGroup;
  attendanceForm: FormGroup;
  
  showEditProfile = false;
  showLeaveForm = false;
  showAttendanceForm = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private leaveService: LeaveService,
    private attendanceService: AttendanceService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      skills: ['', Validators.required]
    });

    this.leaveForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    });

    this.attendanceForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['Present', Validators.required],
      checkInTime: ['09:00'],
      checkOutTime: ['18:00']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.employeeId) {
      this.loadEmployeeData();

      // Only load leave and attendance data for actual employees (DEVELOPER role)
      if (this.currentUser.role === 'DEVELOPER') {
        this.loadLeaveRequests();
        this.loadAttendanceCount();
      }
    }
  }

  loadEmployeeData() {
    if (this.currentUser?.employeeId) {
      if (this.currentUser.role === 'MANAGER') {
        // Create dummy profile for manager
        this.employee = {
          id: this.currentUser.employeeId,
          name: this.currentUser.name,
          email: this.currentUser.email,
          designation: 'Project Manager',
          department: 'Management',
          joiningDate: '2023-01-01',
          isAvailable: true,
          skills: 'Project Management, Team Leadership, Strategic Planning'
        };
        this.profileForm.patchValue({
          name: this.employee.name,
          email: this.employee.email,
          designation: this.employee.designation,
          department: this.employee.department,
          skills: this.employee.skills
        });
      } else {
        this.employeeService.getEmployeeById(this.currentUser.employeeId).subscribe(
          employee => {
            this.employee = employee;
            this.profileForm.patchValue({
              name: employee.name,
              email: employee.email,
              designation: employee.designation,
              department: employee.department,
              skills: employee.skills
            });
          },
          error => {
            console.error('Error loading employee data:', error);
          }
        );
      }
    }
  }

  loadLeaveRequests() {
    if (this.currentUser?.employeeId) {
      this.leaveService.getLeavesByEmployee(this.currentUser.employeeId).subscribe(
        requests => {
          this.leaveRequests = requests;
        },
        error => {
          console.error('Error loading leave requests:', error);
          this.leaveRequests = [];
        }
      );
    }
  }

  loadAttendanceCount() {
    if (this.currentUser?.employeeId) {
      this.attendanceService.getAttendanceCount(this.currentUser.employeeId).subscribe(
        count => {
          this.attendanceCount = count;
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

  canApplyLeave(): boolean {
    return this.currentUser?.role === 'DEVELOPER';
  }

  canFillAttendance(): boolean {
    return this.currentUser?.role === 'DEVELOPER';
  }

  canViewProjects(): boolean {
    return true; // All users can view assigned projects
  }

  updateProfile() {
    if (this.profileForm.valid && this.employee?.id) {
      this.employeeService.updateEmployee(this.employee.id, this.profileForm.value).subscribe(
        () => {
          this.loadEmployeeData();
          this.showEditProfile = false;
        },
        error => {
          console.error('Error updating profile:', error);
        }
      );
    }
  }

  applyLeave() {
    if (this.leaveForm.valid && this.currentUser?.employeeId) {
      this.leaveService.applyLeave(this.currentUser.employeeId, this.leaveForm.value).subscribe(
        () => {
          alert('Leave application submitted successfully!');
          this.loadLeaveRequests();
          this.showLeaveForm = false;
          this.leaveForm.reset();
        },
        error => {
          console.error('Error applying for leave:', error);
          alert('Error submitting leave application. Please try again.');
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
          this.loadAttendanceCount();
          this.showAttendanceForm = false;
          this.attendanceForm.patchValue({
            date: new Date().toISOString().split('T')[0]
          });
        },
        error => {
          console.error('Error marking attendance:', error);
        }
      );
    }
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }

}
