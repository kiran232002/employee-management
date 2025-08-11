import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Employee, EmployeeDTO, Project } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  projects: Project[] = [];
  filteredEmployees: Employee[] = [];
  searchForm: FormGroup;
  employeeForm: FormGroup;
  showCreateForm = false;
  editingEmployee: Employee | null = null;
  loading = false;
  userRole = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.searchForm = this.fb.group({
      searchType: ['name'],
      searchValue: [''],
      projectId: ['']
    });

    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      joiningDate: ['', Validators.required],
      isAvailable: [true],
      skills: ['', Validators.required]
    });

    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadProjects();
    this.setupSearchSubscription();
  }

  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(() => {
      this.performSearch();
    });
  }

  loadEmployees() {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe(
      data => {
        this.employees = data;
        this.filteredEmployees = data;
        this.loading = false;
      },
      error => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    );
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe(
      data => {
        this.projects = data;
      },
      error => {
        console.error('Error loading projects:', error);
      }
    );
  }

  performSearch() {
    const searchType = this.searchForm.get('searchType')?.value;
    const searchValue = this.searchForm.get('searchValue')?.value;
    const projectId = this.searchForm.get('projectId')?.value;

    if (!searchValue && !projectId) {
      this.filteredEmployees = this.employees;
      return;
    }

    if (searchType === 'skill' && searchValue) {
      this.employeeService.searchBySkill(searchValue).subscribe(
        data => {
          this.filteredEmployees = data;
        },
        error => {
          console.error('Error searching by skill:', error);
        }
      );
    } else if (searchType === 'project' && projectId) {
      this.employeeService.searchByProjectAssigned(projectId).subscribe(
        data => {
          this.filteredEmployees = data;
        },
        error => {
          console.error('Error searching by project:', error);
        }
      );
    } else if (searchValue) {
      this.filteredEmployees = this.employees.filter(emp =>
        emp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchValue.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  }

  canCreateEmployee(): boolean {
    return this.userRole === 'ADMIN';
  }

  canDeleteEmployee(): boolean {
    return this.userRole === 'ADMIN';
  }

  canSearchBySkill(): boolean {
    return this.userRole === 'MANAGER';
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.editingEmployee = null;
    this.employeeForm.reset({
      isAvailable: true
    });
  }

  editEmployee(employee: Employee) {
    this.editingEmployee = employee;
    this.showCreateForm = true;
    this.employeeForm.patchValue({
      name: employee.name,
      email: employee.email,
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate,
      isAvailable: employee.isAvailable,
      skills: employee.skills
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const formData: EmployeeDTO = this.employeeForm.value;
      
      if (this.editingEmployee) {
        this.employeeService.updateEmployee(this.editingEmployee.id!, formData).subscribe(
          () => {
            this.loadEmployees();
            this.closeForm();
          },
          error => {
            console.error('Error updating employee:', error);
          }
        );
      } else {
        this.employeeService.createEmployee(formData).subscribe(
          () => {
            this.loadEmployees();
            this.closeForm();
          },
          error => {
            console.error('Error creating employee:', error);
          }
        );
      }
    }
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe(
        () => {
          this.loadEmployees();
        },
        error => {
          console.error('Error deleting employee:', error);
        }
      );
    }
  }

  closeForm() {
    this.showCreateForm = false;
    this.editingEmployee = null;
    this.employeeForm.reset();
  }
}
