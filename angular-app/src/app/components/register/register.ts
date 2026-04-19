import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'] 
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  regData = {
    username: '',
    email: '',
    password: ''
  };
  errorMessage = '';

  onRegister() {
    if (this.regData.username && this.regData.password && this.regData.email) {
      this.authService.register(this.regData).subscribe({
        next: (res) => {
          console.log('Регистрация успешна!', res);
          alert('Аккаунт создан! Теперь войдите в систему.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Ошибка регистрации';
        }
      });
    } else {
      this.errorMessage = 'Заполните все протоколы данных';
    }
  }
}