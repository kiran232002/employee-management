import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Project, Employee, ProjectAssignment } from '../../models/employee.model';
import { SafeErrorLogger } from '../../utils/safe-error-logger';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  employees: Employee[] = [];
  assignments: ProjectAssignment[] = [];

  projectForm: FormGroup;
  assignmentForm: FormGroup;

  showCreateProject = false;
  showAssignProject = false;
  showUpdateProject = false;
  editingProject: Project | null = null;
  userRole = '';
  updateProjectForm: FormGroup;
  Math = Math; // Make Math available in template

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['Active', Validators.required]
    });

    this.assignmentForm = this.fb.group({
      employeeId: ['', Validators.required],
      projectId: ['', Validators.required],
      role: ['', Validators.required],
      assignedBy: ['', Validators.required],
      remarks: ['']
    });

    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
    this.assignmentForm.patchValue({
      assignedBy: user?.name || ''
    });

    this.updateProjectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProjects();
    this.loadEmployees();
    this.loadAssignments();
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

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe(
      data => {
        this.employees = data;
      },
      error => {
        console.error('Error loading employees:', error);
      }
    );
  }

  loadAssignments() {
    this.projectService.getAllAssignments().subscribe(
      data => {
        console.log('Loaded assignments:', data);
        this.assignments = data;
      },
      error => {
        SafeErrorLogger.logHttpError('Loading project assignments', error);
        // Set empty array as fallback
        this.assignments = [];
      }
    );
  }

  canCreateProject(): boolean {
    return this.userRole === 'MANAGER';
  }

  canAssignProject(): boolean {
    return this.userRole === 'MANAGER';
  }

  openCreateProject() {
    this.showCreateProject = true;
    this.editingProject = null;
    this.projectForm.reset({ status: 'Active' });
  }

  openAssignProject() {
    this.showAssignProject = true;
    this.assignmentForm.reset({
      assignedBy: this.authService.getCurrentUser()?.name || ''
    });
  }

  createProject() {
    if (this.projectForm.valid) {
      this.projectService.createProject(this.projectForm.value).subscribe(
        () => {
          this.loadProjects();
          this.showCreateProject = false;
        },
        error => {
          console.error('Error creating project:', error);
        }
      );
    }
  }

  assignProject() {
    if (this.assignmentForm.valid) {
      const formData = this.assignmentForm.value;
      const assignmentData = {
        employeeId: parseInt(formData.employeeId),
        projectId: parseInt(formData.projectId),
        employeeName: this.employees.find(e => e.id == formData.employeeId)?.name || '',
        projectName: this.projects.find(p => p.id == formData.projectId)?.name || '',
        role: formData.role,
        assignedBy: formData.assignedBy,
        remarks: formData.remarks,
        active: true
      };

      this.projectService.assignProject(assignmentData).subscribe(
        () => {
          // Update employee availability status
          const employeeToUpdate = this.employees.find(e => e.id == formData.employeeId);
          if (employeeToUpdate) {
            const updatedEmployee = {
              name: employeeToUpdate.name,
              email: employeeToUpdate.email,
              designation: employeeToUpdate.designation,
              department: employeeToUpdate.department,
              joiningDate: employeeToUpdate.joiningDate,
              isAvailable: false, // Set to false when assigned to project
              skills: employeeToUpdate.skills
            };
            this.employeeService.updateEmployee(employeeToUpdate.id!, updatedEmployee).subscribe(
              () => {
                console.log('Employee status updated to in project');
                // Reload employees to show updated status
                this.loadEmployees();
                alert('Employee successfully assigned to project!');
              },
              error => {
                console.error('Error updating employee status:', error);
                alert('Project assigned but failed to update employee status');
              }
            );
          }

          this.loadAssignments();
          this.showAssignProject = false;
          this.assignmentForm.reset({
            assignedBy: this.authService.getCurrentUser()?.name || ''
          });
        },
        error => {
          console.error('Error assigning project:', error);
          alert('Error assigning project. Please try again.');
        }
      );
    }
  }

  getAssignedEmployees(projectId: number): ProjectAssignment[] {
    console.log('Getting assigned employees for project:', projectId);
    console.log('All assignments:', this.assignments);
    const filtered = this.assignments.filter(a => {
      console.log('Checking assignment:', a, 'projectId match:', a.projectId === projectId, 'active:', a.active);
      return a.projectId === projectId && a.active;
    });
    console.log('Filtered assignments for project', projectId, ':', filtered);
    return filtered;
  }

  openUpdateProject(project: Project) {
    this.editingProject = project;
    this.showUpdateProject = true;
    this.updateProjectForm.patchValue({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status
    });
  }

  updateProject() {
    if (this.updateProjectForm.valid && this.editingProject) {
      const formData = this.updateProjectForm.value;
      const currentProgress = this.getProjectProgress(this.editingProject);

      // Prepare update data with proper progress handling
      const updateData = {
        ...formData,
        progress: this.calculateProgressBasedOnStatus(formData.status, currentProgress, this.editingProject)
      };

      this.projectService.updateProject(this.editingProject.id!, updateData).subscribe(
        () => {
          this.loadProjects();
          this.showUpdateProject = false;
          this.editingProject = null;
        },
        error => {
          console.error('Error updating project:', error);
        }
      );
    }
  }

  calculateProgressBasedOnStatus(status: string, currentProgress: number, project: Project): number {
    switch (status.toLowerCase()) {
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      case 'planning':
        return 0;
      case 'on hold':
        // Store current progress when putting on hold
        return currentProgress;
      case 'active':
      default:
        // For active projects, recalculate based on time
        if (!project.startDate || !project.endDate) return 0;

        const start = new Date(project.startDate).getTime();
        const end = new Date(project.endDate).getTime();
        const now = new Date().getTime();

        if (now < start) return 0;
        if (now > end) return 100;

        return Math.round(((now - start) / (end - start)) * 100);
    }
  }

  closeUpdateForm() {
    this.showUpdateProject = false;
    this.editingProject = null;
    this.updateProjectForm.reset();
  }

  getProjectProgress(project: Project): number {
    // Handle different project statuses
    switch (project.status?.toLowerCase()) {
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      case 'planning':
        return 0;
      case 'on hold':
        // For "on hold" projects, use stored progress or 0
        return project.progress || 0;
      case 'active':
      default:
        // For active projects, calculate based on time with randomization
        return this.calculateRandomizedTimeProgress(project);
    }
  }

  calculateRandomizedTimeProgress(project: Project): number {
    if (!project.startDate || !project.endDate) return 0;

    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    // Base time progress
    const timeProgress = ((now - start) / (end - start)) * 100;

    // Add randomization based on project ID to make it consistent but varied
    const projectSeed = project.id || 1;
    const randomFactor = Math.sin(projectSeed * 1.234567) * 0.3; // -30% to +30% variation

    // Apply randomization
    let finalProgress = timeProgress + (randomFactor * 100);

    // Add some team size influence if we have assignments
    const teamMembers = this.getAssignedEmployees(project.id!);
    if (teamMembers.length > 0) {
      // More team members = slightly faster progress (up to 20% bonus)
      const teamBonus = Math.min(teamMembers.length * 3, 20);
      finalProgress += teamBonus;
    }

    // Ensure progress stays within realistic bounds
    finalProgress = Math.max(0, Math.min(100, finalProgress));

    console.log(`Project ${project.name}: Time-based progress with randomization = ${Math.round(finalProgress)}%`);

    return Math.round(finalProgress);
  }

  getDaysRemaining(project: Project): number {
    if (!project.endDate) return 0;

    const end = new Date(project.endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  autoCompleteProject(project: Project) {
    if (project.id && project.status !== 'Completed') {
      const updatedProject = {
        ...project,
        status: 'Completed',
        progress: 100
      };

      this.projectService.updateProject(project.id, updatedProject).subscribe(
        () => {
          console.log(`Project "${project.name}" auto-completed`);
          this.loadProjects(); // Refresh the project list
        },
        error => {
          console.error('Error auto-completing project:', error);
        }
      );
    }
  }
}
