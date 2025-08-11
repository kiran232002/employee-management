import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeDTO } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  createEmployee(employee: EmployeeDTO): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  updateEmployee(id: number, employee: EmployeeDTO): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getDeletedEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/deleted`);
  }

  searchBySkill(skill: string): Observable<Employee[]> {
    const params = new HttpParams().set('skill', skill);
    return this.http.get<Employee[]>(`${this.baseUrl}/searchBySkill`, { params });
  }

  searchByProjectAssigned(projectId: number): Observable<Employee[]> {
    const params = new HttpParams().set('projectId', projectId.toString());
    return this.http.get<Employee[]>(`${this.baseUrl}/searchByProjectAssigned`, { params });
  }
}
