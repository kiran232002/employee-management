import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { EmployeeListComponent } from './employees/employee-list/employee-list.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { LeaveManagementComponent } from './leave/leave-management/leave-management.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'employee/list', 
    component: EmployeeListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'DEVELOPER', 'MANAGER'] }
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'projects', 
    component: ProjectListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['MANAGER', 'ADMIN'] }
  },
  { 
    path: 'leave', 
    component: LeaveManagementComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'attendance', 
    component: AttendanceComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
