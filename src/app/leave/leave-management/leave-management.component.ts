import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';
import { LeaveRequest } from '../../models/employee.model';

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {
  allLeaveRequests: LeaveRequest[] = [];
  userRole = '';
  loading = false;

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
  }

  ngOnInit() {
    if (this.canManageLeaves()) {
      this.loadAllLeaveRequests();
    }
  }

  canManageLeaves(): boolean {
    return this.userRole === 'MANAGER';
  }

  loadAllLeaveRequests() {
    this.loading = true;
    this.leaveService.getAllLeaveRequests().subscribe(
      data => {
        this.allLeaveRequests = data;
        this.loading = false;
      },
      error => {
        console.error('Error loading leave requests:', error);
        this.allLeaveRequests = [];
        this.loading = false;
        alert('Error loading leave requests. Please try again.');
      }
    );
  }

  updateLeaveStatus(leaveId: number, status: string) {
    if (confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      this.leaveService.updateLeaveStatus(leaveId, status).subscribe(
        (response) => {
          if (response) {
            this.loadAllLeaveRequests();
            alert(`Leave request has been ${status.toLowerCase()} successfully.`);
          } else {
            alert('Failed to update leave status.');
          }
        },
        error => {
          console.error('Error updating leave status:', error);
          alert('Error updating leave status. Please try again.');
        }
      );
    }
  }

  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
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
