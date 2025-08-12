import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { HeaderComponent } from './shared/header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { EmployeeListComponent } from './employees/employee-list/employee-list.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { LeaveManagementComponent } from './leave/leave-management/leave-management.component';
import { AttendanceComponent } from './attendance/attendance.component';

// Services
import { AuthService } from './services/auth.service';
import { EmployeeService } from './services/employee.service';
import { ProjectService } from './services/project.service';
import { LeaveService } from './services/leave.service';
import { AttendanceService } from './services/attendance.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    EmployeeListComponent,
    ProfileComponent,
    ProjectListComponent,
    LeaveManagementComponent,
    AttendanceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    EmployeeService,
    ProjectService,
    LeaveService,
    AttendanceService,
    AuthGuard,
    RoleGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
