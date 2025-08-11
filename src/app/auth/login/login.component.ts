import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe(
        response => {
          this.loading = false;
          if (response.success) {
            const redirectUrl = this.authService.getRedirectUrl();
            this.router.navigate([redirectUrl]);
          } else {
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error => {
          this.loading = false;
          this.errorMessage = 'Login failed. Please try again.';
        }
      );
    }
  }

  fillDemoCredentials(userType: string) {
    switch (userType) {
      case 'admin':
        this.loginForm.patchValue({
          email: 'admin@company.com',
          password: 'admin123'
        });
        break;
      case 'manager':
        this.loginForm.patchValue({
          email: 'manager@company.com',
          password: 'manager123'
        });
        break;
    }
  }
}
