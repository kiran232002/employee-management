import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userRole = user?.role || '';
    });
  }

  canAccessProfile(): boolean {
    return ['DEVELOPER', 'MANAGER'].includes(this.userRole);
  }

  canAccessEmployeeList(): boolean {
    return ['ADMIN', 'MANAGER'].includes(this.userRole);
  }

  canAccessProjects(): boolean {
    return ['MANAGER'].includes(this.userRole);
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
