import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  login(email: string, password: string): Observable<any> {
    // Check if it's admin or manager first (hardcoded)
    const adminManagerUsers = [
      { id: 1, email: 'admin@company.com', password: 'admin123', name: 'System Admin', role: 'ADMIN' as const, employeeId: undefined },
      { id: 2, email: 'manager@company.com', password: 'manager123', name: 'Project Manager', role: 'MANAGER' as const, employeeId: undefined }
    ];

    const adminManagerUser = adminManagerUsers.find(u => u.email === email && u.password === password);

    if (adminManagerUser) {
      const { password, ...userWithoutPassword } = adminManagerUser;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      this.currentUserSubject.next(userWithoutPassword);
      return of({ success: true, user: userWithoutPassword });
    }

    // For other users, fetch from employee database
    return this.authenticateEmployee(email, password);
  }

  private authenticateEmployee(email: string, password: string): Observable<any> {
    // First get all employees from the database
    return this.http.get<any[]>(`http://localhost:8080/api/employees`).pipe(
      map(employees => {
        console.log('Fetched employees:', employees);
        console.log('Trying to login with:', email, password);

        // Find employee where email matches and password matches the employee name
        const employee = employees.find(emp =>
          emp.email === email && emp.name === password
        );

        console.log('Found employee:', employee);

        if (employee) {
          const user = {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: 'DEVELOPER' as const,
            employeeId: employee.id
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return { success: true, user };
        } else {
          return { success: false, message: 'Invalid credentials' };
        }
      }),
      catchError(error => {
        console.error('Authentication error:', error);
        // If backend is not available, create a dummy employee for testing
        if (email && password) {
          const user = {
            id: 999,
            email: email,
            name: password,
            role: 'DEVELOPER' as const,
            employeeId: 999
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return of({ success: true, user });
        }
        return of({ success: false, message: 'Backend not available. Try: test@example.com / Test User' });
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getRedirectUrl(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';
    
    switch (user.role) {
      case 'ADMIN':
      case 'MANAGER':
        return '/employee/list';
      case 'DEVELOPER':
        return '/profile';
      default:
        return '/profile';
    }
  }
}
