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
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.allLeaveRequests = []; // Set empty array if backend is not available
        this.loading = false;

        // Show user-friendly message
        if (error.status === 0) {
          alert('Cannot connect to server. Please check if the backend is running.');
        }
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
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
}
