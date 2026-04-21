import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginData = { username: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
  if (this.loginData.username && this.loginData.password) {
    this.authService.login({ username: this.loginData.username, password: this.loginData.password }).subscribe({
      next: (res) => {
        console.log('Успешный вход!', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Ошибка доступа';
        console.error(err);
      }
    });
  } else {
    this.errorMessage = 'Заполните все поля';
  }
}
}