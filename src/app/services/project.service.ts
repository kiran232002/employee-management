import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Project, ProjectAssignment } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = 'http://localhost:8080/api/projects';
  private assignmentUrl = 'http://localhost:8080/api/assignments';

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.patch<Project>(`${this.baseUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`);
  }

  // Project Assignment methods
  assignProject(assignment: ProjectAssignment): Observable<ProjectAssignment> {
    return this.http.post<ProjectAssignment>(this.assignmentUrl, assignment)
      .pipe(catchError(this.handleError));
  }

  getAllAssignments(): Observable<ProjectAssignment[]> {
    return this.http.get<ProjectAssignment[]>(this.assignmentUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Project Service Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error
    });

    if (error.status === 0) {
      console.warn('🔄 Backend not available (connection failed) - Project service');
    } else {
      console.error(`Backend returned code ${error.status} (${error.statusText}), URL: ${error.url}`);
      console.error('Response body:', error.error);
    }
    return throwError(error);
  }
}
