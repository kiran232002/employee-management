export interface Employee {
  id?: number;
  name: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: string;
  isAvailable: boolean;
  skills: string;
  project?: Project;
}

export interface EmployeeDTO {
  name: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: string;
  isAvailable: boolean;
  skills: string;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  progress?: number;
}

export interface LeaveRequest {
  id?: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  employee?: Employee;
}

export interface AttendanceRecord {
  employeeId: number;
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface AttendanceCount {
  presentCount: number;
  absentCount: number;
  totalCount?: number;
}

export interface ProjectAssignment {
  id?: number;
  employeeId: number;
  projectId: number;
  employeeName: string;
  projectName: string;
  role: string;
  assignedBy: string;
  remarks?: string;
  active: boolean;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'DEVELOPER' | 'MANAGER';
  employeeId?: number | undefined;
}
